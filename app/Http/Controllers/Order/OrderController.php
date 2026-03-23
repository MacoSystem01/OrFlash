<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    // =========================================================================
    // CLIENTE
    // =========================================================================

    /**
     * Crear pedido — llamado desde checkout
     */
    public function store(Request $request)
    {
        $request->validate([
            'store_id'    => 'required|exists:stores,id',
            'items'       => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'delivery_fee'       => 'required|integer|min:0',
        ]);

        $store = Store::where('status', 'active')
            ->findOrFail($request->store_id);

        DB::beginTransaction();

        try {
            // Verificar stock y calcular subtotal
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $product = Product::where('store_id', $store->id)
                    ->where('is_available', true)
                    ->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw new \Exception(
                        "Stock insuficiente para \"{$product->name}\". Disponible: {$product->stock}"
                    );
                }

                $lineTotal = $product->price * $item['quantity'];
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'product'  => $product,
                    'quantity' => $item['quantity'],
                    'subtotal' => $lineTotal,
                ];
            }

            // Calcular comisiones
            $commissions = Order::calculateCommissions(
                $subtotal,
                $request->delivery_fee
            );

            // Obtener perfil del cliente para dirección
            $client  = Auth::user();
            $profile = $client->clientProfile;

            // Crear la orden
            $order = Order::create([
                'client_id'             => $client->id,
                'store_id'              => $store->id,
                'status'                => 'pending_payment',
                'payment_status'        => 'pending',
                'delivery_address'      => $profile?->address      ?? $request->delivery_address,
                'delivery_neighborhood' => $profile?->neighborhood  ?? null,
                'delivery_city'         => $profile?->city          ?? null,
                'delivery_references'   => $profile?->references    ?? null,
                ...$commissions,
            ]);

            // Crear items y descontar stock
            foreach ($itemsData as $item) {
                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'unit_price'   => $item['product']->price,
                    'quantity'     => $item['quantity'],
                    'subtotal'     => $item['subtotal'],
                ]);

                // Descontar stock
                $item['product']->decrementStock($item['quantity']);
            }

            DB::commit();

            // Retornar el ID de la orden para redirigir a Wompi
            return response()->json([
                'order_id'  => $order->id,
                'total'     => $order->total,
                'reference' => 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Historial de pedidos del cliente
     */
    public function clientOrders()
    {
        $orders = Order::forClient(Auth::id())
            ->with(['store:id,business_name', 'items'])
            ->latest()
            ->get();

        return Inertia::render('client/orders', [
            'orders' => $orders,
        ]);
    }

    /**
     * Tracking de un pedido específico
     */
    public function tracking(int $orderId)
    {
        $order = Order::forClient(Auth::id())
            ->with([
                'store:id,business_name,address',
                'driver:id,name,phone',
                'items',
            ])
            ->findOrFail($orderId);

        return Inertia::render('client/order-tracking', [
            'order' => $order,
        ]);
    }

    /**
     * Detalle de una tienda con sus productos — para el cliente
     */
    public function storeDetail(int $storeId)
    {
        $store = Store::where('status', 'active')
            ->findOrFail($storeId);

        $products = Product::fromStore($storeId)
            ->where('is_available', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return Inertia::render('client/store-detail', [
            'store'    => $store,
            'products' => $products,
        ]);
    }

    // =========================================================================
    // TIENDA
    // =========================================================================

    /**
     * Bandeja de pedidos activos de la tienda
     */
    public function storeOrders(int $storeId)
    {
        $store = Store::where('user_id', Auth::id())
            ->findOrFail($storeId);

        $orders = Order::forStore($storeId)
            ->whereIn('status', ['pending', 'confirmed', 'preparing', 'ready'])
            ->with(['client:id,name,phone', 'items'])
            ->latest()
            ->get();

        $stores = Store::where('user_id', Auth::id())
            ->get(['id', 'business_name']);

        return Inertia::render('store/orders', [
            'store'  => $store,
            'stores' => $stores,
            'orders' => $orders,
        ]);
    }

    /**
     * Avanzar estado del pedido — acción de la tienda
     */
    public function advanceOrder(int $storeId, int $orderId)
    {
        Store::where('user_id', Auth::id())->findOrFail($storeId);

        $order = Order::forStore($storeId)
            ->findOrFail($orderId);

        if (!$order->advanceStatus()) {
            return back()->withErrors([
                'error' => 'No se puede avanzar el estado de este pedido.',
            ]);
        }

        return back()->with('success', 'Estado del pedido actualizado.');
    }

    /**
     * Historial de pedidos completados de la tienda
     */
    public function storeHistory(int $storeId)
    {
        $store = Store::where('user_id', Auth::id())
            ->findOrFail($storeId);

        $orders = Order::forStore($storeId)
            ->whereIn('status', ['delivered', 'cancelled'])
            ->with(['client:id,name', 'items'])
            ->latest()
            ->get();

        $stores = Store::where('user_id', Auth::id())
            ->get(['id', 'business_name']);

        $totalRevenue = $orders
            ->where('status', 'delivered')
            ->sum('store_earnings');

        return Inertia::render('store/history', [
            'store'        => $store,
            'stores'       => $stores,
            'orders'       => $orders,
            'totalRevenue' => $totalRevenue,
        ]);
    }

    /**
     * Dashboard de la tienda con métricas reales
     */
    public function storeDashboard(int $storeId)
    {
        $store = Store::where('user_id', Auth::id())
            ->findOrFail($storeId);

        $activeOrders = Order::forStore($storeId)
            ->whereIn('status', ['pending', 'confirmed', 'preparing', 'ready'])
            ->with(['client:id,name', 'items'])
            ->latest()
            ->get();

        $todayRevenue = Order::forStore($storeId)
            ->where('status', 'delivered')
            ->whereDate('delivered_at', today())
            ->sum('store_earnings');

        $todayDelivered = Order::forStore($storeId)
            ->where('status', 'delivered')
            ->whereDate('delivered_at', today())
            ->count();

        $stores = Store::where('user_id', Auth::id())
            ->get(['id', 'business_name']);

        return Inertia::render('store/dashboard', [
            'store'         => $store,
            'stores'        => $stores,
            'activeOrders'  => $activeOrders,
            'todayRevenue'  => $todayRevenue,
            'todayDelivered' => $todayDelivered,
        ]);
    }

    /**
     * Toggle estado abierto/cerrado de la tienda
     */
    public function toggleStoreStatus(int $storeId)
    {
        $store = Store::where('user_id', Auth::id())
            ->findOrFail($storeId);

        $store->update(['is_open' => !$store->is_open]);

        return back()->with(
            'success',
            $store->is_open ? 'Tienda abierta.' : 'Tienda cerrada.'
        );
    }

    // =========================================================================
    // DRIVER
    // =========================================================================

    /**
     * Pedidos disponibles para el driver
     */
    public function availableOrders()
    {
        // Verificar que el driver no tenga más de 3 pedidos activos
        $activeCount = Order::forDriver(Auth::id())
            ->whereIn('status', ['picked_up', 'in_transit'])
            ->count();

        $orders = [];

        if ($activeCount < 3) {
            $orders = Order::availableForDriver()
                ->with([
                    'store:id,business_name,address',
                    'items',
                ])
                ->latest()
                ->get();
        }

        $myActiveOrders = Order::forDriver(Auth::id())
            ->whereIn('status', ['picked_up', 'in_transit'])
            ->with(['store:id,business_name,address', 'client:id,name,phone'])
            ->get();

        return Inertia::render('driver/available-orders', [
            'availableOrders' => $orders,
            'myActiveOrders'  => $myActiveOrders,
            'activeCount'     => $activeCount,
            'canAcceptMore'   => $activeCount < 3,
        ]);
    }

    /**
     * Driver acepta un pedido
     */
    public function acceptOrder(int $orderId)
    {
        // Verificar límite de 3 pedidos activos
        $activeCount = Order::forDriver(Auth::id())
            ->whereIn('status', ['picked_up', 'in_transit'])
            ->count();

        if ($activeCount >= 3) {
            return back()->withErrors([
                'error' => 'Ya tienes 3 pedidos activos. Completa uno antes de aceptar otro.',
            ]);
        }

        $order = Order::availableForDriver()
            ->findOrFail($orderId);

        $order->update([
            'driver_id'   => Auth::id(),
            'status'      => 'picked_up',
            'picked_up_at' => now(),
        ]);

        return back()->with('success', 'Pedido aceptado. ¡Dirígete a la tienda!');
    }

    /**
     * Driver avanza el estado de su pedido
     */
    public function driverAdvanceOrder(int $orderId)
    {
        $order = Order::forDriver(Auth::id())
            ->whereIn('status', ['picked_up', 'in_transit'])
            ->findOrFail($orderId);

        if (!$order->advanceStatus()) {
            return back()->withErrors([
                'error' => 'No se puede avanzar el estado.',
            ]);
        }

        // Si se entregó, liberar wallets
        if ($order->isDelivered()) {
            $this->releaseWallets($order);
        }

        return back()->with('success', 'Estado actualizado correctamente.');
    }

    /**
     * Pedido activo actual del driver
     */
    public function currentOrder()
    {
        $order = Order::forDriver(Auth::id())
            ->whereIn('status', ['picked_up', 'in_transit'])
            ->with([
                'store:id,business_name,address',
                'client:id,name,phone',
                'items',
            ])
            ->latest()
            ->first();

        return Inertia::render('driver/current-order', [
            'order' => $order,
        ]);
    }

    /**
     * Historial de entregas del driver
     */
    public function driverHistory()
    {
        $orders = Order::forDriver(Auth::id())
            ->where('status', 'delivered')
            ->with(['store:id,business_name', 'client:id,name'])
            ->latest()
            ->get();

        $totalEarnings = $orders->sum('driver_earnings');
        $totalDeliveries = $orders->count();

        return Inertia::render('driver/history', [
            'orders'          => $orders,
            'totalEarnings'   => $totalEarnings,
            'totalDeliveries' => $totalDeliveries,
        ]);
    }

    // =========================================================================
    // ADMIN
    // =========================================================================

    /**
     * Todos los pedidos del sistema
     */
    public function adminOrders()
    {
        $orders = Order::with([
            'client:id,name,email',
            'store:id,business_name',
            'driver:id,name',
            'items',
        ])
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/orders', [
            'orders' => $orders,
        ]);
    }

    // =========================================================================
    // HELPERS PRIVADOS
    // =========================================================================

    /**
     * Liberar wallets de tienda y driver cuando se entrega el pedido
     */
    private function releaseWallets(Order $order): void
    {
        // Wallet de la tienda
        $storeOwner = $order->store->user;
        $storeWallet = Wallet::firstOrCreate(
            ['user_id' => $storeOwner->id, 'type' => 'store'],
            ['balance' => 0, 'pending_balance' => 0]
        );

        $storeWallet->releasePending(
            $order->store_earnings,
            $order->id,
            "Pedido #{$order->id} entregado"
        );

        // Wallet del driver
        if ($order->driver_id) {
            $driverWallet = Wallet::firstOrCreate(
                ['user_id' => $order->driver_id, 'type' => 'driver'],
                ['balance' => 0, 'pending_balance' => 0]
            );

            $driverWallet->releasePending(
                $order->driver_earnings,
                $order->id,
                "Entrega #{$order->id} completada"
            );
        }
    }
}

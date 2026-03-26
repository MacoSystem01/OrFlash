<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Models\ClientPaymentMethod;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
            'store_id'           => 'required|exists:stores,id',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'delivery_fee'       => 'required|integer|min:0',
            'payment_method_type'=> 'nullable|in:cash,pse,nequi,daviplata,contra_entrega',
            'delivery_lat'       => 'nullable|numeric|between:-90,90',
            'delivery_lng'       => 'nullable|numeric|between:-180,180',
        ]);

        $store = Store::where('status', 'active')
            ->findOrFail($request->store_id);

        // Validar rango y calcular tarifa server-side (previene manipulación del cliente)
        $deliveryLat       = $request->input('delivery_lat');
        $deliveryLng       = $request->input('delivery_lng');
        $serverDeliveryFee = (int) $request->delivery_fee; // fallback: lo que envió el cliente

        if (
            $deliveryLat !== null && $deliveryLng !== null &&
            $store->latitude  !== null && $store->longitude !== null
        ) {
            $radiusM   = $store->coverage_radius_m ?? 2000;
            $distanceM = Order::haversineMeters(
                (float) $store->latitude,  (float) $store->longitude,
                (float) $deliveryLat,      (float) $deliveryLng
            );

            if ($distanceM > $radiusM) {
                return response()->json([
                    'error' => 'Tu dirección de entrega está fuera del radio de cobertura de esta tienda ('
                             . round($radiusM / 1000, 1) . ' km). '
                             . 'Distancia calculada: ' . round($distanceM / 1000, 2) . ' km.',
                ], 422);
            }

            // Recalcular tarifa según zona de distancia
            $feeData           = Order::calculateDistanceFee($distanceM, $store->delivery_fee);
            $serverDeliveryFee = $feeData['fee'];
        } elseif ($store->delivery_fee !== null) {
            // Sin GPS pero la tienda tiene tarifa fija → usarla
            $serverDeliveryFee = $store->delivery_fee;
        }

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

            // Calcular comisiones usando la tarifa calculada server-side
            $commissions = Order::calculateCommissions(
                $subtotal,
                $serverDeliveryFee
            );

            // Obtener perfil del cliente para dirección
            $client  = Auth::user();
            $profile = $client->clientProfile;

            // Resolver método de pago: usar el seleccionado por el cliente o el predeterminado
            $selectedType = $request->payment_method_type;

            if ($selectedType) {
                $chosenPayment = ClientPaymentMethod::where('user_id', $client->id)
                    ->where('type', $selectedType)
                    ->first();
            } else {
                $chosenPayment = ClientPaymentMethod::where('user_id', $client->id)
                    ->where('is_default', true)
                    ->first();
            }

            // Tipo resuelto: lo que eligió el cliente (puede no tener registro en DB para cash/contra_entrega)
            $resolvedType      = $selectedType ?? $chosenPayment?->type;
            $isWompiConfigured = !empty(config('services.wompi.public_key'));
            $isOnlineMethod    = in_array($resolvedType, ['nequi', 'pse', 'daviplata']);

            if (in_array($resolvedType, ['contra_entrega', 'cash'])) {
                // Pago en persona
                $orderStatus    = 'pending';
                $paymentStatus  = 'cod';
                $isManualOnline = false;
            } elseif ($isOnlineMethod && !$isWompiConfigured) {
                // Pago online sin pasarela → flujo manual (tienda verifica directamente)
                $orderStatus    = 'pending';
                $paymentStatus  = 'pending';
                $isManualOnline = true;
            } else {
                // Pago online con Wompi
                $orderStatus    = 'pending_payment';
                $paymentStatus  = 'pending';
                $isManualOnline = false;
            }
            $paymentMethod = $resolvedType;

            // Crear la orden
            $order = Order::create([
                'client_id'             => $client->id,
                'store_id'              => $store->id,
                'status'                => $orderStatus,
                'payment_status'        => $paymentStatus,
                'payment_method'        => $paymentMethod,
                'delivery_address'      => $profile?->address      ?? $request->delivery_address,
                'delivery_neighborhood' => $profile?->neighborhood  ?? null,
                'delivery_city'         => $profile?->city          ?? null,
                'delivery_references'   => $profile?->references    ?? null,
                'delivery_lat'          => $deliveryLat,
                'delivery_lng'          => $deliveryLng,
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

            // Retornar el ID de la orden para redirigir a Wompi (o confirmar contra entrega)
            return response()->json([
                'order_id'        => $order->id,
                'total'           => $order->total,
                'reference'       => 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
                'is_cod'          => $order->status === 'pending',   // no necesita Wompi
                'is_manual_online'=> $isManualOnline,
                'payment_method'  => $paymentMethod,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('OrderController@store error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'No se pudo crear el pedido. Por favor, inténtalo de nuevo.',
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
     * Cancelar un pedido pendiente de pago
     */
    public function cancelOrder(int $orderId)
    {
        $order = Order::forClient(Auth::id())
            ->where('status', 'pending_payment')
            ->with('items.product')
            ->findOrFail($orderId);

        DB::beginTransaction();
        try {
            // Restaurar stock de productos
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->quantity);
                }
            }

            $order->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'No se pudo cancelar el pedido.']);
        }

        return redirect('/client/orders')->with('success', 'Pedido cancelado correctamente.');
    }

    /**
     * Cambiar un pedido pending_payment a contra entrega
     * (cuando el pago en línea no está disponible)
     */
    public function switchToCod(int $orderId)
    {
        // Aceptar tanto pending_payment (flujo normal) como pending con payment_status cod
        // (caso en que una llamada anterior falló a mitad y ya actualizó la orden)
        $order = Order::forClient(Auth::id())
            ->whereIn('status', ['pending_payment', 'pending'])
            ->whereIn('payment_status', ['pending', 'cod'])
            ->findOrFail($orderId);

        // Solo actualizar si aún no se procesó
        if ($order->status === 'pending_payment' || $order->payment_status === 'pending') {
            $order->update([
                'status'         => 'pending',
                'payment_status' => 'cod',
                'payment_method' => 'contra_entrega',
            ]);
        }

        // Acreditar wallet de la tienda solo si no hay transacción previa para esta orden
        $storeOwner  = $order->store->user;
        $storeWallet = Wallet::firstOrCreate(
            ['user_id' => $storeOwner->id, 'type' => 'store'],
            ['balance' => 0, 'pending_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
        );

        $alreadyCredited = $storeWallet->transactions()
            ->where('order_id', $order->id)
            ->exists();

        if (!$alreadyCredited) {
            $storeWallet->creditPending(
                $order->store_earnings,
                $order->id,
                "Pedido #{$order->id} — contra entrega"
            );
        }

        return redirect("/client/orders/{$orderId}/tracking")
            ->with('success', 'Pedido confirmado con pago contra entrega.');
    }

    /**
     * Coordenadas y tarifa de domicilio de una tienda (JSON) — para el checkout
     */
    public function storeLocation(int $storeId)
    {
        $store = Store::where('status', 'active')->findOrFail($storeId);

        return response()->json([
            'latitude'          => $store->latitude,
            'longitude'         => $store->longitude,
            'coverage_radius_m' => $store->coverage_radius_m ?? 2000,
            'delivery_fee'      => $store->delivery_fee,
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
     * Rechazar pedido contra entrega — acción de la tienda
     */
    public function rejectCodOrder(int $storeId, int $orderId)
    {
        Store::where('user_id', Auth::id())->findOrFail($storeId);

        $order = Order::forStore($storeId)
            ->where('payment_method', 'contra_entrega')
            ->where('status', 'pending')
            ->with('items.product')
            ->findOrFail($orderId);

        DB::beginTransaction();
        try {
            // Restaurar stock
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->quantity);
                }
            }

            $order->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'No se pudo rechazar el pedido.']);
        }

        return back()->with('success', 'Pedido contra entrega rechazado.');
    }

    /**
     * Avanzar estado del pedido — acción de la tienda
     */
    public function advanceOrder(int $storeId, int $orderId)
    {
        Store::where('user_id', Auth::id())->findOrFail($storeId);

        // La tienda solo puede avanzar pedidos en estos estados
        $order = Order::forStore($storeId)
            ->whereIn('status', ['pending', 'confirmed', 'preparing'])
            ->findOrFail($orderId);

        if (!$order->advanceStatus()) {
            return back()->withErrors([
                'error' => 'No se puede avanzar el estado de este pedido.',
            ]);
        }

        return back()->with('success', 'Estado del pedido actualizado.');
    }

    /**
     * Reporte de pedidos de la tienda con filtros
     */
    public function storeReport(Request $request, int $storeId)
    {
        $store = Store::where('user_id', Auth::id())->findOrFail($storeId);

        $query = Order::forStore($storeId)
            ->with(['client:id,name', 'items.product:id,category']);

        // Filtro por ID de pedido
        if ($request->filled('order_id')) {
            $query->where('id', (int) $request->order_id);
        }

        // Filtro por rango de fechas — se parsea en hora de Colombia (UTC-5) para que
        // el día seleccionado cubra de 00:00:00 a 23:59:59 en hora local y no queden
        // registros del mismo día fuera del rango por diferencia de timezone con UTC.
        $tz = 'America/Bogota';
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=',
                \Carbon\Carbon::createFromFormat('Y-m-d', $request->date_from, $tz)->startOfDay()->utc()
            );
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=',
                \Carbon\Carbon::createFromFormat('Y-m-d', $request->date_to, $tz)->endOfDay()->utc()
            );
        }

        // Filtro por nombre de cliente
        if ($request->filled('client_name')) {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->client_name . '%');
            });
        }

        // Filtro por categoría de producto — restringido a esta tienda
        if ($request->filled('product_category')) {
            $query->whereHas('items.product', function ($q) use ($request, $storeId) {
                $q->where('store_id', $storeId)
                  ->where('category', $request->product_category);
            });
        }

        $orders = $query->latest()->get();

        // Categorías disponibles para el selector
        $categories = Product::where('store_id', $storeId)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        // Totales del reporte
        $totalRevenue   = $orders->where('status', 'delivered')->sum('store_earnings');
        $totalOrders    = $orders->count();

        $stores = Store::where('user_id', Auth::id())->get(['id', 'business_name']);

        return Inertia::render('store/report', [
            'store'      => $store,
            'stores'     => $stores,
            'orders'     => $orders,
            'categories' => $categories,
            'summary'    => [
                'total_orders'  => $totalOrders,
                'total_revenue' => $totalRevenue,
            ],
            'filters' => $request->only(['order_id', 'date_from', 'date_to', 'client_name', 'product_category']),
        ]);
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
     * Página de estado del negocio
     */
    public function businessStatusPage(int $storeId)
    {
        $store = Store::where('user_id', Auth::id())
            ->findOrFail($storeId);

        $todayOrders = Order::forStore($storeId)
            ->whereDate('created_at', today())
            ->count();

        $stores = Store::where('user_id', Auth::id())
            ->get(['id', 'business_name']);

        return Inertia::render('store/business-status', [
            'store'       => $store,
            'stores'      => $stores,
            'todayOrders' => $todayOrders,
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
    public function availableOrders(Request $request)
    {
        // Verificar que el driver no tenga más de 3 pedidos activos
        $activeCount = Order::forDriver(Auth::id())
            ->whereIn('status', ['picked_up', 'in_transit'])
            ->count();

        $orders = [];

        if ($activeCount < 3) {
            $query = Order::availableForDriver()
                ->with([
                    'store:id,business_name,address,latitude,longitude,coverage_radius_m',
                    'items',
                ]);

            // Filtrar por proximidad del repartidor si envía coordenadas
            $driverLat = $request->query('lat');
            $driverLng = $request->query('lng');

            if ($driverLat !== null && $driverLng !== null) {
                $driverLat = (float) $driverLat;
                $driverLng = (float) $driverLng;

                // Filtrar en PHP (más portable que SQL puro en XAMPP/MySQL sin ST functions)
                $orders = $query->latest()->get()->filter(function ($order) use ($driverLat, $driverLng) {
                    $store = $order->store;
                    if (!$store || $store->latitude === null || $store->longitude === null) {
                        return true; // sin coordenadas de tienda → mostrar igualmente
                    }
                    // Límite duro: nunca superar 2 km independientemente del radio configurado
                    $maxRadiusM = min((int) ($store->coverage_radius_m ?? 2000), 2000);
                    $distanceM  = Order::haversineMeters(
                        $driverLat, $driverLng,
                        (float) $store->latitude, (float) $store->longitude
                    );
                    return $distanceM <= $maxRadiusM;
                })->values();
            } else {
                $orders = $query->latest()->get();
            }
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
    public function acceptOrder(Request $request, int $orderId)
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

        // Validar distancia del repartidor a la tienda (máx. coverage_radius_m o 2 km)
        $driverLat = $request->input('lat');
        $driverLng = $request->input('lng');

        if ($driverLat !== null && $driverLng !== null) {
            $orderForCheck = Order::availableForDriver()
                ->with('store:id,latitude,longitude,coverage_radius_m')
                ->find($orderId);

            if ($orderForCheck && $orderForCheck->store) {
                $store = $orderForCheck->store;

                if ($store->latitude !== null && $store->longitude !== null) {
                    $maxRadiusM = min((int) ($store->coverage_radius_m ?? 2000), 2000);
                    $distanceM  = Order::haversineMeters(
                        (float) $driverLat, (float) $driverLng,
                        (float) $store->latitude, (float) $store->longitude
                    );

                    if ($distanceM > $maxRadiusM) {
                        return back()->withErrors([
                            'error' => 'Estás demasiado lejos de la tienda para aceptar este pedido. '
                                     . 'Distancia: ' . round($distanceM / 1000, 2) . ' km. '
                                     . 'Máximo permitido: ' . round($maxRadiusM / 1000, 1) . ' km.',
                        ]);
                    }
                }
            }
        }

        // Bloquear la fila para evitar que dos repartidores acepten el mismo pedido
        $order = DB::transaction(function () use ($orderId) {
            $order = Order::availableForDriver()
                ->lockForUpdate()
                ->find($orderId);

            if (!$order) return null;

            $order->update([
                'driver_id'    => Auth::id(),
                'status'       => 'picked_up',
                'picked_up_at' => now(),
            ]);

            return $order;
        });

        if (!$order) {
            return back()->withErrors([
                'error' => 'Este pedido ya fue tomado por otro repartidor.',
            ]);
        }

        return redirect()->route('driver.current-order')
            ->with('success', 'Pedido aceptado. ¡Dirígete a la tienda!');
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
                'store:id,business_name,address,city,neighborhood,latitude,longitude',
                'client:id,name,phone',
                'items',
            ])
            ->latest()
            ->first();

        // Serializar campos de entrega explícitamente para el frontend
        $orderData = $order ? array_merge($order->toArray(), [
            'delivery_address'      => $order->delivery_address,
            'delivery_neighborhood' => $order->delivery_neighborhood,
            'delivery_city'         => $order->delivery_city,
            'delivery_references'   => $order->delivery_references,
            'delivery_lat'          => $order->delivery_lat,
            'delivery_lng'          => $order->delivery_lng,
        ]) : null;

        return Inertia::render('driver/current-order', [
            'order' => $orderData,
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

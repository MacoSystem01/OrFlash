<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FooterItem;
use App\Models\HomeCarousel;
use App\Models\Order;
use App\Models\Store;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Dashboard / Users / Stores / Drivers / Analytics
    // ─────────────────────────────────────────────────────────────────────────

    public function dashboard()
    {
        $totalUsers   = User::whereIn('role', ['client', 'store', 'driver'])->count();
        $totalStores  = Store::count();
        $activeStores = Store::where('status', 'active')->count();
        $totalDrivers = User::where('role', 'driver')->count();

        $recentOrders = Order::with([
                'client:id,name',
                'store:id,business_name',
            ])
            ->latest()
            ->limit(6)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users'   => $totalUsers,
                'total_stores'  => $totalStores,
                'active_stores' => $activeStores,
                'total_drivers' => $totalDrivers,
            ],
            'orders' => $recentOrders,
        ]);
    }

    public function users()
    {
        $users = User::whereIn('role', ['client', 'store', 'driver'])
            ->latest()
            ->get(['id', 'name', 'email', 'role', 'phone', 'status', 'created_at']);

        return Inertia::render('admin/users', ['users' => $users]);
    }

    public function userDetail(int $id)
    {
        $user = User::findOrFail($id);

        $profile = match ($user->role) {
            'client' => $user->clientProfile,
            'driver' => $user->driverProfile,
            'store'  => $user->merchantProfile,
            default  => null,
        };

        return response()->json([
            'user'    => $user->only([
                'id', 'name', 'email', 'role', 'phone', 'status',
                'cedula', 'address', 'created_at', 'nit', 'business_name',
                'commercial_address', 'chamber_of_commerce',
                'license_number', 'vehicle_plate', 'arl', 'insurance',
            ]),
            'profile' => $profile,
        ]);
    }

    public function toggleUser(int $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return back()->withErrors(['toggle' => 'No puedes modificar una cuenta admin.']);
        }

        $user->status = $user->status === 'active' ? 'rejected' : 'active';
        $user->save();

        return back();
    }

    public function stores()
    {
        $stores = Store::with('user:id,name,email')->latest()->get();

        return Inertia::render('admin/stores', ['stores' => $stores]);
    }

    public function toggleStore(int $id)
    {
        $store = Store::findOrFail($id);

        $store->status = match ($store->status) {
            'active'   => 'inactive',
            'inactive' => 'active',
            'pending'  => 'active',
            default    => 'inactive',
        };

        $store->save();

        return back();
    }

    public function updateStoreDelivery(Request $request, int $id)
    {
        $request->validate([
            'delivery_fee'      => 'nullable|integer|min:0|max:999999',
            'coverage_radius_m' => 'required|integer|min:100|max:2000',
        ]);

        Store::findOrFail($id)->update([
            'delivery_fee'      => $request->delivery_fee,
            'coverage_radius_m' => $request->coverage_radius_m,
        ]);

        return back()->with('success', 'Configuración de domicilio actualizada.');
    }

    public function drivers()
    {
        $drivers = User::where('role', 'driver')
            ->latest()
            ->get(['id', 'name', 'email', 'phone', 'status', 'created_at']);

        return Inertia::render('admin/drivers', ['drivers' => $drivers]);
    }

    public function analytics()
    {
        $tz    = 'America/Bogota';
        $today = \Carbon\Carbon::now($tz)->startOfDay();
        $month = \Carbon\Carbon::now($tz)->startOfMonth();

        // ── Usuarios ──────────────────────────────────────────────────────────
        $totalUsers  = \App\Models\User::whereIn('role', ['client', 'store', 'driver'])->count();
        $activeUsers = \App\Models\User::whereIn('role', ['client', 'store', 'driver'])->where('status', 'active')->count();
        $byRole = [
            'clients' => \App\Models\User::where('role', 'client')->count(),
            'stores'  => \App\Models\User::where('role', 'store')->count(),
            'drivers' => \App\Models\User::where('role', 'driver')->count(),
        ];

        // ── Tiendas ───────────────────────────────────────────────────────────
        $totalStores  = Store::count();
        $activeStores = Store::where('status', 'active')->count();

        // ── Pedidos ───────────────────────────────────────────────────────────
        $totalOrders      = \App\Models\Order::count();
        $ordersToday      = \App\Models\Order::where('created_at', '>=', $today->utc())->count();
        $ordersThisMonth  = \App\Models\Order::where('created_at', '>=', $month->utc())->count();
        $pendingOrders    = \App\Models\Order::whereIn('status', ['pending', 'confirmed', 'preparing', 'ready'])->count();

        $rawStatuses = \App\Models\Order::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $byStatus = [
            'Pendiente'   => (int) ($rawStatuses['pending']    ?? 0),
            'Confirmado'  => (int) ($rawStatuses['confirmed']  ?? 0),
            'Preparando'  => (int) ($rawStatuses['preparing']  ?? 0),
            'Listo'       => (int) ($rawStatuses['ready']      ?? 0),
            'En camino'   => (int) (($rawStatuses['picked_up'] ?? 0) + ($rawStatuses['in_transit'] ?? 0)),
            'Entregado'   => (int) ($rawStatuses['delivered']  ?? 0),
            'Cancelado'   => (int) ($rawStatuses['cancelled']  ?? 0),
        ];

        // ── Ingresos plataforma (platform_fee) ────────────────────────────────
        $totalRevenue     = (int) \App\Models\Order::where('status', 'delivered')->sum('platform_fee');
        $revenueToday     = (int) \App\Models\Order::where('status', 'delivered')
                                ->where('delivered_at', '>=', $today->utc())
                                ->sum('platform_fee');
        $revenueThisMonth = (int) \App\Models\Order::where('status', 'delivered')
                                ->where('delivered_at', '>=', $month->utc())
                                ->sum('platform_fee');

        // ── Pedidos últimos 7 días ─────────────────────────────────────────────
        $ordersLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $day      = \Carbon\Carbon::now($tz)->subDays($i);
            $dayStart = $day->copy()->startOfDay()->utc();
            $dayEnd   = $day->copy()->endOfDay()->utc();

            $ordersLast7Days[] = [
                'fecha'   => $day->format('d/m'),
                'pedidos' => \App\Models\Order::whereBetween('created_at', [$dayStart, $dayEnd])->count(),
                'ingresos'=> (int) \App\Models\Order::where('status', 'delivered')
                                ->whereBetween('delivered_at', [$dayStart, $dayEnd])
                                ->sum('platform_fee'),
            ];
        }

        // ── Top 5 tiendas por pedidos ─────────────────────────────────────────
        $topStores = Store::select('id', 'business_name')
            ->withCount('orders')
            ->orderByDesc('orders_count')
            ->limit(5)
            ->get();

        return Inertia::render('admin/analytics', [
            'stats' => [
                'total_users'         => $totalUsers,
                'active_users'        => $activeUsers,
                'total_stores'        => $totalStores,
                'active_stores'       => $activeStores,
                'total_orders'        => $totalOrders,
                'orders_today'        => $ordersToday,
                'orders_this_month'   => $ordersThisMonth,
                'pending_orders'      => $pendingOrders,
                'total_revenue'       => $totalRevenue,
                'revenue_today'       => $revenueToday,
                'revenue_this_month'  => $revenueThisMonth,
                'by_role'             => $byRole,
                'by_status'           => $byStatus,
            ],
            'ordersLast7Days' => $ordersLast7Days,
            'topStores'       => $topStores,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Settings
    // ─────────────────────────────────────────────────────────────────────────

    public function settings()
    {
        return Inertia::render('admin/settings', [
            'settings' => SystemSetting::allSettings(),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'general.contactEmail'                => 'required|email|max:255',
            'finances.currency'                   => 'required|in:COP,USD,EUR',
            'finances.storeCommissionPercentage'  => 'required|numeric|min:0|max:100',
            'finances.driverCommissionPercentage' => 'required|numeric|min:0|max:100',
            'finances.paymentMethod'              => 'required|in:Wompi,MercadoPago,PayPal,Efectivo',
            'regional.timezone'                   => ['required', 'string', 'in:' . implode(',', timezone_identifiers_list())],
            'regional.language'                   => 'required|in:Español,Inglés,Portugués',
            'regional.dateFormat'                 => 'required|in:DD/MM/YYYY,MM/DD/YYYY,YYYY-MM-DD',
            'notifications.alertEmail'            => 'required|email|max:255',
            'notifications.pushEnabled'           => 'boolean',
            'notifications.smsEnabled'            => 'boolean',
        ]);

        foreach ($data as $section => $fields) {
            foreach ($fields as $field => $value) {
                SystemSetting::setValue("{$section}.{$field}", $value);
            }
        }

        return back()->with('success', 'Configuración guardada correctamente.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Home Carousel
    // ─────────────────────────────────────────────────────────────────────────

    public function carousels()
    {
        $carousels = HomeCarousel::orderBy('order')->orderBy('id')->get();

        return Inertia::render('admin/carousels', ['carousels' => $carousels]);
    }

    public function storeCarousel(Request $request)
    {
        $validated = $request->validate([
            'image'        => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'redirect_url' => 'nullable|url|starts_with:http://,https://',
            'is_active'    => 'nullable|boolean',
            'order'        => 'nullable|integer|min:0',
        ]);

        $validated['image'] = $request->file('image')->store('carousel', 'public');

        HomeCarousel::create($validated);

        return back()->with('success', 'Imagen añadida al carousel.');
    }

    public function updateCarousel(Request $request, int $id)
    {
        $carousel = HomeCarousel::findOrFail($id);

        $validated = $request->validate([
            'image'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'redirect_url' => 'nullable|url|starts_with:http://,https://',
            'is_active'    => 'nullable|boolean',
            'order'        => 'nullable|integer|min:0',
        ]);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($carousel->image);
            $validated['image'] = $request->file('image')->store('carousel', 'public');
        } else {
            unset($validated['image']);
        }

        $carousel->update($validated);

        return back()->with('success', 'Carousel actualizado.');
    }

    public function destroyCarousel(int $id)
    {
        $carousel = HomeCarousel::findOrFail($id);
        Storage::disk('public')->delete($carousel->image);
        $carousel->delete();

        return back()->with('success', 'Imagen eliminada del carousel.');
    }

    public function toggleCarousel(int $id)
    {
        $carousel = HomeCarousel::findOrFail($id);
        $carousel->update(['is_active' => !$carousel->is_active]);

        return back();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Footer Items
    // ─────────────────────────────────────────────────────────────────────────

    public function footerItems()
    {
        $items = FooterItem::orderBy('order')->orderBy('id')->get();

        return Inertia::render('admin/footer-items', ['items' => $items]);
    }

    public function storeFooterItem(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:100',
            'icon'         => 'nullable|file|max:5120|mimetypes:image/svg+xml,image/png,image/jpeg,image/webp,image/gif',
            'redirect_url' => 'nullable|url|starts_with:http://,https://',
            'is_active'    => 'nullable|boolean',
            'order'        => 'nullable|integer|min:0',
        ]);

        if ($request->hasFile('icon')) {
            $validated['icon'] = $request->file('icon')->store('footer', 'public');
        }

        FooterItem::create($validated);

        return back()->with('success', 'Ítem del footer creado.');
    }

    public function updateFooterItem(Request $request, int $id)
    {
        $item = FooterItem::findOrFail($id);

        $validated = $request->validate([
            'title'        => 'required|string|max:100',
            'icon'         => 'nullable|file|max:5120|mimetypes:image/svg+xml,image/png,image/jpeg,image/webp,image/gif',
            'redirect_url' => 'nullable|url|starts_with:http://,https://',
            'is_active'    => 'nullable|boolean',
            'order'        => 'nullable|integer|min:0',
        ]);

        if ($request->hasFile('icon')) {
            if ($item->icon) {
                Storage::disk('public')->delete($item->icon);
            }
            $validated['icon'] = $request->file('icon')->store('footer', 'public');
        } else {
            unset($validated['icon']);
        }

        $item->update($validated);

        return back()->with('success', 'Ítem actualizado.');
    }

    public function destroyFooterItem(int $id)
    {
        $item = FooterItem::findOrFail($id);

        if ($item->icon) {
            Storage::disk('public')->delete($item->icon);
        }

        $item->delete();

        return back()->with('success', 'Ítem eliminado del footer.');
    }

    public function toggleFooterItem(int $id)
    {
        $item = FooterItem::findOrFail($id);
        $item->update(['is_active' => !$item->is_active]);

        return back();
    }
}

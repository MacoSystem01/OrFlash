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

    public function drivers()
    {
        $drivers = User::where('role', 'driver')
            ->latest()
            ->get(['id', 'name', 'email', 'phone', 'status', 'created_at']);

        return Inertia::render('admin/drivers', ['drivers' => $drivers]);
    }

    public function analytics()
    {
        $stats = [
            'total_users'   => User::whereIn('role', ['client', 'store', 'driver'])->count(),
            'active_users'  => User::whereIn('role', ['client', 'store', 'driver'])->where('status', 'active')->count(),
            'total_stores'  => Store::count(),
            'active_stores' => Store::where('status', 'active')->count(),
            'by_role' => [
                'clients' => User::where('role', 'client')->count(),
                'stores'  => User::where('role', 'store')->count(),
                'drivers' => User::where('role', 'driver')->count(),
            ],
        ];

        return Inertia::render('admin/analytics', ['stats' => $stats]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Settings
    // ─────────────────────────────────────────────────────────────────────────

    public function settings()
    {
        return Inertia::render('admin/settings', [
            'settings' => SystemSetting::toArray(),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'general.contactEmail'                => 'required|email|max:255',
            'finances.currency'                   => 'required|string|max:10',
            'finances.storeCommissionPercentage'  => 'required|numeric|min:0|max:100',
            'finances.driverCommissionPercentage' => 'required|numeric|min:0|max:100',
            'finances.paymentMethod'              => 'required|string|max:50',
            'regional.timezone'                   => 'required|string|max:100',
            'regional.language'                   => 'required|string|max:50',
            'regional.dateFormat'                 => 'required|string|max:20',
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
            'redirect_url' => 'nullable|url',
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
            'redirect_url' => 'nullable|url',
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
            'icon'         => 'nullable|file|max:5120',   // sin mimes: finfo de XAMPP detecta SVG como text/xml
            'redirect_url' => 'nullable|url',
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
            'icon'         => 'nullable|file|max:5120',
            'redirect_url' => 'nullable|url',
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

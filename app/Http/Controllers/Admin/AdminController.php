<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Store;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalUsers   = User::whereIn('role', ['client', 'store', 'driver'])->count();
        $totalStores  = Store::count();
        $activeStores = Store::where('status', 'active')->count();
        $totalDrivers = User::where('role', 'driver')->count();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users'   => $totalUsers,
                'total_stores'  => $totalStores,
                'active_stores' => $activeStores,
                'total_drivers' => $totalDrivers,
            ],
            'orders' => [],
        ]);
    }

    public function orders()
    {
        return Inertia::render('admin/orders', [
            'orders' => [],
        ]);
    }

    public function users()
    {
        $users = User::whereIn('role', ['client', 'store', 'driver'])
            ->latest()
            ->get(['id', 'name', 'email', 'role', 'phone', 'status', 'created_at']);

        return Inertia::render('admin/users', [
            'users' => $users,
        ]);
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
                'id',
                'name',
                'email',
                'role',
                'phone',
                'status',
                'cedula',
                'address',
                'created_at',
                'nit',
                'business_name',
                'commercial_address',
                'chamber_of_commerce',
                'license_number',
                'vehicle_plate',
                'arl',
                'insurance',
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
        $stores = Store::with('user:id,name,email')
            ->latest()
            ->get();

        return Inertia::render('admin/stores', [
            'stores' => $stores,
        ]);
    }

    public function toggleStore(int $id)
    {
        $store = Store::findOrFail($id);

        $store->status = match ($store->status) {
            'active'  => 'inactive',
            'inactive' => 'active',
            'pending' => 'active',   // Aprobar tienda pendiente
            default   => 'inactive',
        };

        $store->save();

        return back();
    }

    public function drivers()
    {
        $drivers = User::where('role', 'driver')
            ->latest()
            ->get(['id', 'name', 'email', 'phone', 'status', 'created_at']);

        return Inertia::render('admin/drivers', [
            'drivers' => $drivers,
        ]);
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

        return Inertia::render('admin/analytics', [
            'stats' => $stats,
        ]);
    }

    public function settings()
    {
        return Inertia::render('admin/settings');
    }
}

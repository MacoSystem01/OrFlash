<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function dashboard()
    {
        $driverId = Auth::id();

        $earningsToday = Order::forDriver($driverId)
            ->where('status', 'delivered')
            ->whereDate('delivered_at', today())
            ->sum('driver_earnings');

        $deliveriesToday = Order::forDriver($driverId)
            ->where('status', 'delivered')
            ->whereDate('delivered_at', today())
            ->count();

        return Inertia::render('driver/dashboard', [
            'driverStats' => [
                'earnings_today'   => (int) $earningsToday,
                'deliveries_today' => $deliveriesToday,
                'active_minutes'   => 0,
            ],
        ]);
    }

    public function profile()
    {
        $driverId = Auth::id();

        $totalDeliveries = Order::forDriver($driverId)
            ->where('status', 'delivered')
            ->count();

        $wallet = Wallet::where('user_id', $driverId)
            ->where('type', 'driver')
            ->first();

        $totalEarnings = $wallet?->balance ?? 0;

        $user          = User::with('driverProfile')->findOrFail($driverId);
        $driverProfile = $user->driverProfile;

        return Inertia::render('driver/profile', [
            'driverStats' => [
                'total_deliveries' => $totalDeliveries,
                'total_earnings'   => (int) $totalEarnings,
            ],
            'profileData' => [
                'name'          => $user->name,
                'phone'         => $user->phone,
                'vehicle_type'  => $driverProfile?->vehicle_type,
                'vehicle_brand' => $driverProfile?->vehicle_brand,
                'vehicle_model' => $driverProfile?->vehicle_model,
                'vehicle_color' => $driverProfile?->vehicle_color,
                'vehicle_plate' => $driverProfile?->vehicle_plate,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'phone'         => 'nullable|string|max:20',
            'vehicle_brand' => 'nullable|string|max:100',
            'vehicle_model' => 'nullable|string|max:100',
            'vehicle_color' => 'nullable|string|max:100',
            'vehicle_plate' => 'nullable|string|max:20',
        ]);

        /** @var User $user */
        $user        = User::findOrFail(Auth::id());
        $user->name  = $validated['name'];
        $user->phone = $validated['phone'] ?? $user->phone;
        $user->save();

        if ($user->driverProfile) {
            $user->driverProfile->update([
                'vehicle_brand' => $validated['vehicle_brand'] ?? null,
                'vehicle_model' => $validated['vehicle_model'] ?? null,
                'vehicle_color' => $validated['vehicle_color'] ?? null,
                'vehicle_plate' => $validated['vehicle_plate'] ?? null,
            ]);
        }

        return back()->with('success', 'Perfil actualizado correctamente.');
    }
}

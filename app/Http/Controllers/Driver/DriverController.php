<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\DriverProfile;
use App\Models\DriverReview;
use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
        $user     = User::with('driverProfile')->findOrFail($driverId);
        $dp       = $user->driverProfile;

        // Estadísticas
        $delivered = Order::forDriver($driverId)->where('status', 'delivered');

        $totalDeliveries  = $delivered->count();
        $earningsToday    = (clone $delivered)->whereDate('delivered_at', today())->sum('driver_earnings');
        $earningsWeek     = (clone $delivered)->whereBetween('delivered_at', [now()->startOfWeek(), now()->endOfWeek()])->sum('driver_earnings');
        $earningsMonth    = (clone $delivered)->whereMonth('delivered_at', now()->month)->whereYear('delivered_at', now()->year)->sum('driver_earnings');

        $wallet        = Wallet::where('user_id', $driverId)->where('type', 'driver')->first();
        $totalEarnings = $wallet?->total_earned ?? 0;

        $rating        = DriverReview::where('driver_id', $driverId)->avg('rating');

        // Últimas 5 entregas
        $recentOrders = Order::forDriver($driverId)
            ->where('status', 'delivered')
            ->with('store:id,business_name')
            ->latest('delivered_at')
            ->limit(5)
            ->get(['id', 'store_id', 'driver_earnings', 'delivered_at']);

        return Inertia::render('driver/profile', [
            'driverStats' => [
                'total_deliveries' => $totalDeliveries,
                'total_earnings'   => (int) $totalEarnings,
                'earnings_today'   => (int) $earningsToday,
                'earnings_week'    => (int) $earningsWeek,
                'earnings_month'   => (int) $earningsMonth,
                'rating'           => $rating ? round((float) $rating, 1) : null,
            ],
            'recentOrders' => $recentOrders,
            'profileData'  => [
                'name'            => $user->name,
                'email'           => $user->email,
                'phone'           => $user->phone,
                'birth_date'      => $dp?->birth_date,
                'address'         => $dp?->address,
                'neighborhood'    => $dp?->neighborhood,
                'city'            => $dp?->city,
                'document_type'   => $dp?->document_type ?? 'CC',
                'document_number' => $dp?->document_number,
                'vehicle_type'    => $dp?->vehicle_type,
                'vehicle_brand'   => $dp?->vehicle_brand,
                'vehicle_model'   => $dp?->vehicle_model,
                'vehicle_color'   => $dp?->vehicle_color,
                'vehicle_plate'   => $dp?->vehicle_plate,
                // Documentos (rutas de storage)
                'document_photo'  => $dp?->document_photo,
                'selfie_photo'    => $dp?->selfie_photo,
                'soat'            => $dp?->soat,
                'license'         => $dp?->license,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'phone'           => ['nullable', 'regex:/^(\+57)?[0-9]{10}$/'],
            'birth_date'      => 'nullable|date|before_or_equal:' . now()->subYears(18)->format('Y-m-d'),
            'address'         => 'nullable|string|max:255',
            'neighborhood'    => 'nullable|string|max:100',
            'city'            => 'nullable|string|max:100',
            'document_type'   => 'nullable|in:CC,CE,Pasaporte',
            'document_number' => ['nullable', 'regex:/^[A-Z0-9]{4,30}$/'],
            'vehicle_brand'   => 'nullable|string|max:100',
            'vehicle_model'   => 'nullable|string|max:100',
            'vehicle_color'   => 'nullable|string|max:100',
            'vehicle_plate'   => ['nullable', 'regex:/^[A-Z]{3}[0-9]{3}([A-Z])?$/'],
        ]);

        /** @var User $user */
        $user        = User::findOrFail(Auth::id());
        $user->name  = $validated['name'];
        $user->phone = $validated['phone'] ?? $user->phone;
        $user->save();

        $profileFields = [
            'birth_date'      => $validated['birth_date']      ?? null,
            'address'         => $validated['address']         ?? null,
            'neighborhood'    => $validated['neighborhood']    ?? null,
            'city'            => $validated['city']            ?? null,
            'document_type'   => $validated['document_type']   ?? null,
            'document_number' => $validated['document_number'] ?? null,
            'vehicle_brand'   => $validated['vehicle_brand']   ?? null,
            'vehicle_model'   => $validated['vehicle_model']   ?? null,
            'vehicle_color'   => $validated['vehicle_color']   ?? null,
            'vehicle_plate'   => $validated['vehicle_plate']   ?? null,
        ];

        if ($user->driverProfile) {
            $user->driverProfile->update($profileFields);
        }

        return back()->with('success', 'Perfil actualizado correctamente.');
    }

    public function updateDocuments(Request $request)
    {
        $request->validate([
            'document_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'selfie_photo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'soat'           => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:4096',
            'license'        => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:4096',
        ]);

        $dp = Auth::user()->driverProfile;
        if (!$dp) {
            return back()->withErrors(['error' => 'Perfil de conductor no encontrado.']);
        }

        $updates = [];

        foreach (['document_photo', 'selfie_photo', 'soat', 'license'] as $field) {
            if ($request->hasFile($field)) {
                // Eliminar archivo anterior si existe
                if ($dp->$field) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($dp->$field);
                }
                $updates[$field] = $request->file($field)->store('drivers/docs', 'public');
            }
        }

        if (!empty($updates)) {
            $dp->update($updates);
        }

        return back()->with('success', 'Documentos actualizados correctamente.');
    }

    /*
    |--------------------------------------------------------------------------
    | Configuración inicial — fase 2 (modal en /pending-approval)
    | Ruta disponible sin el middleware role:driver para permitir acceso
    | a domiciliarios con status=pending.
    |--------------------------------------------------------------------------
    */
    public function completeSetup(Request $request)
    {
        $needsMotorDocs = in_array($request->vehicle_type, ['moto', 'carro']);

        $request->validate([
            // Fotos de validación
            'document_photo' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
            'selfie_photo'   => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',

            // Residencia
            'address'        => 'required|string|max:255',
            'neighborhood'   => 'required|string|max:100',
            'city'           => 'required|string|max:100',

            // Vehículo
            'vehicle_type'   => 'required|in:moto,bicicleta,carro,a_pie',
            'vehicle_brand'  => 'nullable|string|max:100',
            'vehicle_color'  => 'nullable|string|max:100',
            'vehicle_model'  => 'nullable|string|max:100',
            'vehicle_plate'  => $needsMotorDocs
                ? ['required', 'regex:/^[A-Z]{3}[0-9]{3}([A-Z])?$/']
                : 'nullable|string|max:20',
            'vehicle_photos' => 'nullable|array',
            'vehicle_photos.*' => 'file|mimes:jpg,jpeg,png,webp|max:5120',
            'soat'           => $needsMotorDocs ? 'required|file|mimes:pdf,jpg,jpeg,png|max:5120' : 'nullable',
            'license'        => $needsMotorDocs ? 'required|file|mimes:pdf,jpg,jpeg,png|max:5120' : 'nullable',

            // Términos y condiciones
            'accepted_terms'          => 'accepted',
            'accepted_data_policy'    => 'accepted',
            'accepted_responsibility' => 'accepted',
        ], [
            'document_photo.required'     => 'La foto del documento es obligatoria.',
            'selfie_photo.required'       => 'La selfie biométrica es obligatoria.',
            'vehicle_plate.required'      => 'La placa es obligatoria para moto y carro.',
            'soat.required'               => 'El SOAT vigente es obligatorio para moto y carro.',
            'license.required'            => 'La licencia de conducción es obligatoria para moto y carro.',
            'accepted_terms.accepted'     => 'Debes aceptar los términos y condiciones.',
            'accepted_data_policy.accepted'    => 'Debes autorizar el tratamiento de datos.',
            'accepted_responsibility.accepted' => 'Debes aceptar la responsabilidad sobre los pedidos.',
        ]);

        $dp = DriverProfile::where('user_id', Auth::id())->firstOrFail();

        // Fotos de validación
        $dp->document_photo = $request->file('document_photo')->store('drivers/docs', 'public');
        $dp->selfie_photo   = $request->file('selfie_photo')->store('drivers/selfies', 'public');

        // Documentos del vehículo
        if ($request->hasFile('soat')) {
            $dp->soat = $request->file('soat')->store('drivers/docs', 'public');
        }
        if ($request->hasFile('license')) {
            $dp->license = $request->file('license')->store('drivers/docs', 'public');
        }

        // Fotos del vehículo
        $vehiclePhotos = [];
        if ($request->hasFile('vehicle_photos')) {
            foreach ($request->file('vehicle_photos') as $photo) {
                $vehiclePhotos[] = $photo->store('drivers/vehicles', 'public');
            }
        }

        $dp->address              = $request->address;
        $dp->neighborhood         = $request->neighborhood;
        $dp->city                 = $request->city;
        $dp->vehicle_type         = $request->vehicle_type;
        $dp->vehicle_brand        = $request->vehicle_brand;
        $dp->vehicle_color        = $request->vehicle_color;
        $dp->vehicle_model        = $request->vehicle_model;
        $dp->vehicle_plate        = $request->vehicle_plate;
        $dp->vehicle_photos       = $vehiclePhotos;
        $dp->accepted_terms          = true;
        $dp->accepted_data_policy    = true;
        $dp->accepted_responsibility = true;
        $dp->save();

        return redirect('/pending-approval')->with('success', '¡Perfil completado! Tu solicitud está en revisión.');
    }
}

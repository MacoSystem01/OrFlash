<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientPaymentMethod;
use App\Models\ClientProfile;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientProfileController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Home del cliente — tiendas activas desde BD
    |--------------------------------------------------------------------------
    */
    public function home()
    {
        $stores = Store::where('status', 'active')
            ->latest()
            ->get([
                'id', 'business_name', 'category', 'zone', 'address',
                'rating', 'is_open', 'opening_time', 'closing_time',
                'description', 'images',
            ]);

        return Inertia::render('client/home', [
            'stores' => $stores,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Perfil del cliente
    |--------------------------------------------------------------------------
    */
    public function show()
    {
        /** @var User $user */
        $user           = User::with('clientProfile')->findOrFail(Auth::id());
        $profile        = $user->clientProfile;
        $paymentMethods = ClientPaymentMethod::where('user_id', Auth::id())->get();

        return Inertia::render('client/profile', [
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'profile' => $profile ? [
                'address'         => $profile->address,
                'neighborhood'    => $profile->neighborhood,
                'city'            => $profile->city,
                'references'      => $profile->references,
                'alternate_phone' => $profile->alternate_phone,
                'cedula'          => $profile->cedula,
                'notifications'   => $profile->notifications,
            ] : null,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function updateUser(Request $request)
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'phone'           => 'nullable|string|max:20',
            'alternate_phone' => 'nullable|string|max:20',
            'cedula'          => 'nullable|string|max:20',
        ]);

        /** @var User $user */
        $user        = User::findOrFail(Auth::id());
        $user->name  = $request->name;
        $user->phone = $request->phone;
        $user->save();

        ClientProfile::updateOrCreate(
            ['user_id' => Auth::id()],
            [
                'alternate_phone' => $request->alternate_phone,
                'cedula'          => $request->cedula,
            ]
        );

        return back()->with('success', 'Información actualizada correctamente.');
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'address'      => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:100',
            'city'         => 'nullable|string|max:100',
            'references'   => 'nullable|string|max:500',
        ]);

        ClientProfile::updateOrCreate(
            ['user_id' => Auth::id()],
            $request->only(['address', 'neighborhood', 'city', 'references'])
        );

        return back()->with('success', 'Perfil actualizado correctamente.');
    }

    public function updateNotifications(Request $request)
    {
        $request->validate([
            'notify_orders'     => 'boolean',
            'notify_promotions' => 'boolean',
            'notify_news'       => 'boolean',
        ]);

        ClientProfile::updateOrCreate(
            ['user_id' => Auth::id()],
            ['notifications' => json_encode($request->only([
                'notify_orders',
                'notify_promotions',
                'notify_news',
            ]))]
        );

        return back()->with('success', 'Notificaciones actualizadas.');
    }

    public function savePaymentMethod(Request $request)
    {
        $request->validate([
            'type'             => 'required|in:cash,pse,nequi,daviplata',
            'is_default'       => 'boolean',
            'pse_bank'         => 'required_if:type,pse|nullable|string|max:100',
            'pse_person_type'  => 'required_if:type,pse|nullable|in:natural,juridica',
            'pse_account_type' => 'nullable|in:ahorros,corriente',
            'pse_email'        => 'required_if:type,pse|nullable|email|max:255',
            'pse_document'     => 'required_if:type,pse|nullable|string|max:20',
            'nequi_phone'      => 'required_if:type,nequi|nullable|string|max:20',
            'nequi_name'       => 'nullable|string|max:100',
            'daviplata_phone'  => 'required_if:type,daviplata|nullable|string|max:20',
        ]);

        if ($request->is_default) {
            ClientPaymentMethod::where('user_id', Auth::id())
                ->update(['is_default' => false]);
        }

        ClientPaymentMethod::updateOrCreate(
            ['user_id' => Auth::id(), 'type' => $request->type],
            $request->only([
                'is_default',
                'pse_bank', 'pse_person_type', 'pse_account_type', 'pse_email', 'pse_document',
                'nequi_phone', 'nequi_name',
                'daviplata_phone',
            ])
        );

        return back()->with('success', 'Método de pago guardado correctamente.');
    }

    public function deletePaymentMethod(Request $request)
    {
        $request->validate(['type' => 'required|in:pse,nequi,daviplata']);

        ClientPaymentMethod::where('user_id', Auth::id())
            ->where('type', $request->type)
            ->delete();

        return back()->with('success', 'Método de pago eliminado.');
    }
}
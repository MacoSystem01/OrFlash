<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientProfile;
use App\Models\DriverProfile;
use App\Models\MerchantProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller {

    public function store(Request $request) {
        $role = $request->role;

        // ── Validación base (todos los roles) ────────────────────────────────
        $rules = [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'role'     => 'required|in:client,store,driver',
            'phone'    => ['required', 'regex:/^(\+57)?[0-9]{10}$/'],
        ];

        // ── Cliente — solo datos básicos (fase 1) ────────────────────────────
        // Dirección, barrio, ciudad y foto de perfil se solicitan en el modal
        // de configuración inicial al primer inicio de sesión.
        if ($role === 'client') {
            $rules['cedula'] = ['nullable', 'regex:/^[0-9]{6,20}$/'];
        }

        // ── Domiciliario — solo datos personales (fase 1) ────────────────────
        // Fotos, residencia y datos del vehículo se solicitan en el modal
        // de configuración inicial al llegar a /pending-approval.
        if ($role === 'driver') {
            $rules['document_type']   = 'required|in:CC,CE,Pasaporte';
            $rules['document_number'] = ['required', 'regex:/^[A-Z0-9]{4,30}$/'];
            $rules['birth_date']      = 'required|date|before_or_equal:' . now()->subYears(18)->format('Y-m-d');
        }

        // ── Merchant (tienda) — registro completo ────────────────────────────
        if ($role === 'store') {
            $rules['merchant_type']       = 'required|in:natural,empresa';
            $rules['document_or_nit']     = 'required|string';
            $rules['accepted_terms']       = 'accepted';
            $rules['accepted_data_policy'] = 'accepted';
            $rules['chamber_of_commerce'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['rut']                 = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120';
        }

        $request->validate($rules, [
            'birth_date.before_or_equal' => 'Debes tener al menos 18 años para registrarte.',
            'password.min'               => 'La contraseña debe tener al menos 8 caracteres.',
            'password.mixed'             => 'La contraseña debe contener mayúsculas y minúsculas.',
            'password.numbers'           => 'La contraseña debe contener al menos un número.',
            'phone.regex'                => 'Ingresa un número de celular colombiano válido (10 dígitos).',
        ]);

        // ── Crear usuario ─────────────────────────────────────────────────────
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => $role,
            'status'   => in_array($role, ['store', 'driver']) ? 'pending' : 'active',
        ]);

        // ── Crear perfil mínimo según rol ─────────────────────────────────────
        if ($role === 'client') {
            ClientProfile::create([
                'user_id' => $user->id,
                'cedula'  => $request->cedula,
                // address / neighborhood / city / profile_photo → fase 2 (modal)
            ]);
        }

        if ($role === 'driver') {
            DriverProfile::create([
                'user_id'         => $user->id,
                'document_type'   => $request->document_type,
                'document_number' => $request->document_number,
                'birth_date'      => $request->birth_date,
                // photos / address / vehicle → fase 2 (modal en /pending-approval)
                'accepted_terms'          => false,
                'accepted_data_policy'    => false,
                'accepted_responsibility' => false,
            ]);
        }

        if ($role === 'store') {
            MerchantProfile::create([
                'user_id'              => $user->id,
                'merchant_type'        => $request->merchant_type,
                'business_name'        => $request->business_name,
                'document_or_nit'      => $request->document_or_nit,
                'legal_representative' => $request->legal_representative,
                'chamber_of_commerce'  => $request->hasFile('chamber_of_commerce')
                    ? $request->file('chamber_of_commerce')->store('merchants/docs', 'public') : null,
                'rut'                  => $request->hasFile('rut')
                    ? $request->file('rut')->store('merchants/docs', 'public') : null,
                'accepted_terms'       => true,
                'accepted_data_policy' => true,
            ]);
        }

        Auth::login($user);

        if ($user->status === 'pending') {
            return redirect('/pending-approval');
        }

        return redirect('/client/home');
    }
}

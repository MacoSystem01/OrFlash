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

        // Validación base
        $rules = [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'role'     => 'required|in:client,store,driver',
            'phone'    => 'required|string|max:20',
        ];

        // Validación cliente
        if ($role === 'client') {
            $rules['address']       = 'required|string';
            $rules['neighborhood']  = 'required|string';
            $rules['city']          = 'required|string';
            $rules['profile_photo'] = 'nullable|file|mimes:jpg,jpeg,png,webp|max:3072';
        }

        // Validación domiciliario
        if ($role === 'driver') {
            $rules['document_type']   = 'required|in:CC,CE,Pasaporte';
            $rules['document_number'] = 'required|string';
            // Debe ser mayor de 18 años
            $rules['birth_date']      = 'required|date|before_or_equal:' . now()->subYears(18)->format('Y-m-d');
            $rules['address']         = 'required|string';
            $rules['neighborhood']    = 'required|string';
            $rules['city']            = 'required|string';
            $rules['vehicle_type']    = 'required|in:moto,bicicleta,carro,a_pie';
            $rules['accepted_terms']          = 'accepted';
            $rules['accepted_data_policy']    = 'accepted';
            $rules['accepted_responsibility'] = 'accepted';
            $rules['document_photo'] = 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120';
            $rules['selfie_photo']   = 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120';

            // SOAT y licencia obligatorios para moto y carro
            if (in_array($request->vehicle_type, ['moto', 'carro'])) {
                $rules['soat']    = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
                $rules['license'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            }
        }

        // Validación merchant (tienda)
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
            'soat.required'              => 'El SOAT es obligatorio para moto y carro.',
            'license.required'           => 'La licencia de conducción es obligatoria para moto y carro.',
            'password.min'               => 'La contraseña debe tener al menos 8 caracteres.',
            'password.mixed'             => 'La contraseña debe contener mayúsculas y minúsculas.',
            'password.numbers'           => 'La contraseña debe contener al menos un número.',
        ]);

        // Crear usuario
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => $role,
            'status'   => in_array($role, ['store', 'driver']) ? 'pending' : 'active',
        ]);

        // Crear perfil según rol
        if ($role === 'client') {
            ClientProfile::create([
                'user_id'         => $user->id,
                'address'         => $request->address,
                'neighborhood'    => $request->neighborhood,
                'city'            => $request->city,
                'references'      => $request->references,
                'alternate_phone' => $request->alternate_phone,
                'cedula'          => $request->cedula,
                'profile_photo'   => $request->hasFile('profile_photo')
                    ? $request->file('profile_photo')->store('profiles', 'public')
                    : null,
            ]);
        }

        if ($role === 'driver') {
            $vehiclePhotos = [];
            if ($request->hasFile('vehicle_photos')) {
                foreach ($request->file('vehicle_photos') as $photo) {
                    $vehiclePhotos[] = $photo->store('drivers/vehicles', 'public');
                }
            }
            DriverProfile::create([
                'user_id'         => $user->id,
                'document_type'   => $request->document_type,
                'document_number' => $request->document_number,
                'document_photo'  => $request->hasFile('document_photo')
                    ? $request->file('document_photo')->store('drivers/docs', 'public') : null,
                'selfie_photo'    => $request->hasFile('selfie_photo')
                    ? $request->file('selfie_photo')->store('drivers/selfies', 'public') : null,
                'birth_date'      => $request->birth_date,
                'address'         => $request->address,
                'neighborhood'    => $request->neighborhood,
                'city'            => $request->city,
                'vehicle_type'    => $request->vehicle_type,
                'vehicle_brand'   => $request->vehicle_brand,
                'vehicle_model'   => $request->vehicle_model,
                'vehicle_color'   => $request->vehicle_color,
                'vehicle_plate'   => $request->vehicle_plate,
                'vehicle_photos'  => $vehiclePhotos,
                'soat'            => $request->hasFile('soat')
                    ? $request->file('soat')->store('drivers/docs', 'public') : null,
                'license'         => $request->hasFile('license')
                    ? $request->file('license')->store('drivers/docs', 'public') : null,
                'accepted_terms'          => true,
                'accepted_data_policy'    => true,
                'accepted_responsibility' => true,
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
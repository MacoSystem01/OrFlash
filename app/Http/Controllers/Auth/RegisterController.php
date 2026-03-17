<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        $role = $request->role;

        // Validación base
        $rules = [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
            'role'     => 'required|in:client,store,driver',
            'phone'    => 'required|string|max:20',
            'cedula'   => 'required|string|max:20',
            'address'  => 'required|string|max:255',
        ];

        // Validación por rol
        if ($role === 'store') {
            $rules['nit']                = 'required|string|max:20';
            $rules['business_name']      = 'required|string|max:255';
            $rules['commercial_address'] = 'required|string|max:255';
            $rules['chamber_of_commerce']= 'required|string|max:255';
        }

        if ($role === 'driver') {
            $rules['license_number'] = 'required|string|max:50';
            $rules['vehicle_plate']  = 'required|string|max:10';
            $rules['arl']            = 'required|string|max:255';
            $rules['insurance']      = 'required|string|max:255';
        }

        $validated = $request->validate($rules);
        $validated['password'] = Hash::make($validated['password']);

        // Tiendas y domiciliarios quedan pendientes
        $validated['status'] = in_array($role, ['store', 'driver']) ? 'pending' : 'active';

        $user = User::create($validated);
        Auth::login($user);

        if ($user->status === 'pending') {
            return redirect('/pending-approval');
        }

        return redirect('/client/home');
    }
}
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        try {
            if (Auth::attempt($credentials, $request->boolean('remember'))) {
                $request->session()->regenerate();

                $role = Auth::user()->role;

                return redirect(match($role) {
                    'admin'  => '/admin/dashboard',
                    'client' => '/client/home',
                    'store'  => '/store',
                    'driver' => '/driver/dashboard',
                    default  => '/dashboard',
                });
            }
        } catch (\RuntimeException $e) {
            if (str_contains($e->getMessage(), 'Bcrypt') || str_contains($e->getMessage(), 'algorithm')) {
                // Contraseña almacenada sin hash bcrypt — se re-hashea automáticamente
                $user = \App\Models\User::where('email', $credentials['email'])->first();

                if ($user && $user->password === $credentials['password']) {
                    $user->update(['password' => \Illuminate\Support\Facades\Hash::make($credentials['password'])]);

                    Auth::login($user, $request->boolean('remember'));
                    $request->session()->regenerate();

                    return redirect(match($user->role) {
                        'admin'  => '/admin/dashboard',
                        'client' => '/client/home',
                        'store'  => '/store',
                        'driver' => '/driver/dashboard',
                        default  => '/dashboard',
                    });
                }

                return back()->withErrors([
                    'email' => 'Error de contraseña. Usa la opción "Olvidé mi contraseña" para restablecerla.',
                ]);
            }

            throw $e;
        }

        return back()->withErrors([
            'email' => 'Las credenciales no son correctas.',
        ]);
    }
}
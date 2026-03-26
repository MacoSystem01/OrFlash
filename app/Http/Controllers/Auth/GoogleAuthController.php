<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ClientProfile;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirigir al usuario a Google para autenticación.
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Manejar el callback de Google.
     * - Si el email ya existe → login directo.
     * - Si es nuevo → crear cuenta client activa + ClientProfile.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            return redirect('/login')->withErrors(['email' => 'No se pudo autenticar con Google. Intenta de nuevo.']);
        }

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Guardar google_id si aún no está registrado
            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }
        } else {
            // Crear nuevo usuario como cliente
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'password'          => bcrypt(Str::random(32)), // contraseña aleatoria, no la usarán
                'role'              => 'client',
                'status'            => 'active',
                'email_verified_at' => now(),
            ]);

            // Crear perfil vacío para que el checkout pueda actualizarse
            ClientProfile::create(['user_id' => $user->id]);
        }

        if ($user->status !== 'active') {
            return redirect('/pending-approval');
        }

        Auth::login($user, true);
        request()->session()->regenerate();

        return redirect(match ($user->role) {
            'admin'  => '/admin/dashboard',
            'store'  => '/store',
            'driver' => '/driver/dashboard',
            default  => '/client/home',
        });
    }
}

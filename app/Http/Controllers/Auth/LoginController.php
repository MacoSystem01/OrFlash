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

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $role = Auth::user()->role;

            return redirect(match($role) {
                'admin'  => '/admin/dashboard',
                'client' => '/client/home',
                'store'  => '/store/dashboard',
                'driver' => '/driver/dashboard',
                default  => '/dashboard',
            });
        }

        return back()->withErrors([
            'email' => 'Las credenciales no son correctas.',
        ]);
    }
}
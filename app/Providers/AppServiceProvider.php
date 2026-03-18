<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Fortify::redirects('login', function () {
            $role = Auth::user()?->role;
            return match($role) {
                'admin'  => '/admin/dashboard',
                'client' => '/client/home',
                'store'  => '/store',
                'driver' => '/driver/dashboard',
                default  => '/dashboard',
            };
        });
    }
}
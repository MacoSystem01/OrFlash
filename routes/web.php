<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Features;

// Página pública
Route::inertia('/', 'public/home')->name('home');

// Redirect post-login según rol
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $role = Auth::user()?->role;
        return redirect(match ($role) {
            'admin'  => '/admin/dashboard',
            'client' => '/client/home',
            'store'  => '/store',
            'driver' => '/driver/dashboard',
            default  => '/',
        });
    })->name('dashboard');
});

// Rutas ADMIN
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::inertia('dashboard',  'admin/dashboard')->name('dashboard');
    Route::inertia('users',      'admin/users')->name('users');
    Route::inertia('stores',     'admin/stores')->name('stores');
    Route::inertia('drivers',    'admin/drivers')->name('drivers');
    Route::inertia('orders',     'admin/orders')->name('orders');
    Route::inertia('analytics',  'admin/analytics')->name('analytics');
    Route::inertia('settings',   'admin/settings')->name('settings');
});

// Rutas CLIENT
Route::middleware(['auth', 'verified', 'role:client'])->prefix('client')->name('client.')->group(function () {
    Route::inertia('home',           'client/home')->name('home');
    Route::inertia('cart',           'client/cart')->name('cart');
    Route::inertia('checkout',       'client/checkout')->name('checkout');
    Route::inertia('order-tracking', 'client/order-tracking')->name('order-tracking');
    Route::inertia('orders',         'client/orders')->name('orders');
    Route::inertia('profile',        'client/profile')->name('profile');
    Route::inertia('store/{id}',     'client/store-detail')->name('store-detail');
});

// Rutas STORE — multi-tienda
Route::middleware(['auth', 'verified', 'role:store'])->prefix('store')->name('store.')->group(function () {
    // Panel grupal
    Route::get('/', [App\Http\Controllers\Store\StoreController::class, 'index'])->name('index');

    // Crear tienda
    Route::get('create',  [App\Http\Controllers\Store\StoreController::class, 'create'])->name('create');
    Route::post('create', [App\Http\Controllers\Store\StoreController::class, 'store'])->name('store');

    // Panel individual por tienda
    Route::get('{storeId}/dashboard',       [App\Http\Controllers\Store\StoreController::class, 'dashboard'])->name('dashboard');
    Route::get('{storeId}/products',        [App\Http\Controllers\Store\StoreController::class, 'products'])->name('products');
    Route::get('{storeId}/orders',          [App\Http\Controllers\Store\StoreController::class, 'orders'])->name('orders');
    Route::get('{storeId}/history',         [App\Http\Controllers\Store\StoreController::class, 'history'])->name('history');
    Route::get('{storeId}/business-status', [App\Http\Controllers\Store\StoreController::class, 'businessStatus'])->name('business-status');
    Route::get('{storeId}/profile',         [App\Http\Controllers\Store\StoreController::class, 'profile'])->name('profile');
});

// Rutas DRIVER
Route::middleware(['auth', 'verified', 'role:driver'])->prefix('driver')->name('driver.')->group(function () {
    Route::inertia('dashboard',        'driver/dashboard')->name('dashboard');
    Route::inertia('available-orders', 'driver/available-orders')->name('available-orders');
    Route::inertia('current-order',    'driver/current-order')->name('current-order');
    Route::inertia('history',          'driver/history')->name('history');
    Route::inertia('profile',          'driver/profile')->name('profile');
});

// Auth custom
Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'store'])
    ->middleware('guest')->name('login.custom');

Route::post('/register', [App\Http\Controllers\Auth\RegisterController::class, 'store'])
    ->middleware('guest')->name('register.custom');

Route::inertia('/pending-approval', 'auth/pending-approval')->name('pending');

// Solo desarrollo
if (app()->environment('local')) {
    Route::inertia('preview/admin',           'admin/dashboard');
    Route::inertia('preview/admin/users',     'admin/users');
    Route::inertia('preview/admin/stores',    'admin/stores');
    Route::inertia('preview/admin/drivers',   'admin/drivers');
    Route::inertia('preview/admin/orders',    'admin/orders');
    Route::inertia('preview/admin/analytics', 'admin/analytics');
    Route::inertia('preview/admin/settings',  'admin/settings');
    Route::inertia('preview/client',          'client/home');
    Route::inertia('preview/client/orders',   'client/orders');
    Route::inertia('preview/client/cart',     'client/cart');
    Route::inertia('preview/client/profile',  'client/profile');
    Route::inertia('preview/store',           'store/index');
    Route::inertia('preview/driver',          'driver/dashboard');
    Route::inertia('preview/driver/orders',   'driver/available-orders');
    Route::inertia('preview/driver/history',  'driver/history');
}

require __DIR__ . '/settings.php';
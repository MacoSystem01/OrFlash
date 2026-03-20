<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Página pública
|--------------------------------------------------------------------------
*/
Route::inertia('/', 'public/home')->name('home');

/*
|--------------------------------------------------------------------------
| Redirección post-login
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $role = Auth::user()?->role;

        return redirect(match ($role) {
            'admin'  => route('admin.dashboard'),
            'client' => route('client.home'),
            'store'  => route('store.index'),
            'driver' => route('driver.dashboard'),
            default  => '/',
        });
    })->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::controller(App\Http\Controllers\Admin\AdminController::class)->group(function () {
            Route::get('dashboard', 'dashboard')->name('dashboard');
            Route::get('orders', 'orders')->name('orders');
            Route::get('users', 'users')->name('users');
            Route::get('stores', 'stores')->name('stores');
            Route::get('drivers', 'drivers')->name('drivers');
            Route::get('analytics', 'analytics')->name('analytics');
            Route::get('settings', 'settings')->name('settings');
        });
    });

/*
|--------------------------------------------------------------------------
| CLIENT
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:client'])
    ->prefix('client')
    ->name('client.')
    ->group(function () {

        Route::inertia('home', 'client/home')->name('home');
        Route::inertia('cart', 'client/cart')->name('cart');
        Route::inertia('checkout', 'client/checkout')->name('checkout');
        Route::inertia('order-tracking', 'client/order-tracking')->name('order-tracking');
        Route::inertia('orders', 'client/orders')->name('orders');
        Route::inertia('store/{id}', 'client/store-detail')->name('store-detail');

        Route::controller(App\Http\Controllers\Client\ClientProfileController::class)
            ->prefix('profile')
            ->name('profile.')
            ->group(function () {
                Route::get('/', 'show')->name('index');
                Route::put('user', 'updateUser')->name('user');
                Route::put('details', 'updateProfile')->name('details');
                Route::put('notifications', 'updateNotifications')->name('notifications');
                Route::post('payment-method', 'savePaymentMethod')->name('payment.save');
                Route::delete('payment-method', 'deletePaymentMethod')->name('payment.delete');
            });
    });

/*
|--------------------------------------------------------------------------
| STORE (MULTI-TIENDA)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:store'])
    ->prefix('store')
    ->name('store.')
    ->group(function () {

        Route::controller(App\Http\Controllers\Store\StoreController::class)->group(function () {

            Route::get('/', 'index')->name('index');

            // 🔥 SOLO POST (modal)
            Route::post('/', 'store')->name('store');

            Route::get('{storeId}/dashboard', 'dashboard')->name('dashboard');
            Route::get('{storeId}/products', 'products')->name('products');
            Route::get('{storeId}/orders', 'orders')->name('orders');
            Route::get('{storeId}/history', 'history')->name('history');
            Route::get('{storeId}/business-status', 'businessStatus')->name('business-status');
            Route::get('{storeId}/profile', 'profile')->name('profile');
        });
    });

/*
|--------------------------------------------------------------------------
| DRIVER
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:driver'])
    ->prefix('driver')
    ->name('driver.')
    ->group(function () {

        Route::inertia('dashboard', 'driver/dashboard')->name('dashboard');
        Route::inertia('available-orders', 'driver/available-orders')->name('available-orders');
        Route::inertia('current-order', 'driver/current-order')->name('current-order');
        Route::inertia('history', 'driver/history')->name('history');
        Route::inertia('profile', 'driver/profile')->name('profile');
    });

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'store'])
    ->middleware('guest')
    ->name('login.custom');

Route::post('/register', [App\Http\Controllers\Auth\RegisterController::class, 'store'])
    ->middleware('guest')
    ->name('register.custom');

Route::post('/logout', [App\Http\Controllers\Auth\LogoutController::class, 'store'])
    ->middleware('auth')
    ->name('logout');

/*
|--------------------------------------------------------------------------
| Otros
|--------------------------------------------------------------------------
*/
Route::inertia('/pending-approval', 'auth/pending-approval')->name('pending');

/*
|--------------------------------------------------------------------------
| Preview (DEV)
|--------------------------------------------------------------------------
*/
if (app()->environment('local')) {
    Route::inertia('preview/store', 'store/index');
}

require __DIR__ . '/settings.php';
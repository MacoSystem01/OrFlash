<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Pública
|--------------------------------------------------------------------------
*/

Route::get('/',           [App\Http\Controllers\Public\PublicController::class, 'home'])->name('home');
Route::get('/stores/{id}', [App\Http\Controllers\Public\PublicController::class, 'storeDetail'])->name('public.store-detail');

/*
|--------------------------------------------------------------------------
| Redirección post-login
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect(match (Auth::user()?->role) {
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
            Route::get('dashboard',            'dashboard')->name('dashboard');
            Route::get('users',                'users')->name('users');
            Route::get('users/{id}',           'userDetail')->name('users.detail');
            Route::patch('users/{id}/toggle',  'toggleUser')->name('users.toggle');
            Route::get('stores',               'stores')->name('stores');
            Route::patch('stores/{id}/toggle',   'toggleStore')->name('stores.toggle');
            Route::patch('stores/{id}/delivery', 'updateStoreDelivery')->name('stores.delivery');
            Route::get('drivers',              'drivers')->name('drivers');
            Route::get('analytics',            'analytics')->name('analytics');

            // Settings
            Route::get('settings',             'settings')->name('settings');
            Route::patch('settings',           'updateSettings')->name('settings.update');

            // Carousel
            Route::get('carousels',              'carousels')->name('carousels');
            Route::post('carousels',             'storeCarousel')->name('carousels.store');
            Route::post('carousels/{id}',        'updateCarousel')->name('carousels.update');
            Route::delete('carousels/{id}',      'destroyCarousel')->name('carousels.destroy');
            Route::patch('carousels/{id}/toggle','toggleCarousel')->name('carousels.toggle');

            // Footer Items
            Route::get('footer-items',               'footerItems')->name('footer-items');
            Route::post('footer-items',              'storeFooterItem')->name('footer-items.store');
            Route::post('footer-items/{id}',         'updateFooterItem')->name('footer-items.update');
            Route::delete('footer-items/{id}',       'destroyFooterItem')->name('footer-items.destroy');
            Route::patch('footer-items/{id}/toggle', 'toggleFooterItem')->name('footer-items.toggle');
        });

        // Pedidos
        Route::get('orders', [App\Http\Controllers\Order\OrderController::class, 'adminOrders'])->name('orders');

        // Wallets
        Route::get('wallets',                          [App\Http\Controllers\Wallet\WalletController::class, 'adminIndex'])->name('wallets');
        Route::post('wallets/{id}/process-withdrawal', [App\Http\Controllers\Wallet\WalletController::class, 'adminProcessWithdrawal'])->name('wallets.process');
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

        // Home con tiendas reales
        Route::get('home', [App\Http\Controllers\Client\ClientProfileController::class, 'home'])->name('home');

        // Carrito — solo vista
        Route::inertia('cart', 'client/cart')->name('cart');

        // Checkout — con datos del perfil
        Route::get('checkout', [App\Http\Controllers\Client\ClientProfileController::class, 'checkout'])->name('checkout');

        // Tienda detalle con productos reales
        Route::get('store/{id}', [App\Http\Controllers\Order\OrderController::class, 'storeDetail'])->name('store-detail');

        // Coordenadas y tarifa de domicilio de una tienda (para calcular tarifa en checkout)
        Route::get('stores/{storeId}/location', [App\Http\Controllers\Order\OrderController::class, 'storeLocation'])->name('stores.location');

        // Pedidos
        Route::post('orders',              [App\Http\Controllers\Order\OrderController::class, 'store'])->name('orders.store');
        Route::get('orders',               [App\Http\Controllers\Order\OrderController::class, 'clientOrders'])->name('orders');
        Route::get('orders/{orderId}/tracking',  [App\Http\Controllers\Order\OrderController::class, 'tracking'])->name('order-tracking');
        Route::delete('orders/{orderId}/cancel',      [App\Http\Controllers\Order\OrderController::class, 'cancelOrder'])->name('orders.cancel');
        Route::post('orders/{orderId}/switch-to-cod', [App\Http\Controllers\Order\OrderController::class, 'switchToCod'])->name('orders.switch-to-cod');

        // Pagos Wompi
        Route::get('payments/generate/{orderId}', [App\Http\Controllers\Payment\PaymentController::class, 'generatePayment'])->name('payments.generate');
        Route::get('payments/return/{orderId}',   [App\Http\Controllers\Payment\PaymentController::class, 'paymentReturn'])->name('payments.return');
        Route::get('payments/status/{orderId}',   [App\Http\Controllers\Payment\PaymentController::class, 'checkStatus'])->name('payments.status');

        // Reseñas
        Route::post('stores/{storeId}/reviews',  [App\Http\Controllers\Client\ReviewController::class, 'rateStore'])->name('stores.review');
        Route::post('drivers/{driverId}/reviews', [App\Http\Controllers\Client\ReviewController::class, 'rateDriver'])->name('drivers.review');

        // Perfil
        Route::controller(App\Http\Controllers\Client\ClientProfileController::class)
            ->prefix('profile')
            ->name('profile.')
            ->group(function () {
                Route::get('/',                 'show')->name('index');
                Route::put('user',              'updateUser')->name('user');
                Route::put('details',           'updateProfile')->name('details');
                Route::put('notifications',     'updateNotifications')->name('notifications');
                Route::post('payment-method',   'savePaymentMethod')->name('payment.save');
                Route::delete('payment-method', 'deletePaymentMethod')->name('payment.delete');
            });
    });

/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:store'])
    ->prefix('store')
    ->name('store.')
    ->group(function () {

        // Index, creación y configuración de tienda
        Route::controller(App\Http\Controllers\Store\StoreController::class)->group(function () {
            Route::get('/',                    'index')->name('index');
            Route::post('/',                   'store')->name('store');
            Route::get('{storeId}/profile',           'profile')->name('profile');
            Route::match(['patch','post'], '{storeId}/info', 'updateInfo')->name('info.update');
            Route::patch('{storeId}/hours',           'updateHours')->name('hours.update');
            Route::patch('{storeId}/payment-methods', 'updatePaymentMethods')->name('payment-methods.update');
        });

        // Dashboard y pedidos — OrderController
        Route::get('{storeId}/dashboard',                  [App\Http\Controllers\Order\OrderController::class, 'storeDashboard'])->name('dashboard');
        Route::get('{storeId}/orders',                     [App\Http\Controllers\Order\OrderController::class, 'storeOrders'])->name('orders');
        Route::patch('{storeId}/orders/{orderId}/advance',    [App\Http\Controllers\Order\OrderController::class, 'advanceOrder'])->name('orders.advance');
        Route::post('{storeId}/orders/{orderId}/reject-cod',  [App\Http\Controllers\Order\OrderController::class, 'rejectCodOrder'])->name('orders.reject-cod');
        Route::get('{storeId}/history',                    [App\Http\Controllers\Order\OrderController::class, 'storeHistory'])->name('history');
        Route::get('{storeId}/report',                     [App\Http\Controllers\Order\OrderController::class, 'storeReport'])->name('report');
        Route::get('{storeId}/business-status',            [App\Http\Controllers\Order\OrderController::class, 'businessStatusPage'])->name('business-status');
        Route::patch('{storeId}/toggle-status',            [App\Http\Controllers\Order\OrderController::class, 'toggleStoreStatus'])->name('toggle-status');

        // Productos — ProductController
        Route::get('{storeId}/products', [App\Http\Controllers\Store\ProductController::class, 'index'])->name('products');
        Route::controller(App\Http\Controllers\Store\ProductController::class)
            ->prefix('{storeId}/products')
            ->name('products.')
            ->group(function () {
                Route::post('/',                    'store')->name('store');
                Route::put('/{productId}',          'update')->name('update');
                Route::delete('/{productId}',       'destroy')->name('destroy');
                Route::patch('/{productId}/toggle', 'toggle')->name('toggle');
                Route::patch('/{productId}/stock',  'updateStock')->name('stock');
            });

        // Wallet tienda
        Route::get('wallet',                 [App\Http\Controllers\Wallet\WalletController::class, 'show'])->name('wallet');
        Route::post('wallet/payment-method', [App\Http\Controllers\Wallet\WalletController::class, 'savePaymentMethod'])->name('wallet.payment-method');
        Route::post('wallet/withdraw',       [App\Http\Controllers\Wallet\WalletController::class, 'requestWithdrawal'])->name('wallet.withdraw');
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

        Route::get('dashboard',    [App\Http\Controllers\Driver\DriverController::class, 'dashboard'])->name('dashboard');
        Route::get('profile',        [App\Http\Controllers\Driver\DriverController::class, 'profile'])->name('profile');
        Route::patch('profile',      [App\Http\Controllers\Driver\DriverController::class, 'updateProfile'])->name('profile.update');
        Route::post('profile/documents', [App\Http\Controllers\Driver\DriverController::class, 'updateDocuments'])->name('profile.documents');

        // Pedidos — OrderController
        Route::get('available-orders',      [App\Http\Controllers\Order\OrderController::class, 'availableOrders'])->name('available-orders');
        Route::post('orders/{id}/accept',   [App\Http\Controllers\Order\OrderController::class, 'acceptOrder'])->name('orders.accept');
        Route::patch('orders/{id}/advance', [App\Http\Controllers\Order\OrderController::class, 'driverAdvanceOrder'])->name('orders.advance');
        Route::get('current-order',         [App\Http\Controllers\Order\OrderController::class, 'currentOrder'])->name('current-order');
        Route::get('history',               [App\Http\Controllers\Order\OrderController::class, 'driverHistory'])->name('history');

        // Wallet driver
        Route::get('wallet',                 [App\Http\Controllers\Wallet\WalletController::class, 'show'])->name('wallet');
        Route::post('wallet/payment-method', [App\Http\Controllers\Wallet\WalletController::class, 'savePaymentMethod'])->name('wallet.payment-method');
        Route::post('wallet/withdraw',       [App\Http\Controllers\Wallet\WalletController::class, 'requestWithdrawal'])->name('wallet.withdraw');
    });

/*
|--------------------------------------------------------------------------
| PAGOS — Webhook Wompi (sin autenticación)
|--------------------------------------------------------------------------
*/
Route::post('api/payments/webhook', [App\Http\Controllers\Payment\PaymentController::class, 'webhook'])
    ->name('payments.webhook');

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::post('/login',    [App\Http\Controllers\Auth\LoginController::class,    'store'])->middleware(['guest', 'throttle:20,1'])->name('login.custom');
Route::post('/register', [App\Http\Controllers\Auth\RegisterController::class, 'store'])->middleware(['guest', 'throttle:10,5'])->name('register.custom');

// Google OAuth
Route::get('/auth/google',          [App\Http\Controllers\Auth\GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [App\Http\Controllers\Auth\GoogleAuthController::class, 'callback'])->name('auth.google.callback');
Route::post('/logout',   [App\Http\Controllers\Auth\LogoutController::class,   'store'])->middleware('auth')->name('logout');

Route::inertia('/pending-approval', 'auth/pending-approval')->name('pending');

/*
|--------------------------------------------------------------------------
| SETUP INICIAL DE PERFIL (fuera del middleware role para drivers pendientes)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'throttle:20,1'])->group(function () {
    Route::post('/client/profile/complete-setup',
        [App\Http\Controllers\Client\ClientProfileController::class, 'completeSetup']
    )->name('client.profile.complete-setup');

    Route::post('/driver/profile/complete-setup',
        [App\Http\Controllers\Driver\DriverController::class, 'completeSetup']
    )->name('driver.profile.complete-setup');
});

/*
|--------------------------------------------------------------------------
| Preview (DEV)
|--------------------------------------------------------------------------
*/
if (app()->environment('local')) {
    Route::inertia('preview/store', 'store/index');
}

require __DIR__ . '/settings.php';

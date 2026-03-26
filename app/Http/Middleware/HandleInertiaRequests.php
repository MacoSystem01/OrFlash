<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user()?->only([
                    'id', 'name', 'email', 'role', 'phone', 'status',
                ]),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'needsSetup'  => $this->checkNeedsSetup($request),
            'support'     => [
                'phone'    => SystemSetting::getValue('support.phone',    '+57 300 000 0000'),
                'whatsapp' => SystemSetting::getValue('support.whatsapp', '573000000000'),
                'email'    => SystemSetting::getValue('support.email',    'soporte@orflash.com'),
            ],
        ];
    }

    /**
     * Determina si el usuario debe completar la configuración inicial de su perfil.
     * Cliente: falta dirección. Domiciliario: falta tipo de vehículo.
     */
    private function checkNeedsSetup(Request $request): bool
    {
        $user = $request->user();
        if (!$user) {
            return false;
        }

        if ($user->role === 'client') {
            $profile = $user->clientProfile;
            return !$profile || empty($profile->address);
        }

        if ($user->role === 'driver') {
            $profile = $user->driverProfile;
            return !$profile || empty($profile->vehicle_type);
        }

        return false;
    }
}

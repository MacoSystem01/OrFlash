<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Dashboard - Inicio admin
     */
    public function dashboard()
    {
        // Datos simulados hasta que los modelos Order y Driver estén disponibles
        $orders = [
            [
                'id' => 1,
                'user' => ['name' => 'Juan Pérez', 'email' => 'juan@example.com'],
                'store' => ['name' => 'Tienda Central'],
                'total' => 45000,
                'quantity' => 3,
                'status' => 'delivered',
                'created_at' => now()->subHours(2)->format('Y-m-d H:i'),
            ],
            [
                'id' => 2,
                'user' => ['name' => 'María García', 'email' => 'maria@example.com'],
                'store' => ['name' => 'Farmacia Salud'],
                'total' => 32000,
                'quantity' => 2,
                'status' => 'in_transit',
                'created_at' => now()->subHours(4)->format('Y-m-d H:i'),
            ],
        ];

        return Inertia::render('admin/dashboard', [
            'orders' => $orders,
        ]);
    }

    /**
     * Ordenes - Lista completa
     */
    public function orders()
    {
        // Datos simulados
        $orders = [
            [
                'id' => 1,
                'user' => ['name' => 'Juan Pérez', 'email' => 'juan@example.com'],
                'store' => ['name' => 'Tienda Central'],
                'total' => 45000,
                'quantity' => 3,
                'items' => [],
                'status' => 'delivered',
                'created_at' => now()->subHours(2)->format('Y-m-d H:i'),
            ],
            [
                'id' => 2,
                'user' => ['name' => 'María García', 'email' => 'maria@example.com'],
                'store' => ['name' => 'Farmacia Salud'],
                'total' => 32000,
                'quantity' => 2,
                'items' => [],
                'status' => 'in_transit',
                'created_at' => now()->subHours(4)->format('Y-m-d H:i'),
            ],
            [
                'id' => 3,
                'user' => ['name' => 'Carlos López', 'email' => 'carlos@example.com'],
                'store' => ['name' => 'Pan y Café'],
                'total' => 28000,
                'quantity' => 4,
                'items' => [],
                'status' => 'pending',
                'created_at' => now()->subHours(6)->format('Y-m-d H:i'),
            ],
        ];

        return Inertia::render('admin/orders', [
            'orders' => $orders,
        ]);
    }

    /**
     * Usuarios
     */
    public function users()
    {
        $users = User::where('role', 'client')
            ->latest()
            ->get();

        return Inertia::render('admin/users', [
            'users' => $users,
        ]);
    }

    /**
     * Tiendas
     */
    public function stores()
    {
        $stores = Store::latest()->get();

        return Inertia::render('admin/stores', [
            'stores' => $stores,
        ]);
    }

    /**
     * Repartidores
     */
    public function drivers()
    {
        return Inertia::render('admin/drivers');
    }

    /**
     * Analítica
     */
    public function analytics()
    {
        return Inertia::render('admin/analytics');
    }

    /**
     * Configuración
     */
    public function settings()
    {
        return Inertia::render('admin/settings');
    }
}

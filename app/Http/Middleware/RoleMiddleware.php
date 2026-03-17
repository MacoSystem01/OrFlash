<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware {
    public function handle(Request $request, Closure $next, string $role): mixed {
        if (!$request->user() || $request->user()->role !== $role) {
            abort(403, 'No autorizado');
        }

        // Bloquear tiendas y domiciliarios pendientes
        if (in_array($request->user()->role, ['store', 'driver']) &&
            $request->user()->status === 'pending') {
            return redirect('/pending-approval');
        }

        return $next($request);
    }
}
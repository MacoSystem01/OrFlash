<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\DriverReview;
use App\Models\Order;
use App\Models\Store;
use App\Models\StoreReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // ─── Calificar tienda ─────────────────────────────────────────────────────

    public function rateStore(Request $request, int $storeId)
    {
        $request->validate([
            'rating'   => 'required|integer|min:1|max:5',
            'comment'  => 'nullable|string|max:500',
            'order_id' => 'nullable|integer|exists:orders,id',
        ]);

        // Verificar que el pedido pertenece al usuario autenticado, a esta tienda
        // y que ya fue entregado — previene IDOR y reseñas de pedidos ajenos
        if ($request->order_id) {
            Order::where('id', $request->order_id)
                ->where('client_id', Auth::id())
                ->where('store_id', $storeId)
                ->where('status', 'delivered')
                ->firstOrFail();
        }

        StoreReview::updateOrCreate(
            [
                'user_id'  => Auth::id(),
                'order_id' => $request->order_id,
            ],
            [
                'store_id' => $storeId,
                'rating'   => $request->rating,
                'comment'  => $request->comment,
            ]
        );

        // Recalcular rating promedio de la tienda
        $avg = StoreReview::where('store_id', $storeId)->avg('rating');
        Store::where('id', $storeId)->update(['rating' => round($avg, 1)]);

        return back()->with('success', '¡Gracias por tu reseña!');
    }

    // ─── Calificar domiciliario ────────────────────────────────────────────────

    public function rateDriver(Request $request, int $driverId)
    {
        $request->validate([
            'rating'   => 'required|integer|min:1|max:5',
            'comment'  => 'nullable|string|max:500',
            'order_id' => 'nullable|integer|exists:orders,id',
        ]);

        // Verificar que el pedido pertenece al usuario autenticado y al domiciliario indicado
        if ($request->order_id) {
            Order::where('id', $request->order_id)
                ->where('client_id', Auth::id())
                ->where('driver_id', $driverId)
                ->where('status', 'delivered')
                ->firstOrFail();
        }

        DriverReview::updateOrCreate(
            [
                'user_id'   => Auth::id(),
                'driver_id' => $driverId,
                'order_id'  => $request->order_id,
            ],
            [
                'rating'  => $request->rating,
                'comment' => $request->comment,
            ]
        );

        return back()->with('success', '¡Gracias por tu reseña!');
    }
}

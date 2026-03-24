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
            'order_id' => 'nullable|exists:orders,id',
        ]);

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
            'order_id' => 'nullable|exists:orders,id',
        ]);

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
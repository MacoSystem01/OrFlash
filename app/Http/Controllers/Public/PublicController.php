<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\FooterItem;
use App\Models\HomeCarousel;
use App\Models\Product;
use App\Models\Store;
use Inertia\Inertia;

class PublicController extends Controller
{
    /**
     * Página pública principal — tiendas y productos reales
     */
    public function home()
    {
        $stores = Store::where('status', 'active')
            ->withCount(['products' => fn ($q) => $q->where('is_available', true)])
            ->latest()
            ->get([
                'id', 'business_name', 'category', 'zone', 'rating',
                'opening_time', 'closing_time', 'is_open', 'images', 'address',
            ]);

        // Productos disponibles de las tiendas activas (máximo 40 para no sobrecargar)
        $products = Product::whereIn('store_id', $stores->pluck('id'))
            ->where('is_available', true)
            ->where('stock', '>', 0)
            ->with('store:id,business_name,category,images')
            ->latest()
            ->limit(40)
            ->get([
                'id', 'store_id', 'name', 'category', 'price', 'images', 'description',
            ]);

        $carousels = HomeCarousel::where('is_active', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get(['id', 'image', 'redirect_url']);

        $footerItems = FooterItem::where('is_active', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get(['id', 'title', 'icon', 'redirect_url']);

        return Inertia::render('public/home', [
            'stores'      => $stores,
            'products'    => $products,
            'carousels'   => $carousels,
            'footerItems' => $footerItems,
        ]);
    }

    /**
     * Detalle público de una tienda — no requiere autenticación
     */
    public function storeDetail(int $id)
    {
        $store = Store::where('status', 'active')
            ->findOrFail($id);

        $products = Product::fromStore($id)
            ->where('is_available', true)
            ->where('stock', '>', 0)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return Inertia::render('public/store-detail', [
            'store'    => $store,
            'products' => $products,
        ]);
    }
}

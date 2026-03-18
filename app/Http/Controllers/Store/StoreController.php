<?php
namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StoreController extends Controller {

    // Panel grupal — lista de todas las tiendas del usuario
    public function index() {
        $stores = Store::where('user_id', Auth::id())->get();
        return Inertia::render('store/index', ['stores' => $stores]);
    }

    // Formulario crear tienda
    public function create() {
        return Inertia::render('store/create');
    }

    // Guardar nueva tienda
    public function store(Request $request) {
        $validated = $request->validate([
            'business_name'   => 'required|string|max:255',
            'nit'             => 'nullable|string|max:20',
            'category'        => 'required|string',
            'zone'            => 'required|string',
            'description'     => 'nullable|string',
            'address'         => 'required|string',
            'phone'           => 'nullable|string|max:20',
            'attention_days'  => 'required|array|min:1',
            'opening_time'    => 'required',
            'closing_time'    => 'required',
            'chamber_of_commerce_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'images.*'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('chamber_of_commerce_file')) {
            $validated['chamber_of_commerce_file'] = $request->file('chamber_of_commerce_file')
                ->store('stores/documents', 'public');
        }

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('stores/images', 'public');
            }
        }

        $validated['images']  = $imagePaths;
        $validated['user_id'] = Auth::id();
        $validated['status']  = 'active';

        $store = Store::create($validated);

        return redirect("/store/{$store->id}/dashboard")
            ->with('success', '¡Tienda creada exitosamente!');
    }

    // Panel individual
    public function dashboard($storeId) {
        $store = Store::where('id', $storeId)->where('user_id', Auth::id())->firstOrFail();
        $stores = Store::where('user_id', Auth::id())->get(['id', 'business_name']);
        return Inertia::render('store/dashboard', ['store' => $store, 'stores' => $stores]);
    }

    public function products($storeId) {
        $store = Store::where('id', $storeId)->where('user_id', Auth::id())->firstOrFail();
        $stores = Store::where('user_id', Auth::id())->get(['id', 'business_name']);
        return Inertia::render('store/products', ['store' => $store, 'stores' => $stores]);
    }

    public function orders($storeId) {
        $store = Store::where('id', $storeId)->where('user_id', Auth::id())->firstOrFail();
        $stores = Store::where('user_id', Auth::id())->get(['id', 'business_name']);
        return Inertia::render('store/orders', ['store' => $store, 'stores' => $stores]);
    }

    public function history($storeId) {
        $store = Store::where('id', $storeId)->where('user_id', Auth::id())->firstOrFail();
        $stores = Store::where('user_id', Auth::id())->get(['id', 'business_name']);
        return Inertia::render('store/history', ['store' => $store, 'stores' => $stores]);
    }

    public function businessStatus($storeId) {
        $store = Store::where('id', $storeId)->where('user_id', Auth::id())->firstOrFail();
        $stores = Store::where('user_id', Auth::id())->get(['id', 'business_name']);
        return Inertia::render('store/business-status', ['store' => $store, 'stores' => $stores]);
    }

    public function profile($storeId) {
        $store = Store::where('id', $storeId)->where('user_id', Auth::id())->firstOrFail();
        $stores = Store::where('user_id', Auth::id())->get(['id', 'business_name']);
        return Inertia::render('store/profile', ['store' => $store, 'stores' => $stores]);
    }
}
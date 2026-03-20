<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StoreController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Listado de tiendas del usuario
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $stores = Store::ownedBy(Auth::id())->latest()->get();

        return Inertia::render('store/index', [
            'stores' => $stores
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Crear tienda (vista)
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        return Inertia::render('store/create');
    }

    /*
    |--------------------------------------------------------------------------
    | Guardar tienda
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name'           => 'required|string|max:255',
            'nit'                     => 'nullable|string|max:20',
            'category'                => 'required|string|max:100',
            'zone'                    => 'required|string|max:100',
            'description'             => 'nullable|string',
            'address'                 => 'required|string|max:255',
            'phone'                   => 'nullable|string|max:20',
            'attention_days'          => 'required|array|min:1',
            'attention_days.*'        => 'string',
            'opening_time'            => 'required|date_format:H:i',
            'closing_time'            => 'required|date_format:H:i',
            'chamber_of_commerce_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'images.*'                => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        DB::beginTransaction();

        try {
            if ($request->hasFile('chamber_of_commerce_file')) {
                $validated['chamber_of_commerce_file'] =
                    $request->file('chamber_of_commerce_file')
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
            $validated['status']  = 'pending';   // pendiente hasta aprobación admin

            $store = Store::create($validated);

            DB::commit();

            return redirect()
                ->route('store.dashboard', $store->id)
                ->with('success', '¡Tienda creada exitosamente!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Error al crear la tienda: ' . $e->getMessage(),
            ]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Obtener tienda (helper interno)
    |--------------------------------------------------------------------------
    */
    private function getStore($storeId)
    {
        return Store::ownedBy(Auth::id())
            ->findOrFail($storeId);
    }

    private function getStoresList()
    {
        return Store::ownedBy(Auth::id())
            ->get(['id', 'business_name']);
    }

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    public function dashboard($storeId)
    {
        return Inertia::render('store/dashboard', [
            'store' => $this->getStore($storeId),
            'stores' => $this->getStoresList(),
        ]);
    }

    public function products($storeId)
    {
        return Inertia::render('store/products', [
            'store' => $this->getStore($storeId),
            'stores' => $this->getStoresList(),
        ]);
    }

    public function orders($storeId)
    {
        return Inertia::render('store/orders', [
            'store' => $this->getStore($storeId),
            'stores' => $this->getStoresList(),
        ]);
    }

    public function history($storeId)
    {
        return Inertia::render('store/history', [
            'store' => $this->getStore($storeId),
            'stores' => $this->getStoresList(),
        ]);
    }

    public function businessStatus($storeId)
    {
        return Inertia::render('store/business-status', [
            'store' => $this->getStore($storeId),
            'stores' => $this->getStoresList(),
        ]);
    }

    public function profile($storeId)
    {
        return Inertia::render('store/profile', [
            'store' => $this->getStore($storeId),
            'stores' => $this->getStoresList(),
        ]);
    }
}

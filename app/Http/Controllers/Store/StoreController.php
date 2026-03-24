<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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

        $storeIds = $stores->pluck('id');

        $totalOrders = Order::whereIn('store_id', $storeIds)->count();

        $totalRevenue = Order::whereIn('store_id', $storeIds)
            ->where('status', 'delivered')
            ->sum('store_earnings');

        return Inertia::render('store/index', [
            'stores'       => $stores,
            'totalOrders'  => $totalOrders,
            'totalRevenue' => $totalRevenue,
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
            \Illuminate\Support\Facades\Log::error('StoreController@store: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Error al crear la tienda. Inténtalo de nuevo.',
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
        $store = $this->getStore($storeId);

        $totalOrders = Order::forStore($storeId)->count();

        $monthlyRevenue = Order::forStore($storeId)
            ->where('status', 'delivered')
            ->whereMonth('delivered_at', now()->month)
            ->whereYear('delivered_at', now()->year)
            ->sum('store_earnings');

        return Inertia::render('store/profile', [
            'store'      => $store,
            'stores'     => $this->getStoresList(),
            'storeStats' => [
                'total_orders'    => $totalOrders,
                'monthly_revenue' => $monthlyRevenue,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Actualizar información del negocio
    |--------------------------------------------------------------------------
    */
    public function updateInfo(Request $request, int $storeId)
    {
        $store = $this->getStore($storeId);

        $validated = $request->validate([
            'business_name' => 'sometimes|required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'address'       => 'sometimes|required|string|max:255',
            'phone'         => 'nullable|string|max:20',
            'category'      => 'sometimes|required|string|max:100',
            'zone'          => 'sometimes|required|string|max:100',
            'images.*'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Procesar nuevas imágenes si las hay
        if ($request->hasFile('images')) {
            // Eliminar imágenes anteriores del storage
            foreach ($store->images ?? [] as $oldPath) {
                Storage::disk('public')->delete($oldPath);
            }

            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('stores/images', 'public');
            }

            $validated['images'] = $imagePaths;
        }

        $store->update($validated);

        return back()->with('success', 'Información del negocio actualizada.');
    }

    /*
    |--------------------------------------------------------------------------
    | Actualizar horarios
    |--------------------------------------------------------------------------
    */
    public function updateHours(Request $request, int $storeId)
    {
        $store = $this->getStore($storeId);

        $validated = $request->validate([
            'opening_time'   => 'required|date_format:H:i',
            'closing_time'   => 'required|date_format:H:i',
            'attention_days' => 'nullable|array',
            'attention_days.*' => 'string|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
        ]);

        $store->update($validated);

        return back()->with('success', 'Horario actualizado correctamente.');
    }
}

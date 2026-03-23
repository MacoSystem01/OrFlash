<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    // ─── Verificar que la tienda pertenece al usuario autenticado ─────────────

    private function getStore(int $storeId): Store
    {
        return Store::where('user_id', Auth::id())
            ->findOrFail($storeId);
    }

    // ─── Listar productos ─────────────────────────────────────────────────────

    public function index(int $storeId)
    {
        $store    = $this->getStore($storeId);
        $products = Product::fromStore($storeId)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $stores = Store::where('user_id', Auth::id())
            ->get(['id', 'business_name']);

        return Inertia::render('store/products', [
            'store'    => $store,
            'stores'   => $stores,
            'products' => $products,
        ]);
    }

    // ─── Crear producto ───────────────────────────────────────────────────────

    public function store(Request $request, int $storeId)
    {
        $this->getStore($storeId);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string|max:1000',
            'category'     => 'required|string|max:100',
            'price'        => 'required|integer|min:100',
            'stock'        => 'required|integer|min:0',
            'is_available' => 'boolean',
            'images.*'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
        ]);

        DB::beginTransaction();

        try {
            $imagePaths = [];

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imagePaths[] = $image->store('products', 'public');
                }
            }

            Product::create([
                'store_id'     => $storeId,
                'name'         => $validated['name'],
                'description'  => $validated['description'] ?? null,
                'category'     => $validated['category'],
                'price'        => $validated['price'],
                'stock'        => $validated['stock'],
                'is_available' => $validated['is_available'] ?? true,
                'images'       => $imagePaths,
            ]);

            DB::commit();

            return back()->with('success', 'Producto creado correctamente.');

        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Error al crear el producto: ' . $e->getMessage(),
            ]);
        }
    }

    // ─── Actualizar producto ──────────────────────────────────────────────────

    public function update(Request $request, int $storeId, int $productId)
    {
        $this->getStore($storeId);

        $product = Product::where('store_id', $storeId)
            ->findOrFail($productId);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string|max:1000',
            'category'     => 'required|string|max:100',
            'price'        => 'required|integer|min:100',
            'stock'        => 'required|integer|min:0',
            'is_available' => 'boolean',
            'images.*'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
        ]);

        DB::beginTransaction();

        try {
            $imagePaths = $product->images ?? [];

            if ($request->hasFile('images')) {
                // Eliminar imágenes anteriores
                foreach ($imagePaths as $oldPath) {
                    Storage::disk('public')->delete($oldPath);
                }
                $imagePaths = [];

                foreach ($request->file('images') as $image) {
                    $imagePaths[] = $image->store('products', 'public');
                }
            }

            $product->update([
                'name'         => $validated['name'],
                'description'  => $validated['description'] ?? null,
                'category'     => $validated['category'],
                'price'        => $validated['price'],
                'stock'        => $validated['stock'],
                'is_available' => $validated['is_available'] ?? true,
                'images'       => $imagePaths,
            ]);

            DB::commit();

            return back()->with('success', 'Producto actualizado correctamente.');

        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Error al actualizar el producto: ' . $e->getMessage(),
            ]);
        }
    }

    // ─── Eliminar producto ────────────────────────────────────────────────────

    public function destroy(int $storeId, int $productId)
    {
        $this->getStore($storeId);

        $product = Product::where('store_id', $storeId)
            ->findOrFail($productId);

        // Eliminar imágenes del storage
        if ($product->images) {
            foreach ($product->images as $path) {
                Storage::disk('public')->delete($path);
            }
        }

        $product->delete();

        return back()->with('success', 'Producto eliminado correctamente.');
    }

    // ─── Toggle disponibilidad ────────────────────────────────────────────────

    public function toggle(int $storeId, int $productId)
    {
        $this->getStore($storeId);

        $product = Product::where('store_id', $storeId)
            ->findOrFail($productId);

        $product->update([
            'is_available' => !$product->is_available,
        ]);

        return back()->with(
            'success',
            $product->is_available
                ? "\"$product->name\" marcado como disponible."
                : "\"$product->name\" marcado como agotado."
        );
    }

    // ─── Actualizar stock ─────────────────────────────────────────────────────

    public function updateStock(Request $request, int $storeId, int $productId)
    {
        $this->getStore($storeId);

        $product = Product::where('store_id', $storeId)
            ->findOrFail($productId);

        $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product->update(['stock' => $request->stock]);

        if ($request->stock > 0 && !$product->is_available) {
            $product->update(['is_available' => true]);
        }

        if ($request->stock === 0) {
            $product->update(['is_available' => false]);
        }

        return back()->with('success', 'Stock actualizado correctamente.');
    }
}
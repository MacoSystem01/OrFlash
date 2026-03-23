import { router, usePage } from '@inertiajs/react';
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import {
  ArrowLeft, Plus, Minus, ShoppingCart,
  Star, Clock, Bike, Package, Search,
} from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { useCartStore } from '@/app/store/cartStore';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  store_id: number;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  is_available: boolean;
  images: string[] | null;
}

interface Store {
  id: number;
  business_name: string;
  category: string;
  description: string | null;
  rating: number;
  opening_time: string;
  closing_time: string;
  is_open: boolean;
  images: string[] | null;
}

interface PageProps {
  store: Store;
  products: Product[];
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryEmoji: Record<string, string> = {
  Abarrotes:  '🛒',
  Farmacia:   '💊',
  Panadería:  '🥐',
  Carnicería: '🥩',
  Verdulería: '🥦',
  Bebidas:    '🥤',
};

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ClientStoreDetail() {
  const { store, products } = usePage<PageProps>().props;

  const { addItem, items, updateQuantity } = useCartStore();

  const categories = [...new Set(products.map(p => p.category))];

  const getQty = (productId: number) =>
    items.find(i => i.product.id === String(productId))?.quantity ?? 0;

  const cartCount = items.reduce((a, b) => a + b.quantity, 0);
  const cartTotal = items.reduce((a, b) => a + b.product.price * b.quantity, 0);

  const handleAdd = (product: Product) => {
    if (product.stock <= getQty(product.id)) return;

    addItem({
      product: {
        id:      String(product.id),
        name:    product.name,
        price:   product.price,
        storeId: String(product.store_id),
      },
      quantity: 1,
    });
  };

  return (
    <ClientLayout>
      <PageTransition className="space-y-0">

        {/* Banner */}
        <div className={`bg-linear-to-br ${gradients[store.id % gradients.length]} p-5 pt-4 text-white`}>
          <button
            onClick={() => router.visit('/client/home')}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>

          <div className="flex items-center gap-4">
            {/* Logo o emoji */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl backdrop-blur-sm overflow-hidden shrink-0">
              {store.images?.[0] ? (
                <img
                  src={`/storage/${store.images[0]}`}
                  className="w-full h-full object-cover"
                  alt={store.business_name}
                />
              ) : (
                <span>{categoryEmoji[store.category] ?? '🏪'}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{store.business_name}</h1>
              {store.description && (
                <p className="text-white/75 text-sm truncate">{store.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-white/75 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  {store.rating > 0 ? store.rating : 'Nuevo'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {store.opening_time} - {store.closing_time}
                </span>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
              store.is_open
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}>
              {store.is_open ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
        </div>

        {/* Aviso tienda cerrada */}
        {!store.is_open && (
          <div className="mx-4 mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 text-center font-medium">
            ⚠️ Esta tienda está cerrada. Podrás hacer pedidos cuando abra.
          </div>
        )}

        {/* Productos */}
        <div className="p-4 space-y-6 pb-32">

          {products.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center">
                <Package className="w-10 h-10 text-violet-500" />
              </div>
              <p className="text-muted-foreground text-sm">Sin productos disponibles</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat}>
                <h2 className="text-base font-bold mb-3">{cat}</h2>
                <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products
                    .filter(p => p.category === cat)
                    .map(product => {
                      const qty        = getQty(product.id);
                      const maxReached = qty >= product.stock;

                      return (
                        <StaggerItem key={product.id}>
                          <div className={`rounded-2xl border bg-card p-4 flex items-center gap-3 transition-all ${
                            !product.is_available ? 'opacity-60' : 'border-border'
                          }`}>

                            {/* Imagen */}
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                              {product.images?.[0] ? (
                                <img
                                  src={`/storage/${product.images[0]}`}
                                  className="w-full h-full object-cover"
                                  alt={product.name}
                                />
                              ) : (
                                <span className="text-2xl">
                                  {categoryEmoji[product.category] ?? '🛍️'}
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                              )}
                              <p className="text-sm font-bold text-violet-600 mt-0.5">
                                {formatPrice(product.price)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.stock} disponibles
                              </p>
                            </div>

                            {/* Controles */}
                            {!product.is_available ? (
                              <span className="text-xs text-red-500 font-medium shrink-0">
                                Agotado
                              </span>
                            ) : !store.is_open ? (
                              <span className="text-xs text-muted-foreground shrink-0">
                                Cerrada
                              </span>
                            ) : (
                              <div className="flex items-center gap-1 shrink-0">
                                {qty > 0 ? (
                                  <>
                                    <button
                                      onClick={() => updateQuantity(String(product.id), qty - 1)}
                                      className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-bold w-5 text-center">{qty}</span>
                                    <button
                                      onClick={() => handleAdd(product)}
                                      disabled={maxReached}
                                      className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/40 disabled:opacity-40"
                                    >
                                      <Plus className="w-3 h-3 text-white" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleAdd(product)}
                                    className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/40 transition-all active:scale-95"
                                  >
                                    <Plus className="w-4 h-4 text-white" />
                                  </button>
                                )}
                              </div>
                            )}

                          </div>
                        </StaggerItem>
                      );
                    })}
                </StaggerList>
              </div>
            ))
          )}
        </div>

        {/* Botón flotante carrito */}
        {cartCount > 0 && (
          <div className="fixed bottom-20 left-4 right-4 z-20">
            <button
              onClick={() => router.visit('/client/cart')}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold shadow-xl shadow-violet-500/40 flex items-center justify-between px-5"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              </div>
              <span>{formatPrice(cartTotal)}</span>
            </button>
          </div>
        )}

      </PageTransition>
    </ClientLayout>
  );
}
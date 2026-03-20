import { router, usePage } from '@inertiajs/react';
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Clock, Bike, Package } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { useCartStore } from '@/app/store/cartStore';
import { formatPrice } from '@/lib/format';

const stores = [
  { id: '1', name: 'Tienda Central',   category: 'Abarrotes',  rating: 4.8, deliveryTime: '20-30 min', deliveryFee: 2500,  isOpen: true,  description: 'Todo lo que necesitas en un solo lugar', gradient: 'from-violet-500 to-purple-600' },
  { id: '2', name: 'Farmacia Salud',   category: 'Farmacia',   rating: 4.5, deliveryTime: '15-25 min', deliveryFee: 2000,  isOpen: true,  description: 'Medicamentos y productos de salud',      gradient: 'from-blue-500 to-cyan-600'     },
  { id: '3', name: 'Pan y Café',       category: 'Panadería',  rating: 4.2, deliveryTime: '25-35 min', deliveryFee: 1500,  isOpen: false, description: 'Pan fresco y café artesanal',             gradient: 'from-amber-500 to-orange-500'  },
  { id: '4', name: 'Carnes del Sur',   category: 'Carnicería', rating: 4.6, deliveryTime: '30-40 min', deliveryFee: 3000,  isOpen: true,  description: 'Carnes frescas de la mejor calidad',      gradient: 'from-emerald-500 to-teal-600'  },
  { id: '5', name: 'Verduras Frescas', category: 'Verdulería', rating: 4.3, deliveryTime: '20-30 min', deliveryFee: 2000,  isOpen: true,  description: 'Frutas y verduras del día',               gradient: 'from-pink-500 to-rose-600'     },
];

const products = [
  { id: 'p1',  storeId: '1', name: 'Arroz x 1kg',      category: 'Granos',      price: 3500,  inStock: true  },
  { id: 'p2',  storeId: '1', name: 'Aceite x 1L',      category: 'Granos',      price: 8900,  inStock: true  },
  { id: 'p3',  storeId: '1', name: 'Pasta x 500g',     category: 'Granos',      price: 2800,  inStock: false },
  { id: 'p4',  storeId: '1', name: 'Leche x 1L',       category: 'Lácteos',     price: 4200,  inStock: true  },
  { id: 'p5',  storeId: '1', name: 'Queso x 250g',     category: 'Lácteos',     price: 7500,  inStock: true  },
  { id: 'p6',  storeId: '2', name: 'Ibuprofeno 400mg', category: 'Analgésicos', price: 5900,  inStock: true  },
  { id: 'p7',  storeId: '2', name: 'Vitamina C',       category: 'Vitaminas',   price: 12000, inStock: true  },
  { id: 'p8',  storeId: '3', name: 'Pan francés x6',   category: 'Panes',       price: 3000,  inStock: true  },
  { id: 'p9',  storeId: '3', name: 'Croissant x3',     category: 'Panes',       price: 5500,  inStock: true  },
  { id: 'p10', storeId: '4', name: 'Pollo x kg',       category: 'Carnes',      price: 14000, inStock: true  },
  { id: 'p11', storeId: '5', name: 'Tomate x kg',      category: 'Verduras',    price: 3200,  inStock: true  },
];

const storeEmoji = (category: string) =>
  category === 'Abarrotes'  ? '🛒' :
  category === 'Farmacia'   ? '💊' :
  category === 'Panadería'  ? '🥐' :
  category === 'Carnicería' ? '🥩' : '🥦';

export default function ClientStoreDetail() {
  const { url } = usePage();
  const id = url.split('/').pop() ?? '';
  const store = stores.find((s) => s.id === id) ?? stores[0];
  const storeProducts = products.filter((p) => p.storeId === store.id);
  const categories = [...new Set(storeProducts.map((p) => p.category))];

  const { addItem, items, updateQuantity } = useCartStore();

  const getQty = (productId: string) =>
    items.find((i) => i.product.id === productId)?.quantity ?? 0;

  const cartCount = items.reduce((a, b) => a + b.quantity, 0);
  const cartTotal = items.reduce((a, b) => a + b.product.price * b.quantity, 0);

  const handleAdd = (product: typeof products[0]) => {
    addItem({
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        storeId: product.storeId,
      },
      quantity: 1,
    });
  };

  return (
    <ClientLayout>
      <PageTransition className="space-y-0">

        {/* Banner */}
        <div className={`bg-gradient-to-br ${store.gradient} p-5 pt-4 text-white`}>
          <button
            onClick={() => router.visit('/client/home')}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl backdrop-blur-sm">
              {storeEmoji(store.category)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{store.name}</h1>
              <p className="text-white/75 text-sm">{store.description}</p>
              <div className="flex items-center gap-3 text-xs text-white/75 mt-2">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-white" />{store.rating}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{store.deliveryTime}</span>
                <span className="flex items-center gap-1"><Bike className="w-3 h-3" />{formatPrice(store.deliveryFee)}</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${store.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
              {store.isOpen ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
        </div>

        {/* Productos */}
        <div className="p-4 space-y-6 pb-32">
          {storeProducts.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center">
                <Package className="w-10 h-10 text-violet-500" />
              </div>
              <p className="text-muted-foreground text-sm">Sin productos disponibles</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat}>
                <h2 className="text-base font-bold mb-3">{cat}</h2>
                <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {storeProducts.filter((p) => p.category === cat).map((product) => (
                    <StaggerItem key={product.id}>
                      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl shrink-0">
                          🛍️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-sm font-bold text-violet-600 mt-0.5">{formatPrice(product.price)}</p>
                        </div>
                        {product.inStock ? (
                          <div className="flex items-center gap-1 shrink-0">
                            {getQty(product.id) > 0 ? (
                              <>
                                <button
                                  onClick={() => updateQuantity(product.id, getQty(product.id) - 1)}
                                  className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-bold w-5 text-center">{getQty(product.id)}</span>
                                <button
                                  onClick={() => handleAdd(product)}
                                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/40"
                                >
                                  <Plus className="w-3 h-3 text-white" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAdd(product)}
                                className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/40 transition-all active:scale-95"
                              >
                                <Plus className="w-4 h-4 text-white" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-red-500 font-medium shrink-0">Agotado</span>
                        )}
                      </div>
                    </StaggerItem>
                  ))}
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-xl shadow-violet-500/40 flex items-center justify-between px-5"
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
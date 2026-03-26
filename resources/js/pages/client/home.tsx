import { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Search, MapPin, Star, Clock, Bike, Loader, Store, ShoppingBag, Plus } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { useAreaStore } from '@/app/store/areaStore';
import { useCartStore } from '@/app/store/cartStore';
import ClientMap from '@/components/map/ClientMap';
import { StoresMarkers } from '@/components/map/MapMarkers';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface StoreItem {
  id: number;
  business_name: string;
  category: string;
  rating: number;
  opening_time: string;
  closing_time: string;
  delivery_fee?: number;
  is_open: boolean;
  zone: string;
  images: string[] | null;
  lat?: number;
  lng?: number;
}

interface ProductItem {
  id: number;
  store_id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[] | null;
  description: string | null;
  store: { id: number; business_name: string; category: string; images: string[] | null };
}

interface PageProps {
  stores: StoreItem[];
  products: ProductItem[];
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

export default function ClientHome() {
  const { stores, products = [] } = usePage<PageProps>().props;

  const [search,          setSearch]       = useState('');
  const [selectedCat,     setSelectedCat]  = useState('Todos');
  const [activeTab,       setActiveTab]    = useState<'stores' | 'products'>('stores');
  const [address,         setAddress]      = useState('Obteniendo ubicación...');
  const [loadingLocation, setLoadingLoc]   = useState(true);

  const { userLat, userLng, setUserCoords } = useAreaStore();
  const { addItem, items } = useCartStore();

  const getQty = (productId: number) =>
    items.find(i => i.product.id === String(productId))?.quantity ?? 0;

  const handleAddToCart = (product: ProductItem) => {
    if (getQty(product.id) >= product.stock) return;
    addItem({
      product: { id: String(product.id), name: product.name, price: product.price, storeId: String(product.store_id) },
      quantity: 1,
    });
  };

  // Categorías dinámicas desde BD
  const categories = ['Todos', ...Array.from(new Set(stores.map(s => s.category)))];

  // Mapa de tiendas que tienen coordenadas
  const mapStores = stores
    .filter(s => s.lat && s.lng)
    .map(s => ({
      id:     String(s.id),
      name:   s.business_name,
      lat:    s.lat!,
      lng:    s.lng!,
      isOpen: s.is_open,
    }));

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLoadingLoc(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setUserCoords(latitude, longitude);
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const a    = data.address || {};
          const parts = [
            a.road,
            a.house_number,
            a.neighbourhood || a.suburb,
            a.city || a.town || a.village,
          ].filter(Boolean);
          setAddress(parts.length ? parts.join(', ') : data.display_name ?? 'Ubicación actual');
        } catch {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLoadingLoc(false);
      },
      () => {
        setAddress('Ubicación no disponible');
        setLoadingLoc(false);
      }
    );
  }, [setUserCoords]);

  const filteredStores = stores.filter(s =>
    s.business_name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedCat === 'Todos' || s.category === selectedCat)
  );

  const filteredProducts = (products as ProductItem[]).filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.store?.business_name?.toLowerCase().includes(search.toLowerCase())) &&
    (selectedCat === 'Todos' || p.store?.category === selectedCat)
  );

  return (
    <ClientLayout>
      <PageTransition className="space-y-6 p-4">

        {/* Hero */}
        <div className="rounded-2xl bg-linear-to-br from-violet-600 to-purple-700 p-5 text-white shadow-xl shadow-violet-500/30">
          <div className="flex items-center gap-1.5 text-violet-200 text-xs mb-2">
            {loadingLocation ? (
              <><Loader className="w-3 h-3 animate-spin" /><span>Obteniendo ubicación...</span></>
            ) : (
              <><MapPin className="w-3 h-3" /><span>{address}</span></>
            )}
          </div>
          <h1 className="text-2xl font-bold">¿Qué necesitas hoy? 👋</h1>
          <p className="text-violet-200 text-sm mt-1">Entrega rápida a tu puerta</p>
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tiendas..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-1.5 font-medium transition-all ${
                selectedCat === cat
                  ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {categoryEmoji[cat] ?? '🛍️'} {cat}
            </button>
          ))}
        </div>

        {/* Tabs: Tiendas | Productos */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
          {(['stores', 'products'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'stores'
                ? `🏪 Tiendas (${filteredStores.length})`
                : `🛍️ Productos (${filteredProducts.length})`}
            </button>
          ))}
        </div>

        {/* Mapa */}
        {activeTab === 'stores' && userLat && userLng && mapStores.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
            <ClientMap center={[userLat, userLng]} zoom={14} height="h-[220px]">
              <StoresMarkers stores={mapStores} />
            </ClientMap>
          </div>
        )}

        {/* Grid Tiendas */}
        {activeTab === 'stores' && (
          filteredStores.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <Store className="w-8 h-8 text-violet-500" />
              </div>
              <p className="text-muted-foreground text-sm">No se encontraron tiendas</p>
            </div>
          ) : (
            <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStores.map((store, i) => (
                <StaggerItem key={store.id}>
                  <Link href={`/client/store/${store.id}`}>
                    <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                      <div className="relative h-36 overflow-hidden">
                        {store.images?.[0] ? (
                          <img
                            src={`/storage/${store.images[0]}`}
                            alt={store.business_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-linear-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                            <span className="text-4xl">{categoryEmoji[store.category] ?? '🛍️'}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          store.is_open
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {store.is_open ? 'Abierta' : 'Cerrada'}
                        </span>
                        <p className="absolute bottom-2 left-3 text-white text-xs font-medium">
                          {store.zone}
                        </p>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{store.business_name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{store.category}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 text-amber-500 font-medium">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {store.rating > 0 ? store.rating : '—'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {store.opening_time} - {store.closing_time}
                          </span>
                          {store.delivery_fee != null && (
                            <span className="flex items-center gap-1">
                              <Bike className="w-3 h-3" />
                              {formatPrice(store.delivery_fee)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          )
        )}

        {/* Grid Productos */}
        {activeTab === 'products' && (
          filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-violet-500" />
              </div>
              <p className="text-muted-foreground text-sm">No se encontraron productos</p>
            </div>
          ) : (
            <StaggerList className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((product, i) => {
                const qty = getQty(product.id);
                const maxReached = qty >= product.stock;
                return (
                  <StaggerItem key={product.id}>
                    <div
                      className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => router.visit(`/client/store/${product.store_id}`)}
                    >
                      <div className="relative h-28 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={`/storage/${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-linear-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                            <span className="text-3xl">{categoryEmoji[product.category] ?? '📦'}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.store?.business_name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-violet-600">{formatPrice(product.price)}</span>
                          <button
                            onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                            disabled={maxReached}
                            className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/30 disabled:opacity-40 transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerList>
          )
        )}

      </PageTransition>
    </ClientLayout>
  );
}
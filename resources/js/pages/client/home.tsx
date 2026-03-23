import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Search, MapPin, Star, Clock, Bike, Loader, Store } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { useAreaStore } from '@/app/store/areaStore';
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
  lat?: number;
  lng?: number;
}

interface PageProps {
  stores: StoreItem[];
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
  const { stores } = usePage<PageProps>().props;

  const [search,          setSearch]       = useState('');
  const [selectedCat,     setSelectedCat]  = useState('Todos');
  const [address,         setAddress]      = useState('Obteniendo ubicación...');
  const [loadingLocation, setLoadingLoc]   = useState(true);

  const { userLat, userLng, setUserCoords } = useAreaStore();

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

  const filtered = stores.filter(s =>
    s.business_name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedCat === 'Todos' || s.category === selectedCat)
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

        {/* Mapa */}
        {userLat && userLng && mapStores.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
            <ClientMap center={[userLat, userLng]} zoom={14} height="h-[220px]">
              <StoresMarkers stores={mapStores} />
            </ClientMap>
          </div>
        )}

        {/* Tiendas */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Store className="w-8 h-8 text-violet-500" />
            </div>
            <p className="text-muted-foreground text-sm">No se encontraron tiendas</p>
          </div>
        ) : (
          <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((store, i) => (
              <StaggerItem key={store.id}>
                <Link href={`/client/store/${store.id}`}>
                  <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                    <div className={`h-20 bg-linear-to-r ${gradients[i % gradients.length]} relative flex items-center justify-center`}>
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                        }}
                      />
                      <span className="text-4xl relative z-10">
                        {categoryEmoji[store.category] ?? '🛍️'}
                      </span>
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        store.is_open
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {store.is_open ? 'Abierta' : 'Cerrada'}
                      </span>
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
        )}

      </PageTransition>
    </ClientLayout>
  );
}
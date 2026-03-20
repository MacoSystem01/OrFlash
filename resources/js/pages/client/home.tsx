import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Search, MapPin, Star, Clock, Bike, Loader, Store, Users, Layers } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { useAreaStore } from '@/app/store/areaStore';
import ClientMap from '@/components/map/ClientMap';
import { StoresMarkers, DriversMarkers } from '@/components/map/MapMarkers';
import { formatPrice } from '@/lib/format';

// ─── Datos estáticos ───────────────────────────────────────────────────────────

const stores = [
  { id: '1', name: 'Tienda Central', category: 'Abarrotes', rating: 4.8, deliveryTime: '20-30 min', deliveryFee: 2500, isOpen: true, gradient: 'from-violet-500 to-purple-600', lat: 3.4516, lng: -76.5320 },
  { id: '2', name: 'Farmacia Salud', category: 'Farmacia', rating: 4.5, deliveryTime: '15-25 min', deliveryFee: 2000, isOpen: true, gradient: 'from-blue-500 to-cyan-600', lat: 3.4372, lng: -76.5225 },
  { id: '3', name: 'Pan y Café', category: 'Panadería', rating: 4.2, deliveryTime: '25-35 min', deliveryFee: 1500, isOpen: false, gradient: 'from-amber-500 to-orange-500', lat: 3.4600, lng: -76.5450 },
  { id: '4', name: 'Carnes del Sur', category: 'Carnicería', rating: 4.6, deliveryTime: '30-40 min', deliveryFee: 3000, isOpen: true, gradient: 'from-emerald-500 to-teal-600', lat: 3.4280, lng: -76.5100 },
  { id: '5', name: 'Verduras Frescas', category: 'Verdulería', rating: 4.3, deliveryTime: '20-30 min', deliveryFee: 2000, isOpen: true, gradient: 'from-pink-500 to-rose-600', lat: 3.4450, lng: -76.5300 },
];

const categories = [
  { id: '1', name: 'Todos', emoji: '🛍️' },
  { id: '2', name: 'Abarrotes', emoji: '🛒' },
  { id: '3', name: 'Farmacia', emoji: '💊' },
  { id: '4', name: 'Panadería', emoji: '🥐' },
  { id: '5', name: 'Carnicería', emoji: '🥩' },
  { id: '6', name: 'Verdulería', emoji: '🥦' },
];

const drivers = [
  { id: '1', name: 'Carlos López', lat: 3.4516, lng: -76.5320, status: 'available' as const },
  { id: '2', name: 'María García', lat: 3.4372, lng: -76.5225, status: 'busy' as const },
  { id: '3', name: 'Juan Pérez', lat: 3.4600, lng: -76.5450, status: 'available' as const },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const storeEmoji = (category: string) =>
  category === 'Abarrotes' ? '🛒' :
    category === 'Farmacia' ? '💊' :
      category === 'Panadería' ? '🥐' :
        category === 'Carnicería' ? '🥩' : '🥦';

// ─── Tipos del carrusel ────────────────────────────────────────────────────────

type StoreItem = {
  type: 'store';
  id: string;
  data: typeof stores[0];
};

type ProductItem = {
  type: 'product';
  id: string;
  storeId: string;
  storeName: string;
  gradient: string;
  name: string;
  price: number;
  emoji: string;
};

type LogoItem = {
  type: 'logo';
  id: string;
};

type CarouselItem = StoreItem | ProductItem | LogoItem;

// ─── Builder del carrusel ──────────────────────────────────────────────────────

function buildCarouselItems(): CarouselItem[] {
  const productNames: Record<string, string[]> = {
    'Abarrotes': ['Arroz 500g', 'Aceite 1L'],
    'Farmacia': ['Ibuprofeno', 'Vitamina C'],
    'Panadería': ['Croissant', 'Pan de queso'],
    'Carnicería': ['Pollo x kg', 'Carne molida'],
    'Verdulería': ['Tomate x kg', 'Lechuga'],
  };
  const productEmojis: Record<string, string[]> = {
    'Abarrotes': ['🌾', '🫙'],
    'Farmacia': ['💊', '🍊'],
    'Panadería': ['🥐', '🧀'],
    'Carnicería': ['🍗', '🥩'],
    'Verdulería': ['🍅', '🥬'],
  };
  const prices = [2500, 4500, 1800, 3200, 2100, 5000];
  const items: CarouselItem[] = [];

  stores.forEach((store, i) => {
    items.push({ type: 'store', id: `store-${store.id}`, data: store });

    const p0: ProductItem = {
      type: 'product',
      id: `${store.id}-prod-0`,
      storeId: store.id,
      storeName: store.name,
      gradient: store.gradient,
      name: productNames[store.category]?.[0] ?? 'Producto',
      price: prices[(parseInt(store.id) * 2) % 6],
      emoji: productEmojis[store.category]?.[0] ?? '📦',
    };
    items.push(p0);

    if (i % 2 === 1) items.push({ type: 'logo', id: `logo-${i}` });

    const p1: ProductItem = {
      type: 'product',
      id: `${store.id}-prod-1`,
      storeId: store.id,
      storeName: store.name,
      gradient: store.gradient,
      name: productNames[store.category]?.[1] ?? 'Producto',
      price: prices[(parseInt(store.id) * 2 + 1) % 6],
      emoji: productEmojis[store.category]?.[1] ?? '📦',
    };
    items.push(p1);
  });

  return items;
}

// ─── Componente CarouselBanner ─────────────────────────────────────────────────

function CarouselBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const items = buildCarouselItems();
  const doubled = [...items, ...items];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const total = el.scrollWidth / 2;
    let frame: number;
    let pos = 0;

    const tick = () => {
      pos += 0.5;
      if (pos >= total) pos = 0;
      el.scrollLeft = pos;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    const pause = () => cancelAnimationFrame(frame);
    const resume = () => { frame = requestAnimationFrame(tick); };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-base px-1">✨ Destacados</h2>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {doubled.map((item, i) => {
          const key = `${item.id}-${i}`;

          if (item.type === 'logo') return (
            <div
              key={key}
              className="shrink-0 w-56 h-64 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex flex-col items-center justify-center gap-3 shadow-lg shadow-violet-500/30"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-4xl">⚡</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tight">OrFlash</span>
              <span className="text-violet-200 text-sm font-medium">Delivery Rápido</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-semibold">
                🚀 En tu puerta
              </span>
            </div>
          );

          if (item.type === 'store') {
            const store = item.data;
            return (
              <Link
                key={key}
                href={`/client/store/${store.id}`}
                className="shrink-0 w-56 h-64 rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all flex flex-col"
              >
                <div className={`h-36 w-full bg-gradient-to-br ${store.gradient} flex items-center justify-center relative`}>
                  <span className="text-6xl">{storeEmoji(store.category)}</span>
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${store.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {store.isOpen ? 'Abierta' : 'Cerrada'}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="font-bold text-base truncate">{store.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{store.category}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-sm text-amber-500 font-bold">{store.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{store.deliveryTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      🚴 Envío {formatPrice(store.deliveryFee)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={key}
              href={`/client/store/${item.storeId}`}
              className="shrink-0 w-56 h-64 rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all flex flex-col"
            >
              <div className={`h-36 w-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                <span className="text-6xl">{item.emoji}</span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <p className="font-bold text-base truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">📍 {item.storeName}</p>
                </div>
                <p className="text-xl font-black text-primary">
                  {formatPrice(item.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente MapPanel ───────────────────────────────────────────────────────

type MapLayer = 'stores' | 'drivers' | 'both';

function MapPanel({ userLat, userLng }: { userLat: number; userLng: number }) {
  const [layer, setLayer] = useState<MapLayer>('both');

  const layerButtons: { key: MapLayer; label: string; icon: React.ReactNode }[] = [
    { key: 'stores', label: 'Tiendas', icon: <Store className="w-3.5 h-3.5" /> },
    { key: 'drivers', label: 'Repartidores', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'both', label: 'Ambos', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
      {/* Selector de capa */}
      <div className="flex border-b border-border bg-card">
        {layerButtons.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setLayer(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${layer === key
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Mapa */}
      <ClientMap
        center={[userLat, userLng]}
        zoom={14}
        height="h-[220px]"
      >
        {(layer === 'stores' || layer === 'both') && (
          <StoresMarkers stores={stores} />
        )}
        {(layer === 'drivers' || layer === 'both') && (
          <DriversMarkers drivers={drivers} />
        )}
      </ClientMap>

      {/* Leyenda */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
          Radio 2 km
        </span>
        {layer !== 'drivers' && (
          <span className="flex items-center gap-1">
            🛒 {stores.length} tiendas
          </span>
        )}
        {layer !== 'stores' && (
          <span className="flex items-center gap-1">
            🚴 {drivers.filter(d => d.status === 'available').length} disponibles
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function ClientHome() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [address, setAddress] = useState('Obteniendo ubicación...');
  const [loadingLocation, setLoadingLocation] = useState(true);

  const { userLat, userLng, setUserCoords } = useAreaStore();

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setUserCoords(latitude, longitude);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address || {};
          const parts = [
            addr.road,
            addr.house_number,
            addr.neighbourhood || addr.suburb,
            addr.city || addr.town || addr.village || addr.municipality,
            addr.state,
            addr.country,
          ].filter(Boolean);
          setAddress(parts.length > 0 ? parts.join(', ') : data.display_name || 'Ubicación actual');
        } catch {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLoadingLocation(false);
      },
      () => {
        setAddress('Ubicación no disponible');
        setLoadingLocation(false);
      }
    );
  }, [setUserCoords]);

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedCat === 'Todos' || s.category === selectedCat)
  );

  return (
    <ClientLayout>
      <PageTransition className="space-y-6 p-4">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white shadow-xl shadow-violet-500/30">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tiendas..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.name)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-1.5 font-medium transition-all ${selectedCat === cat.name
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
            >
              <span>{cat.emoji}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* Mapa */}
        {userLat && userLng && (
          <MapPanel userLat={userLat} userLng={userLng} />
        )}

        {/* Tiendas */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((store) => (
            <StaggerItem key={store.id}>
              <Link href={`/client/store/${store.id}`}>
                <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                  <div className={`h-20 bg-gradient-to-r ${store.gradient} relative flex items-center justify-center`}>
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                    <span className="text-4xl relative z-10">{storeEmoji(store.category)}</span>
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${store.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {store.isOpen ? 'Abierta' : 'Cerrada'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{store.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{store.category}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-amber-500 font-medium">
                        <Star className="w-3 h-3 fill-amber-500" />{store.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{store.deliveryTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bike className="w-3 h-3" />{formatPrice(store.deliveryFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Carrusel Principal */}
        <CarouselBanner />

      </PageTransition>
    </ClientLayout>
  );
}
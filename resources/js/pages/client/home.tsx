import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Search, MapPin, Star, Clock, Bike, Loader, Users } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { useAreaStore } from '@/app/store/areaStore';
import ClientMap from '@/components/map/ClientMap';
import { StoresMarkers, DriversMarkers } from '@/components/map/MapMarkers';

const stores = [
  { id: '1', name: 'Tienda Central',   category: 'Abarrotes', rating: 4.8, deliveryTime: '20-30 min', deliveryFee: 2500, isOpen: true,  gradient: 'from-violet-500 to-purple-600', lat: 3.4516, lng: -76.532 },
  { id: '2', name: 'Farmacia Salud',   category: 'Farmacia',  rating: 4.5, deliveryTime: '15-25 min', deliveryFee: 2000, isOpen: true,  gradient: 'from-blue-500 to-cyan-600', lat: 3.4372, lng: -76.5225 },
  { id: '3', name: 'Pan y Café',       category: 'Panadería', rating: 4.2, deliveryTime: '25-35 min', deliveryFee: 1500, isOpen: false, gradient: 'from-amber-500 to-orange-500', lat: 3.4600, lng: -76.5450 },
  { id: '4', name: 'Carnes del Sur',   category: 'Carnicería',rating: 4.6, deliveryTime: '30-40 min', deliveryFee: 3000, isOpen: true,  gradient: 'from-emerald-500 to-teal-600', lat: 3.4280, lng: -76.5100 },
  { id: '5', name: 'Verduras Frescas', category: 'Verdulería',rating: 4.3, deliveryTime: '20-30 min', deliveryFee: 2000, isOpen: true,  gradient: 'from-pink-500 to-rose-600', lat: 3.4450, lng: -76.5300 },
];

const categories = [
  { id: '1', name: 'Todos',      emoji: '🛍️' },
  { id: '2', name: 'Abarrotes',  emoji: '🛒' },
  { id: '3', name: 'Farmacia',   emoji: '💊' },
  { id: '4', name: 'Panadería',  emoji: '🥐' },
  { id: '5', name: 'Carnicería', emoji: '🥩' },
  { id: '6', name: 'Verdulería', emoji: '🥦' },
];

// Repartidores disponibles
const drivers = [
  { id: '1', name: 'Carlos López', lat: 3.4516, lng: -76.532, status: 'available' as const },
  { id: '2', name: 'María García', lat: 3.4372, lng: -76.5225, status: 'busy' as const },
  { id: '3', name: 'Juan Pérez', lat: 3.4600, lng: -76.5450, status: 'available' as const },
];

export default function ClientHome() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [address, setAddress] = useState('Obteniendo ubicación...');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);
  
  const { userLat, userLng, setUserCoords } = useAreaStore();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords(latitude, longitude);
          
          // Intentar obtener la dirección usando geolocation inversa
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const displayAddress = data.address?.road 
              ? `${data.address.road} ${data.address.house_number || ''}`
              : data.address?.suburb || data.address?.city || 'Ubicación actual';
            setAddress(displayAddress.trim());
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
    }
  }, [setUserCoords]);

  const filtered = stores.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'Todos' || s.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <ClientLayout>
      <PageTransition className="space-y-6 p-4">
        {/* Hero */}
        <div className="rounded-2xl bg-linear-to-br from-violet-600 to-purple-700 p-5 text-white shadow-xl shadow-violet-500/30">
          <div className="flex items-center gap-1.5 text-violet-200 text-xs mb-2">
            {loadingLocation ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                <span>Obteniendo ubicación...</span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                <span>{address}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold">¿Qué necesitas hoy? 👋</h1>
          <p className="text-violet-200 text-sm mt-1">Entrega rápida a tu puerta</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tiendas..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.name)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-1.5 font-medium transition-all ${
                selectedCat === cat.name
                  ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{cat.emoji}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* Map Toggle Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-medium text-sm transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
          </button>
          <button
            onClick={() => setShowDrivers(!showDrivers)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-medium text-sm transition-colors"
          >
            <Users className="w-4 h-4" />
            {showDrivers ? 'Ocultar Repartidores' : 'Ver Repartidores'}
          </button>
        </div>

        {/* Map */}
        {showMap && userLat && userLng && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
            <ClientMap center={[userLat, userLng]} zoom={15} height="h-[280px]">
              <StoresMarkers stores={stores} />
            </ClientMap>
          </div>
        )}

        {/* Drivers List */}
        {showDrivers && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm px-1">Repartidores Disponibles</h3>
            {drivers.map((driver) => (
              <div key={driver.id} className={`rounded-xl p-4 border flex items-center justify-between ${
                driver.status === 'available'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-orange-50/50 border-orange-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    driver.status === 'available'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-orange-500 text-white'
                  }`}>
                    🚴
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{driver.name}</p>
                    <p className={`text-xs ${
                      driver.status === 'available'
                        ? 'text-emerald-600'
                        : 'text-orange-600'
                    }`}>
                      {driver.status === 'available' ? '🟢 Disponible' : '🟠 Ocupado'}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-medium transition-colors">
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stores */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((store) => (
            <StaggerItem key={store.id}>
              <Link href={`/client/store/${store.id}`}>
                <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                  <div className={`h-20 bg-linear-to-r ${store.gradient} relative flex items-center justify-center`}>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <span className="text-4xl relative z-10">
                      {store.category === 'Abarrotes' ? '🛒' : store.category === 'Farmacia' ? '💊' : store.category === 'Panadería' ? '🥐' : store.category === 'Carnicería' ? '🥩' : '🥦'}
                    </span>
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${store.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {store.isOpen ? 'Abierta' : 'Cerrada'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{store.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{store.category}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-amber-500 font-medium"><Star className="w-3 h-3 fill-amber-500" />{store.rating}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{store.deliveryTime}</span>
                      <span className="flex items-center gap-1"><Bike className="w-3 h-3" />${store.deliveryFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      </PageTransition>
    </ClientLayout>
  );
}
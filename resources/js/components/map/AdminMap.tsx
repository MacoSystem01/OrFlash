import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline } from 'react-leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Store {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  deliveryFee: number;
  rating: number;
  isOpen: boolean;
}

interface Driver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline';
}

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

interface AdminMapProps {
  stores: Store[];
  drivers: Driver[];
  routes?: RoutePoint[][];
  centerLat?: number;
  centerLng?: number;
}

function AdminMapUpdater({ 
  center, 
  zoom 
}: { 
  center: [number, number]; 
  zoom: number;
}) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export default function AdminMap({ 
  stores, 
  drivers, 
  routes = [],
  centerLat = 3.4400,
  centerLng = -76.5280,
}: AdminMapProps) {
  const center: [number, number] = [centerLat, centerLng];

  return (
    <div className="w-full h-100 rounded-2xl overflow-hidden border border-border shadow-xl">
      <MapContainer 
        style={{ height: '100%' }}
        className="w-full h-full"
      >
        <AdminMapUpdater center={center} zoom={13} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Área central de cobertura */}
        <Circle 
          center={center}
          pathOptions={{
            fillColor: 'rgb(59, 130, 246)',
            color: 'rgb(59, 130, 246)',
            opacity: 0.05,
            fillOpacity: 0.02,
            radius: 5000
          }}
        />

        {/* Tiendas activas */}
        {stores.filter(s => s.isOpen).map((store) => (
          <Marker key={`store-active-${store.id}`} position={[store.lat, store.lng]}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-green-600">🛒 {store.name}</h3>
                <p className="text-xs text-muted-foreground">{store.category} (ABIERTA)</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs">⭐ {store.rating}</p>
                  <p className="text-xs">💵 ${store.deliveryFee.toLocaleString()}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded font-semibold">
                    ✓ Activa
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Tiendas inactivas */}
        {stores.filter(s => !s.isOpen).map((store) => (
          <Marker key={`store-inactive-${store.id}`} position={[store.lat, store.lng]}>
            <Popup>
              <div className="text-sm opacity-60">
                <h3 className="font-bold text-red-600">🛒 {store.name}</h3>
                <p className="text-xs text-muted-foreground">{store.category} (CERRADA)</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs">⭐ {store.rating}</p>
                  <p className="text-xs">💵 ${store.deliveryFee.toLocaleString()}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-600 text-white text-xs rounded font-semibold">
                    ✗ Inactiva
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Repartidores disponibles */}
        {drivers.filter(d => d.status === 'available').map((driver) => (
          <Marker key={`driver-available-${driver.id}`} position={[driver.lat, driver.lng]}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-emerald-600">🚴 {driver.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded font-semibold">
                  🟢 Disponible
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Repartidores ocupados */}
        {drivers.filter(d => d.status === 'busy').map((driver) => (
          <Marker key={`driver-busy-${driver.id}`} position={[driver.lat, driver.lng]}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-orange-600">🚴 {driver.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded font-semibold">
                  🟠 Ocupado
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Rutas de pedidos activos */}
        {routes.map((route, idx) => (
          route.length >= 2 && (
            <Polyline
              key={`route-${idx}`}
              positions={route.map(p => [p.lat, p.lng]) as [number, number][]}
              pathOptions={{
                color: ['rgb(168, 85, 247)', 'rgb(59, 130, 246)', 'rgb(16, 185, 129)'][idx % 3],
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 5',
              }}
            />
          )
        ))}

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl border border-border p-4 shadow-lg z-400 max-w-xs">
          <h4 className="font-bold text-sm mb-3">Leyenda</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Tiendas abiertas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-600"></span>
              <span>Tiendas cerradas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span>Repartidor disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>Repartidor ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-purple-500/60"></div>
              <span>Rutas activas</span>
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
}

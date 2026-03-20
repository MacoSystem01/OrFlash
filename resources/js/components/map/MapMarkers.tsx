import { Marker, Popup } from 'react-leaflet';
import L, { type DivIcon, type Icon } from 'leaflet';
function getSelectedDriverIcon(): DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      background: #7c3aed;
      border: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 0 4px rgba(124,58,237,0.4);
    ">🚴</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

interface Store {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  deliveryFee: number;
  rating: number;
}

interface Driver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline';
}

export function StoresMarkers({ stores }: { stores: Store[] }) {
  return (
    <>
      {stores.map((store) => (
        <Marker key={store.id} position={[store.lat, store.lng]}>
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold">🛒 {store.name}</h3>
              <p className="text-xs text-muted-foreground">{store.category}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs">⭐ {store.rating}</p>
                <p className="text-xs">💵 ${store.deliveryFee.toLocaleString()}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export function DriversMarkers({ drivers, selectedDriverId }: { drivers: Driver[]; selectedDriverId?: string }) {
  return (
    <>
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.lat, driver.lng]}
          {...(driver.id === selectedDriverId ? { icon: getSelectedDriverIcon() } : {})}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold">🚴 {driver.name}</h3>
              <p
                className={`text-xs font-semibold ${driver.status === 'available'
                  ? 'text-emerald-600'
                  : driver.status === 'busy'
                    ? 'text-orange-600'
                    : 'text-slate-600'
                  }`}
              >
                {driver.status === 'available'
                  ? '🟢 Disponible'
                  : driver.status === 'busy'
                    ? '🟠 Ocupado'
                    : '⚪ Desconectado'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export function UserLocationMarker({ lat, lng }: { lat: number; lng: number }) {
  return (
    <Marker position={[lat, lng]}>
      <Popup>
        <div className="text-sm font-medium">Tu ubicación 📍</div>
      </Popup>
    </Marker>
  );
}

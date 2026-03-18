import { Marker, Popup, Polyline } from 'react-leaflet';
import ClientMap from './ClientMap';
import { LatLngExpression } from 'leaflet';

interface OrderRouteMapProps {
  userLocation: [number, number];
  storeLocation: [number, number];
  driverLocation: [number, number];
  storeName: string;
  driverName: string;
}

export default function OrderRouteMap({
  userLocation,
  storeLocation,
  driverLocation,
  storeName,
  driverName,
}: OrderRouteMapProps) {
  // Centro del mapa entre usuario y repartidor
  const center: LatLngExpression = [
    (userLocation[0] + driverLocation[0]) / 2,
    (userLocation[1] + driverLocation[1]) / 2,
  ];

  return (
    <ClientMap center={center} zoom={14} height="h-[400px]">
      {/* Ruta de entrega */}
      <Polyline
        positions={[storeLocation, driverLocation, userLocation]}
        pathOptions={{
          color: 'rgb(59, 130, 246)',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5',
        }}
      />

      {/* Ubicación del usuario */}
      <Marker position={userLocation}>
        <Popup>
          <div className="text-sm font-medium">📍 Tu ubicación</div>
        </Popup>
      </Marker>

      {/* Ubicación de la tienda */}
      <Marker position={storeLocation}>
        <Popup>
          <div className="text-sm">
            <h3 className="font-bold">🛒 {storeName}</h3>
            <p className="text-xs text-muted-foreground">Punto de recogida</p>
          </div>
        </Popup>
      </Marker>

      {/* Ubicación del repartidor */}
      <Marker position={driverLocation}>
        <Popup>
          <div className="text-sm">
            <h3 className="font-bold">🚴 {driverName}</h3>
            <p className="text-xs text-emerald-600 font-semibold">🟢 En camino</p>
          </div>
        </Popup>
      </Marker>
    </ClientMap>
  );
}

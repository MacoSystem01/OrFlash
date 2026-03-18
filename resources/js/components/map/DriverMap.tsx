import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Driver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  online: boolean;
  phone: string;
  zone: string;
  deliveries: number;
}

interface DriverMapProps {
  drivers: Driver[];
  centerLat?: number;
  centerLng?: number;
}

function DriverMapUpdater({ 
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

export default function DriverMap({ 
  drivers, 
  centerLat = 3.4400,
  centerLng = -76.5280,
}: DriverMapProps) {
  const center: [number, number] = [centerLat, centerLng];
  const activeDrivers = drivers.filter(d => d.online);

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-border shadow-xl">
      <MapContainer 
        style={{ height: '100%' }}
        className="w-full h-full"
      >
        <DriverMapUpdater center={center} zoom={13} />
        
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

        {/* Repartidores activos */}
        {activeDrivers.map((driver) => (
          <Marker key={`driver-${driver.id}`} position={[driver.lat, driver.lng]}>
            <Popup>
              <div className="text-sm min-w-48">
                <h3 className="font-bold text-emerald-600">🚴 {driver.name}</h3>
                <div className="mt-2 space-y-1 text-xs">
                  <p>📍 Zona {driver.zone}</p>
                  <p>📞 {driver.phone}</p>
                  <p>📦 {driver.deliveries} entregas</p>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded font-semibold">
                  🟢 Online
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl border border-border p-4 shadow-lg z-400 max-w-xs">
          <h4 className="font-bold text-sm mb-3">Domiciliarios en Línea</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">{activeDrivers.length} activos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400"></span>
              <span>{drivers.filter(d => !d.online).length} offline</span>
            </div>
            <div className="border-t border-border/50 pt-2 mt-2">
              <p className="font-semibold">Total: {drivers.length}</p>
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
}

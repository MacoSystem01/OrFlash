import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ClientMapProps {
  center: LatLngExpression;
  zoom?: number;
  children?: React.ReactNode;
  height?: string;
}

function MapUpdater({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    const centerArray = Array.isArray(center) ? center : [center.lat, center.lng];
    map.setView(centerArray as [number, number], zoom);
  }, [center, zoom, map]);
  
  return null;
}

export default function ClientMap({ 
  center, 
  zoom = 14, 
  children, 
  height = 'h-[500px]' 
}: ClientMapProps) {
  const centerArray = Array.isArray(center) ? center : [center.lat, center.lng];

  return (
    <div className={`${height} rounded-2xl overflow-hidden border border-border shadow-lg`}>
      <MapContainer 
        style={{ height: '100%' }}
        className="w-full h-full"
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle 
          center={centerArray as [number, number]}
          pathOptions={{
            fillColor: 'rgb(59, 130, 246)',
            color: 'rgb(59, 130, 246)',
            opacity: 0.1,
            fillOpacity: 0.05,
            radius: 500
          }}
        />
        {children}
      </MapContainer>
    </div>
  );
}

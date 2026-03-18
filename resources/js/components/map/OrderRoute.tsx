import { Polyline, Popup, CircleMarker } from 'react-leaflet';

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
  time?: string;
}

interface OrderRouteProps {
  points: RoutePoint[];
  color?: string;
}

export function OrderRoute({ points, color = '#8b5cf6' }: OrderRouteProps) {
  const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <>
      {/* Línea de ruta principal */}
      {latLngs.length >= 2 && (
        <Polyline 
          positions={latLngs} 
          pathOptions={{
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5'
          }}
        />
      )}
      
      {/* Puntos de ruta con marcadores */}
      {points.map((point, idx) => (
        <CircleMarker 
          key={idx} 
          center={[point.lat, point.lng]}
          pathOptions={{
            radius: 6,
            fillColor: color,
            fillOpacity: 0.8,
            color: '#ffffff',
            weight: 2,
            opacity: 1
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{point.label}</p>
              {point.time && <p className="text-xs text-muted-foreground">{point.time}</p>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

interface DeliveryStatusProps {
  status: 'pending' | 'confirmed' | 'preparing' | 'in-transit' | 'delivered' | 'cancelled';
  estimatedTime?: string;
}

export function DeliveryStatus({ status, estimatedTime }: DeliveryStatusProps) {
  const statusConfig = {
    pending: { label: '⏳ Pendiente', color: 'bg-slate-100 text-slate-700' },
    confirmed: { label: '✅ Confirmado', color: 'bg-blue-100 text-blue-700' },
    preparing: { label: '👨‍🍳 Preparando', color: 'bg-orange-100 text-orange-700' },
    'in-transit': { label: '🚴 En camino', color: 'bg-purple-100 text-purple-700' },
    delivered: { label: '🎉 Entregado', color: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: '❌ Cancelado', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
      <div className={`flex-1 ${config.color} px-4 py-2 rounded-lg font-medium text-sm`}>
        {config.label}
      </div>
      {estimatedTime && (
        <div className="text-sm text-muted-foreground">⏱️ {estimatedTime}</div>
      )}
    </div>
  );
}

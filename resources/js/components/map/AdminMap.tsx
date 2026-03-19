import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L, { DivIcon, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Interfaces ───────────────────────────────────────────────────────────────

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
  vehicleType?: string;
  rating?: number;
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

// ── Iconos ───────────────────────────────────────────────────────────────────

function createPinIcon(color: string, emoji: string): DivIcon {
  return new L.DivIcon({
    className: '',
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
        <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:15px;line-height:1;">${emoji}</span>
        </div>
        <div style="width:6px;height:6px;border-radius:50%;background:${color};margin-top:1px;opacity:0.6;"></div>
      </div>
    `,
  });
}

function createCircleIcon(color: string, emoji: string): DivIcon {
  return new L.DivIcon({
    className: '',
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
    html: `
      <div style="width:32px;height:32px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:15px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
        ${emoji}
      </div>
    `,
  });
}

const ICON_STORE_OPEN:   Icon | DivIcon = createPinIcon('#22c55e', '🛒');
const ICON_STORE_CLOSED: Icon | DivIcon = createPinIcon('#64748b', '🛒');
const ICON_DRIVER_FREE:  Icon | DivIcon = createCircleIcon('#f97316', '🚴');
const ICON_DRIVER_BUSY:  Icon | DivIcon = createCircleIcon('#ef4444', '🚴');

// ── Estrellas ────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '1px' }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
      <span style={{ color: '#6b7280', marginLeft: '4px' }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Map updater ──────────────────────────────────────────────────────────────

function AdminMapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

// ── Componente principal ─────────────────────────────────────────────────────

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
      <MapContainer style={{ height: '100%' }} className="w-full h-full">
        <AdminMapUpdater center={center} zoom={13} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Área de cobertura */}
        <Circle
          center={center}
          pathOptions={{
            fillColor: 'rgb(59,130,246)',
            color: 'rgb(59,130,246)',
            opacity: 0.05,
            fillOpacity: 0.02,
            radius: 5000,
          }}
        />

        {/* ── TIENDAS ABIERTAS — Verde ── */}
        {stores.filter(s => s.isOpen).map((store) => (
          <Marker key={`store-open-${store.id}`} position={[store.lat, store.lng]} icon={ICON_STORE_OPEN}>
            <Popup>
              <div style={{ fontFamily: 'system-ui,sans-serif', fontSize: '13px', lineHeight: '1.6', minWidth: '210px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🛒</span>
                  <strong style={{ color: '#15803d', fontSize: '14px' }}>{store.name}</strong>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px', whiteSpace: 'nowrap' }}>Mercado:</td>
                      <td><strong>{store.category}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px' }}>Costo domicilio:</td>
                      <td><strong>${store.deliveryFee.toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px' }}>Estado:</td>
                      <td>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '11px' }}>
                          ✓ Abierto
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px' }}>Puntuación:</td>
                      <td><Stars rating={store.rating} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── TIENDAS CERRADAS — Gris ── */}
        {stores.filter(s => !s.isOpen).map((store) => (
          <Marker key={`store-closed-${store.id}`} position={[store.lat, store.lng]} icon={ICON_STORE_CLOSED}>
            <Popup>
              <div style={{ fontFamily: 'system-ui,sans-serif', fontSize: '13px', lineHeight: '1.6', minWidth: '210px', opacity: 0.8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🛒</span>
                  <strong style={{ color: '#475569', fontSize: '14px' }}>{store.name}</strong>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px', whiteSpace: 'nowrap' }}>Mercado:</td>
                      <td><strong>{store.category}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px' }}>Costo domicilio:</td>
                      <td><strong>${store.deliveryFee.toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px' }}>Estado:</td>
                      <td>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '11px' }}>
                          ✗ Cerrado
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px' }}>Puntuación:</td>
                      <td><Stars rating={store.rating} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── DOMICILIARIOS DISPONIBLES — Naranja ── */}
        {drivers.filter(d => d.status === 'available').map((driver) => (
          <Marker key={`driver-free-${driver.id}`} position={[driver.lat, driver.lng]} icon={ICON_DRIVER_FREE}>
            <Popup>
              <div style={{ fontFamily: 'system-ui,sans-serif', fontSize: '13px', lineHeight: '1.6', minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🚴</span>
                  <strong style={{ color: '#c2410c', fontSize: '14px' }}>{driver.name}</strong>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px', whiteSpace: 'nowrap' }}>Tipo de transporte:</td>
                      <td><strong>{driver.vehicleType ?? 'Bicicleta'}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px' }}>Estado:</td>
                      <td>
                        <span style={{ background: '#fff7ed', color: '#9a3412', padding: '1px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '11px' }}>
                          🟢 Disponible
                        </span>
                      </td>
                    </tr>
                    {driver.rating !== undefined && (
                      <tr>
                        <td style={{ color: '#6b7280', paddingRight: '8px' }}>Calificación:</td>
                        <td><Stars rating={driver.rating} /></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── DOMICILIARIOS OCUPADOS — Naranja-rojo ── */}
        {drivers.filter(d => d.status === 'busy').map((driver) => (
          <Marker key={`driver-busy-${driver.id}`} position={[driver.lat, driver.lng]} icon={ICON_DRIVER_BUSY}>
            <Popup>
              <div style={{ fontFamily: 'system-ui,sans-serif', fontSize: '13px', lineHeight: '1.6', minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🚴</span>
                  <strong style={{ color: '#b91c1c', fontSize: '14px' }}>{driver.name}</strong>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px', whiteSpace: 'nowrap' }}>Tipo de transporte:</td>
                      <td><strong>{driver.vehicleType ?? 'Bicicleta'}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ color: '#6b7280', paddingRight: '8px' }}>Estado:</td>
                      <td>
                        <span style={{ background: '#fef2f2', color: '#b91c1c', padding: '1px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '11px' }}>
                          🟠 Ocupado
                        </span>
                      </td>
                    </tr>
                    {driver.rating !== undefined && (
                      <tr>
                        <td style={{ color: '#6b7280', paddingRight: '8px' }}>Calificación:</td>
                        <td><Stars rating={driver.rating} /></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── RUTAS ── */}
        {routes.map((route, idx) => {
          if (route.length < 2) return null;
          const origin      = route[0];
          const destination = route[route.length - 1];
          const latLngs     = route.map(p => [p.lat, p.lng] as [number, number]);

          return (
            <React.Fragment key={`route-${idx}`}>

              {/* Trazo — Azul */}
              <Polyline
                positions={latLngs}
                pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8, dashArray: '8, 5' }}
              />

              {/* Inicio — Azul */}
              <CircleMarker
                center={[origin.lat, origin.lng]}
                pathOptions={{ radius: 9, fillColor: '#3b82f6', fillOpacity: 0.95, color: '#ffffff', weight: 2, opacity: 1 }}
              >
                <Popup>
                  <div style={{ fontFamily: 'system-ui,sans-serif', fontSize: '13px', minWidth: '180px' }}>
                    <span style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                      📦 LUGAR DE INICIO
                    </span>
                    <div><strong>{origin.label}</strong></div>
                  </div>
                </Popup>
              </CircleMarker>

              {/* Entrega — Rojo */}
              <CircleMarker
                center={[destination.lat, destination.lng]}
                pathOptions={{ radius: 9, fillColor: '#ef4444', fillOpacity: 0.95, color: '#ffffff', weight: 2, opacity: 1 }}
              >
                <Popup>
                  <div style={{ fontFamily: 'system-ui,sans-serif', fontSize: '13px', minWidth: '180px' }}>
                    <span style={{ display: 'inline-block', background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                      🏠 LUGAR DE ENTREGA
                    </span>
                    <div><strong>{destination.label}</strong></div>
                  </div>
                </Popup>
              </CircleMarker>

            </React.Fragment>
          );
        })}

        {/* ── LEYENDA ── */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl border border-border p-4 shadow-lg z-400 max-w-xs">
          <h4 className="font-bold text-sm mb-3">Leyenda</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Tienda abierta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500"></span>
              <span>Tienda cerrada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>Domiciliario disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Domiciliario ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Lugar de inicio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span>Lugar de entrega</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: '20px', borderTop: '2px dashed #3b82f6' }}></div>
              <span>Trazo de ruta</span>
            </div>
          </div>
        </div>

      </MapContainer>
    </div>
  );
}
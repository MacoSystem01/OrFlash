import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DeliveryRouteMapProps {
  storeAddress:    string;
  storeName:       string;
  storeLat?:       number | null;
  storeLng?:       number | null;
  storeCity?:      string | null;
  deliveryAddress: string;
  clientName:      string;
  deliveryLat?:    number | null;
  deliveryLng?:    number | null;
}

interface RouteInfo {
  coords:   [number, number][];
  distance: string; // "2.4 km"
  duration: string; // "8 min"
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [3.4400, -76.5280]; // Cali, Colombia

// ─── Normalización de direcciones colombianas ─────────────────────────────────
// Convierte "Carrera 12 # 39 - 08" → "Carrera 12 39 08"
// para que Nominatim las entienda mejor

function normalizeColombianAddress(address: string): string {
  return address
    .replace(/#\s*/g, '')   // quitar "#"
    .replace(/-\s*/g, ' ')  // quitar "-" (separador de casa)
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── Geocodificación mejorada para Colombia ───────────────────────────────────

async function geocode(
  address: string,
  city?: string | null,
): Promise<[number, number] | null> {
  const normalized = normalizeColombianAddress(address);
  const parts      = [normalized, city, 'Colombia'].filter(Boolean);

  // Intento 1: dirección completa normalizada + ciudad
  const q1 = encodeURIComponent(parts.join(', '));
  try {
    const r1 = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${q1}`,
      { headers: { 'Accept-Language': 'es' } },
    );
    const d1 = await r1.json();
    if (d1?.[0]) return [parseFloat(d1[0].lat), parseFloat(d1[0].lon)];
  } catch { /* continuar */ }

  // Intento 2: solo ciudad (si la dirección es muy específica y falla)
  if (city) {
    const q2 = encodeURIComponent(`${city}, Colombia`);
    try {
      const r2 = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${q2}`,
        { headers: { 'Accept-Language': 'es' } },
      );
      const d2 = await r2.json();
      if (d2?.[0]) return [parseFloat(d2[0].lat), parseFloat(d2[0].lon)];
    } catch { /* silencioso */ }
  }

  return null;
}

// ─── Decodificador de Encoded Polyline6 (formato Valhalla) ────────────────────

function decodePolyline6(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let lat = 0, lng = 0, i = 0;

  while (i < encoded.length) {
    let b: number, shift = 0, val = 0;
    do { b = encoded.charCodeAt(i++) - 63; val |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += val & 1 ? ~(val >> 1) : val >> 1;

    shift = 0; val = 0;
    do { b = encoded.charCodeAt(i++) - 63; val |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += val & 1 ? ~(val >> 1) : val >> 1;

    coords.push([lat * 1e-6, lng * 1e-6]);
  }
  return coords;
}

// ─── Enrutamiento real por calles ─────────────────────────────────────────────
// Estrategia en cascada: Valhalla (OSM oficial) → OSRM OSM-Germany → línea recta

async function fetchRoadRoute(
  from: [number, number],
  to:   [number, number],
): Promise<RouteInfo> {
  // ── 1. Valhalla (valhalla1.openstreetmap.de) ──────────────────────────────
  try {
    const body = {
      locations: [
        { lon: from[1], lat: from[0], type: 'break' },
        { lon: to[1],   lat: to[0],   type: 'break' },
      ],
      costing: 'motorcycle',
      directions_options: { language: 'es-ES', units: 'kilometers' },
    };

    const res  = await fetch('https://valhalla1.openstreetmap.de/route', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();

    const leg = data?.trip?.legs?.[0];
    if (leg?.shape) {
      const coords   = decodePolyline6(leg.shape);
      const km       = ((data.trip.summary?.length ?? 0) as number).toFixed(1);
      const minutes  = Math.ceil((data.trip.summary?.time ?? 0) / 60);
      return {
        coords,
        distance: `${km} km`,
        duration: `${minutes} min`,
      };
    }
  } catch { /* continuar al siguiente */ }

  // ── 2. OSRM routing.openstreetmap.de (fallback) ───────────────────────────
  try {
    const url =
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/` +
      `${from[1]},${from[0]};${to[1]},${to[0]}` +
      `?overview=full&geometries=geojson`;

    const res  = await fetch(url);
    const data = await res.json();

    if (data?.routes?.[0]?.geometry?.coordinates) {
      const coords = (data.routes[0].geometry.coordinates as [number, number][])
        .map(([lng, lat]) => [lat, lng] as [number, number]);
      const distM = data.routes[0].distance as number;
      const durS  = data.routes[0].duration as number;
      return {
        coords,
        distance: distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${Math.round(distM)} m`,
        duration: `${Math.ceil(durS / 60)} min`,
      };
    }
  } catch { /* continuar */ }

  // ── 3. Fallback: línea recta con aviso ────────────────────────────────────
  return { coords: [from, to], distance: '—', duration: '—' };
}

// ─── Iconos personalizados ────────────────────────────────────────────────────

function makeIcon(emoji: string, bg: string) {
  return L.divIcon({
    html: `<div style="background:${bg};border:3px solid white;border-radius:50%;
      width:40px;height:40px;display:flex;align-items:center;justify-content:center;
      font-size:19px;box-shadow:0 2px 10px rgba(0,0,0,.4);">${emoji}</div>`,
    iconSize:   [40, 40],
    iconAnchor: [20, 20],
    className:  '',
  });
}

// ─── Ajuste automático de bounds ──────────────────────────────────────────────

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2)
      map.fitBounds(L.latLngBounds(positions), { padding: [55, 55], maxZoom: 16 });
    else if (positions.length === 1)
      map.setView(positions[0], 14);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.length]);
  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DeliveryRouteMap({
  storeAddress, storeName, storeLat, storeLng, storeCity,
  deliveryAddress, clientName, deliveryLat, deliveryLng,
}: DeliveryRouteMapProps) {
  const [storePos,    setStorePos]    = useState<[number, number] | null>(null);
  const [deliveryPos, setDeliveryPos] = useState<[number, number] | null>(null);
  const [driverPos,   setDriverPos]   = useState<[number, number] | null>(null);
  const [routeInfo,   setRouteInfo]   = useState<RouteInfo | null>(null);
  const [gpsError,    setGpsError]    = useState(false);
  const [loading,     setLoading]     = useState(true);
  const watchIdRef = useRef<number | null>(null);

  // ── GPS del domiciliario (tiempo real) ────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) { setGpsError(true); return; }

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => { setDriverPos([pos.coords.latitude, pos.coords.longitude]); setGpsError(false); },
      ()  => setGpsError(true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, []);

  // ── Posición de la tienda ─────────────────────────────────────────────────
  useEffect(() => {
    if (storeLat && storeLng) { setStorePos([storeLat, storeLng]); return; }
    geocode(storeAddress, storeCity).then(pos => setStorePos(pos ?? DEFAULT_CENTER));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Posición del punto de entrega ─────────────────────────────────────────
  useEffect(() => {
    if (deliveryLat && deliveryLng) { setDeliveryPos([deliveryLat, deliveryLng]); return; }
    // Extraer ciudad de la dirección completa si viene con ella
    geocode(deliveryAddress, storeCity).then(pos => setDeliveryPos(pos ?? DEFAULT_CENTER));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Calcular ruta cuando tengamos ambos puntos ────────────────────────────
  useEffect(() => {
    if (!storePos || !deliveryPos) return;
    setLoading(false);

    fetchRoadRoute(storePos, deliveryPos).then(info => setRouteInfo(info));
  }, [storePos, deliveryPos]);

  const storeIcon    = makeIcon('🏪', '#7c3aed');
  const deliveryIcon = makeIcon('📍', '#059669');
  const driverIcon   = makeIcon('🚴', '#2563eb');

  const boundsPoints: [number, number][] = [
    ...(routeInfo?.coords ?? (storePos && deliveryPos ? [storePos, deliveryPos] : [])),
    ...(driverPos ? [driverPos] : []),
  ];

  const initialCenter = storePos ?? driverPos ?? DEFAULT_CENTER;

  return (
    <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-border shadow-lg">

      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-secondary/90 rounded-2xl gap-2">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Calculando ruta…</p>
        </div>
      )}

      {/* Aviso GPS */}
      {gpsError && !loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          ⚠️ GPS no disponible
        </div>
      )}

      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={initialCenter}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {boundsPoints.length >= 2 && <FitBounds positions={boundsPoints} />}

        {/* Ruta real por calles */}
        {routeInfo && routeInfo.coords.length >= 2 && (
          <Polyline
            positions={routeInfo.coords}
            pathOptions={{ color: '#7c3aed', weight: 5, opacity: 0.9 }}
          />
        )}

        {/* Línea orientativa domiciliario → tienda */}
        {driverPos && storePos && (
          <Polyline
            positions={[driverPos, storePos]}
            pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.5, dashArray: '7 5' }}
          />
        )}

        {storePos && (
          <Marker position={storePos} {...{ icon: storeIcon }}>
            <Popup>
              <p className="font-semibold text-sm">🏪 {storeName}</p>
              <p className="text-xs text-gray-500">Punto de recogida</p>
              <p className="text-xs mt-1">{storeAddress}</p>
            </Popup>
          </Marker>
        )}

        {deliveryPos && (
          <Marker position={deliveryPos} {...{ icon: deliveryIcon }}>
            <Popup>
              <p className="font-semibold text-sm">📍 {clientName}</p>
              <p className="text-xs text-gray-500">Punto de entrega</p>
              <p className="text-xs mt-1">{deliveryAddress}</p>
            </Popup>
          </Marker>
        )}

        {driverPos && (
          <Marker position={driverPos} {...{ icon: driverIcon }}>
            <Popup>
              <p className="font-semibold text-sm">🚴 Tu ubicación</p>
              <p className="text-xs text-gray-500">GPS en tiempo real</p>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Panel inferior: distancia y tiempo */}
      {routeInfo && (routeInfo.distance !== '—') && (
        <div className="absolute bottom-3 right-3 z-400 bg-card/95 backdrop-blur-sm rounded-xl border border-border px-3 py-2 text-xs shadow-lg pointer-events-none flex gap-3">
          <span>📏 {routeInfo.distance}</span>
          <span>⏱ {routeInfo.duration}</span>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-3 left-3 z-400 bg-card/95 backdrop-blur-sm rounded-xl border border-border px-3 py-2 text-xs space-y-1 shadow-lg pointer-events-none">
        {storePos    && <div className="flex items-center gap-1.5"><span>🏪</span> Tienda</div>}
        {deliveryPos && <div className="flex items-center gap-1.5"><span>📍</span> Entrega</div>}
        {driverPos   && <div className="flex items-center gap-1.5"><span>🚴</span> Tú</div>}
      </div>
    </div>
  );
}

import { useState, useEffect, lazy, Suspense } from 'react';
import { PageTransition } from '@/components/shared/Animations';
import { router, usePage } from '@inertiajs/react';
import { Check, Package, Truck, MapPin, Phone, User, Navigation } from 'lucide-react';
import DriverLayout from '@/layouts/DriverLayout';
import { formatPrice } from '@/lib/format';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';

// Carga diferida para evitar problemas de SSR con Leaflet
const DeliveryRouteMap = lazy(() => import('@/components/map/DeliveryRouteMap'));

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string;
  quantity:     number;
  unit_price:   number;
}

interface Order {
  id:                     number;
  status:                 string;
  total:                  number;
  delivery_fee:           number;
  driver_earnings:        number;
  delivery_address:       string | null;
  delivery_neighborhood:  string | null;
  delivery_city:          string | null;
  delivery_references:    string | null;
  delivery_lat:           number | null;
  delivery_lng:           number | null;
  store:  { id: number; business_name: string; address: string; city?: string | null; latitude?: number | null; longitude?: number | null };
  client: { id: number; name: string; phone?: string };
  items:  OrderItem[];
}

interface PageProps {
  order: Order | null;
  [key: string]: unknown;
}

// ─── Pasos del estado ─────────────────────────────────────────────────────────

const statusSteps: Record<string, { label: string; icon: typeof Package; next: string | null }> = {
  picked_up:  { label: 'Recogido en tienda', icon: Package, next: 'Marcar en tránsito' },
  in_transit: { label: 'En tránsito',        icon: Truck,   next: 'Marcar como entregado' },
  delivered:  { label: 'Entregado',          icon: MapPin,  next: null },
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DriverCurrentOrder() {
  useAutoRefresh();
  const { order } = usePage<PageProps>().props;
  const [mounted, setMounted] = useState(false);

  // Necesario para que Leaflet sólo se renderice en cliente
  useEffect(() => { setMounted(true); }, []);

  if (!order) {
    return (
      <DriverLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-6">
          <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Truck className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">Sin pedido activo</h2>
            <p className="text-muted-foreground text-sm mt-1">Acepta un pedido para comenzar</p>
          </div>
        </PageTransition>
      </DriverLayout>
    );
  }

  const currentStep    = statusSteps[order.status];
  const deliveryFull   = [
    order.delivery_address,
    order.delivery_neighborhood,
    order.delivery_city,
  ].filter(Boolean).join(', ');

  const handleAdvance = () => {
    router.patch(`/driver/orders/${order.id}/advance`, {}, { preserveScroll: true });
  };

  return (
    <DriverLayout>
      <PageTransition className="space-y-5 p-4 pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pedido actual</h1>
          <span className="text-xs font-mono text-muted-foreground">
            #{String(order.id).padStart(8, '0')}
          </span>
        </div>

        {/* ── Mapa de ruta ── */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
            <Navigation className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold">Ruta de entrega</span>
          </div>
          {mounted ? (
            <Suspense
              fallback={
                <div className="h-64 flex items-center justify-center bg-secondary/30">
                  <p className="text-sm text-muted-foreground animate-pulse">Cargando mapa…</p>
                </div>
              }
            >
              <DeliveryRouteMap
                storeAddress={order.store.address}
                storeName={order.store.business_name}
                storeLat={order.store.latitude}
                storeLng={order.store.longitude}
                storeCity={order.store.city}
                deliveryAddress={deliveryFull || order.delivery_address || ''}
                clientName={order.client.name}
                deliveryLat={order.delivery_lat}
                deliveryLng={order.delivery_lng}
              />
            </Suspense>
          ) : (
            <div className="h-64 flex items-center justify-center bg-secondary/30">
              <p className="text-sm text-muted-foreground animate-pulse">Cargando mapa…</p>
            </div>
          )}
        </div>

        {/* ── Info del pedido ── */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">

          {/* Tienda */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              Tienda (recogida)
            </p>
            <p className="font-semibold">{order.store.business_name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" /> {order.store.address}
            </p>
          </div>

          {/* Cliente */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              Cliente (entrega)
            </p>
            <p className="font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-500" /> {order.client.name}
            </p>
            {order.client.phone && (
              <a
                href={`tel:${order.client.phone}`}
                className="text-xs text-violet-600 font-medium flex items-center gap-1 mt-1 hover:underline"
              >
                <Phone className="w-3 h-3" /> {order.client.phone}
              </a>
            )}
            {deliveryFull && (
              <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                <span>{deliveryFull}</span>
              </p>
            )}
            {order.delivery_references && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                📝 {order.delivery_references}
              </p>
            )}
          </div>

          {/* Productos */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Productos
            </p>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-muted-foreground">
                <span>{item.product_name} <span className="font-medium text-foreground">x{item.quantity}</span></span>
                <span>{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Ganancia */}
          <div className="border-t border-border pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Tu ganancia</p>
              <p className="font-bold text-emerald-600 text-lg">{formatPrice(order.driver_earnings)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total pedido</p>
              <p className="font-semibold">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>

        {/* ── Timeline estado ── */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          {Object.entries(statusSteps).map(([key, step], i) => {
            const isDone    = order.status === 'delivered' || (order.status === 'in_transit' && key === 'picked_up');
            const isCurrent = order.status === key;
            return (
              <div key={key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                    isCurrent ? 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40'
                    : isDone  ? 'bg-emerald-500/20'
                    : 'bg-secondary'
                  }`}>
                    <step.icon className={`w-4 h-4 ${isCurrent ? 'text-white' : isDone ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  </div>
                  {i < Object.keys(statusSteps).length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${isDone || isCurrent ? 'bg-emerald-500' : 'bg-border'}`} />
                  )}
                </div>
                <div className="pt-2">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {isCurrent && <p className="text-xs text-emerald-600 font-medium">Paso actual</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Botón avanzar ── */}
        {currentStep?.next && (
          <button
            onClick={handleAdvance}
            className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Check className="w-5 h-5" /> {currentStep.next}
          </button>
        )}

        {order.status === 'delivered' && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
            <p className="font-semibold text-emerald-600">¡Pedido entregado correctamente!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ganaste {formatPrice(order.driver_earnings)} en esta entrega
            </p>
          </div>
        )}

      </PageTransition>
    </DriverLayout>
  );
}

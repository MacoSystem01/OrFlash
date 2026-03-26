import { useEffect } from 'react';
import { PageTransition } from '@/components/shared/Animations';
import { router, usePage } from '@inertiajs/react';
import { MapPin, CheckCircle, Package } from 'lucide-react';
import DriverLayout from '@/layouts/DriverLayout';
import { formatPrice } from '@/lib/format';

interface OrderItem {
  product_name: string;
  quantity: number;
}

interface Store {
  id: number;
  business_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  coverage_radius_m: number | null;
}

interface Order {
  id: number;
  total: number;
  delivery_fee: number;
  store: Store;
  items: OrderItem[];
}

interface PageProps {
  availableOrders: Order[];
  myActiveOrders: Order[];
  activeCount: number;
  canAcceptMore: boolean;
  [key: string]: unknown;
}

const REFRESH_INTERVAL = 30_000;

function useGpsRefresh() {
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    const visit = (lat?: string, lng?: string) => {
      const data: Record<string, string> = {};
      if (lat !== undefined) data.lat = lat;
      if (lng !== undefined) data.lng = lng;
      router.visit('/driver/available-orders', {
        data,
        preserveScroll: true,
        preserveState:  true,
        replace:        true,
      });
    };

    const refresh = () => {
      if (!('geolocation' in navigator)) { visit(); return; }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => visit(coords.latitude.toFixed(7), coords.longitude.toFixed(7)),
        () => visit(),
        { timeout: 5000, maximumAge: 15000 }
      );
    };

    const run = () => {
      if (id !== null) return;
      id = setInterval(refresh, REFRESH_INTERVAL);
    };
    const pause = () => { if (id !== null) { clearInterval(id); id = null; } };
    const handleVisibility = () => document.hidden ? pause() : run();

    run();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { pause(); document.removeEventListener('visibilitychange', handleVisibility); };
  }, []);
}

export default function DriverAvailableOrders() {
  useGpsRefresh();
  const {
    availableOrders = [],
    myActiveOrders = [],
    activeCount = 0,
    canAcceptMore = true,
  } = usePage<PageProps>().props;

  const handleAccept = (orderId: number, store: Store) => {
    const doAccept = (lat?: number, lng?: number) => {
      const payload: Record<string, number> = {};
      if (lat !== undefined && lng !== undefined) {
        payload.lat = lat;
        payload.lng = lng;
      }
      router.post(`/driver/orders/${orderId}/accept`, payload, { preserveScroll: true });
    };

    if (!('geolocation' in navigator)) {
      doAccept();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => doAccept(coords.latitude, coords.longitude),
      ()            => doAccept(),
      { timeout: 5000, maximumAge: 10000 }
    );
  };

  return (
    <DriverLayout>
      <PageTransition className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pedidos disponibles</h1>
            <p className="text-muted-foreground text-sm">
              {availableOrders.length} pedidos cerca de ti
            </p>
          </div>
          {availableOrders.length > 0 && (
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600 text-white shadow-lg shadow-violet-500/30">
              {availableOrders.length} nuevos
            </span>
          )}
        </div>

        {/* Mis pedidos activos */}
        {myActiveOrders.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
              Mis pedidos activos ({activeCount}/3)
            </p>
            {myActiveOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{order.store?.business_name}</span>
                <span className="text-emerald-600 font-bold">{formatPrice(order.total)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sin pedidos disponibles */}
        {availableOrders.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin pedidos disponibles</h2>
            <p className="text-sm text-muted-foreground text-center">
              {canAcceptMore
                ? 'Se mostrarán aquí cuando haya nuevos pedidos cerca'
                : 'Tienes 3 pedidos activos. Completa uno antes de aceptar otro.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{String(order.id).padStart(8, '0')}
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatPrice(order.delivery_fee)}
                    </span>
                  </div>
                  <p className="font-semibold">{order.store?.business_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{order.store?.address}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {order.items?.map(i => `${i.product_name} x${i.quantity}`).join(' · ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total pedido: <span className="font-semibold">{formatPrice(order.total)}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleAccept(order.id, order.store)}
                  disabled={!canAcceptMore}
                  className="w-full py-3.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <CheckCircle className="w-4 h-4" /> Aceptar pedido
                </button>
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    </DriverLayout>
  );
}

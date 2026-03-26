import { useState, useEffect, useRef } from 'react';
import { PageTransition } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { router, usePage } from '@inertiajs/react';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { Package, ArrowRight, ShoppingBag, Clock, XCircle } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Store {
  id: number;
  business_name: string;
}

interface Order {
  id: number;
  store: Store;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  cancelled_at: string | null;
}

interface PageProps {
  orders: Order[];
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusLabel: Record<string, string> = {
  pending_payment: 'Pendiente de pago',
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo para recoger',
  picked_up: 'Recogido',
  in_transit: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const paymentBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    approved:        { label: 'Pagado',             cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    cod:             { label: 'Pago al recibir',    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'             },
    pending:         { label: 'Pago pendiente',     cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'     },
    pending_payment: { label: 'Esperando pago',     cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'     },
    declined:        { label: 'Pago rechazado',     cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'                 },
    voided:          { label: 'Pago anulado',       cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'            },
  };
  const entry = map[status] ?? { label: 'Sin pago', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${entry.cls}`}>
      {entry.label}
    </span>
  );
};

// ─── Página ───────────────────────────────────────────────────────────────────

const SEEN_KEY = 'orflash_seen_cancelled';

function getSeenIds(): number[] {
  try { return JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? '[]'); }
  catch { return []; }
}
function markSeen(id: number) {
  const seen = getSeenIds();
  if (!seen.includes(id)) sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]));
}

export default function ClientOrders() {
  useAutoRefresh();
  const { orders } = usePage<PageProps>().props;

  const [cancelledPopup, setCancelledPopup] = useState<Order | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;
    const seen = getSeenIds();
    const unseen = orders.find(o => o.status === 'cancelled' && !seen.includes(o.id));
    if (unseen) {
      setCancelledPopup(unseen);
      markSeen(unseen.id);
      shownRef.current = true;
    }
  }, [orders]);

  const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completed = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  return (
    <ClientLayout>

      {/* Modal: pedido cancelado */}
      {cancelledPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-red-500/30 shadow-2xl p-7 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-red-600">Pedido cancelado</h2>
              <p className="text-sm text-muted-foreground">
                Tu pedido <span className="font-mono font-semibold">#{String(cancelledPopup.id).padStart(8, '0')}</span> de{' '}
                <span className="font-semibold">{cancelledPopup.store.business_name}</span> fue cancelado.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si realizaste algún pago será reembolsado automáticamente.
              </p>
            </div>
            <button
              onClick={() => setCancelledPopup(null)}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 active:scale-95 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <PageTransition className="p-4 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Mis pedidos</h1>
          <p className="text-muted-foreground text-sm">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
          </p>
        </div>

        {/* Sin pedidos */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Package className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin pedidos aún</h2>
            <p className="text-sm text-muted-foreground text-center">
              Cuando realices tu primer pedido aparecerá aquí
            </p>
            <button
              onClick={() => router.visit('/client/home')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30"
            >
              <ShoppingBag className="w-4 h-4" /> Explorar tiendas
            </button>
          </div>
        )}

        {/* Pedidos activos */}
        {active.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Activos ({active.length})
            </h2>
            {active.map(order => (
              <div
                key={order.id}
                className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-3 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => {
                  console.log('Order ID:', order.id);
                  router.visit('/client/orders/' + order.id + '/tracking');
                }}              >
                {/* Top */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{order.store.business_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{String(order.id).padStart(8, '0')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={order.status as any} />
                    {paymentBadge(order.payment_status)}
                  </div>
                </div>

                {/* Items */}
                <p className="text-xs text-muted-foreground">
                  {order.items.map(i => `${i.product_name} x${i.quantity}`).join(' · ')}
                </p>

                {/* Bottom */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Total pagado</p>
                    <p className="font-bold text-violet-600">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-violet-600 font-semibold">
                    Seguir pedido <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pedidos completados */}
        {completed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Historial ({completed.length})
            </h2>
            {completed.map(order => (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-4 space-y-3"
              >
                {/* Top */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{order.store.business_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{String(order.id).padStart(8, '0')}
                    </p>
                  </div>
                  <StatusBadge status={order.status as any} />
                </div>

                {/* Items */}
                <p className="text-xs text-muted-foreground">
                  {order.items.map(i => `${i.product_name} x${i.quantity}`).join(' · ')}
                </p>

                {/* Bottom */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </p>
                    <p className="font-bold">{formatPrice(order.total)}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                    <p className="text-xs font-medium">{formatPrice(order.subtotal)}</p>
                    <p className="text-xs text-muted-foreground">
                      + Domicilio {formatPrice(order.delivery_fee)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </PageTransition>
    </ClientLayout>
  );
}
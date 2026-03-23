import { PageTransition } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { router, usePage } from '@inertiajs/react';
import { Package, ArrowRight, ShoppingBag, Clock } from 'lucide-react';
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
  if (status === 'approved') {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        Pagado
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
        Pago pendiente
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
      Pago fallido
    </span>
  );
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ClientOrders() {
  const { orders } = usePage<PageProps>().props;

  const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completed = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  return (
    <ClientLayout>
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
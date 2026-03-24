import { PageTransition } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Package, ArrowRight } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import { router, usePage } from '@inertiajs/react';
import { formatPrice } from '@/lib/format';

interface OrderItem {
  product_name: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  total: number;
  client?: { name: string; phone?: string };
  items: OrderItem[];
}

interface Store {
  id: number;
  business_name: string;
}

interface PageProps {
  store: Store;
  stores: Store[];
  orders: Order[];
  [key: string]: unknown;
}

export default function StoreOrders() {
  const { store, orders = [] } = usePage<PageProps>().props;

  const handleAdvance = (orderId: number) => {
    router.patch(`/store/${store.id}/orders/${orderId}/advance`, {}, {
      preserveScroll: true,
    });
  };

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pedidos activos</h1>
          <p className="text-muted-foreground text-sm">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en curso
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Package className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin pedidos activos</h2>
            <p className="text-sm text-muted-foreground">Los nuevos pedidos aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    #{String(order.id).padStart(8, '0')}
                  </span>
                  <StatusBadge status={order.status as any} />
                </div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Cliente:</span>{' '}
                  <span className="font-medium">{order.client?.name ?? '—'}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.items?.map(i => `${i.product_name} x${i.quantity}`).join(' · ')}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-bold text-violet-600">{formatPrice(order.total)}</span>
                  <button
                    onClick={() => handleAdvance(order.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
                  >
                    Avanzar estado <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    </StoreLayout>
  );
}

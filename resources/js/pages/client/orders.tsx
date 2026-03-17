import { PageTransition } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePage } from '@inertiajs/react';
import { Package, Clock } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';

export default function ClientOrders() {
  const orders: any[] = []; // Luego vendrán de Laravel

  return (
    <ClientLayout>
      <PageTransition className="p-4 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Mis pedidos</h1>
          <p className="text-muted-foreground text-sm">Historial de tus compras</p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Package className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin pedidos aún</h2>
            <p className="text-sm text-muted-foreground text-center">Cuando realices tu primer pedido aparecerá aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="font-semibold">{order.storeName}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Package className="w-3 h-3" />{order.items.length} items</span>
                  <span className="font-semibold text-foreground">${order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    </ClientLayout>
  );
}
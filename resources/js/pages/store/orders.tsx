import { PageTransition } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Package, ArrowRight } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';

export default function StoreOrders() {
  const storeOrders: any[] = [];

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pedidos activos</h1>
          <p className="text-muted-foreground text-sm">Gestiona los pedidos en curso</p>
        </div>

        {storeOrders.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Package className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin pedidos activos</h2>
            <p className="text-sm text-muted-foreground">Los nuevos pedidos aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {storeOrders.map((order: any) => (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm"><span className="text-muted-foreground">Cliente:</span> <span className="font-medium">{order.clientName}</span></p>
                <p className="text-xs text-muted-foreground">{order.items?.map((i: any) => `${i.name} x${i.quantity}`).join(' · ')}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-bold text-violet-600">${order.total?.toLocaleString()}</span>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/30">
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
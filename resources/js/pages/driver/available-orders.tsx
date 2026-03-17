import { PageTransition } from '@/components/shared/Animations';
import { router } from '@inertiajs/react';
import { MapPin, Clock, DollarSign, Package, CheckCircle } from 'lucide-react';
import DriverLayout from '@/layouts/DriverLayout';

export default function DriverAvailableOrders() {
  const available: any[] = [];

  return (
    <DriverLayout>
      <PageTransition className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pedidos disponibles</h1>
            <p className="text-muted-foreground text-sm">{available.length} pedidos cerca de ti</p>
          </div>
          {available.length > 0 && (
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600 text-white shadow-lg shadow-violet-500/30">
              {available.length} nuevos
            </span>
          )}
        </div>

        {available.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin pedidos disponibles</h2>
            <p className="text-sm text-muted-foreground text-center">Se mostrarán aquí cuando haya nuevos pedidos cerca</p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map((order: any) => (
              <div key={order.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                    <span className="text-lg font-bold text-emerald-600">${order.total?.toLocaleString()}</span>
                  </div>
                  <p className="font-semibold">{order.storeName}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.address}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{order.estimatedDelivery}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.visit('/driver/current-order')}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
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
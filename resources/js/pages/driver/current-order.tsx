import { PageTransition } from '@/components/shared/Animations';
import { router, usePage } from '@inertiajs/react';
import { Check, Package, Truck, MapPin, Phone } from 'lucide-react';
import DriverLayout from '@/layouts/DriverLayout';
import { formatPrice } from '@/lib/format';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: number;
  status: string;
  total: number;
  delivery_fee: number;
  driver_earnings: number;
  delivery_address: string;
  store: { id: number; business_name: string; address: string };
  client: { id: number; name: string; phone?: string };
  items: OrderItem[];
}

interface PageProps {
  order: Order | null;
  [key: string]: unknown;
}

const statusSteps: Record<string, { label: string; icon: typeof Package; next: string | null }> = {
  picked_up:  { label: 'Recogido en tienda', icon: Package, next: 'Marcar en tránsito' },
  in_transit: { label: 'En tránsito',        icon: Truck,   next: 'Marcar como entregado' },
  delivered:  { label: 'Entregado',          icon: MapPin,  next: null },
};

export default function DriverCurrentOrder() {
  const { order } = usePage<PageProps>().props;

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

  const currentStep = statusSteps[order.status];

  const handleAdvance = () => {
    router.patch(`/driver/orders/${order.id}/advance`, {}, {
      preserveScroll: true,
    });
  };

  return (
    <DriverLayout>
      <PageTransition className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pedido actual</h1>
          <span className="text-xs font-mono text-muted-foreground">
            #{String(order.id).padStart(8, '0')}
          </span>
        </div>

        {/* Info pedido */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Tienda</p>
            <p className="font-semibold mt-0.5">{order.store.business_name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {order.store.address}
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cliente</p>
            <p className="font-semibold mt-0.5">{order.client.name}</p>
            {order.client.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {order.client.phone}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {order.delivery_address}
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Productos</p>
            {order.items.map((item, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {item.product_name} <span className="font-medium text-foreground">x{item.quantity}</span>
              </p>
            ))}
          </div>
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

        {/* Timeline estado */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          {Object.entries(statusSteps).map(([key, step], i) => {
            const isDone = order.status === 'delivered' || (order.status === 'in_transit' && key === 'picked_up');
            const isCurrent = order.status === key;

            return (
              <div key={key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                    isCurrent
                      ? 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40'
                      : isDone
                      ? 'bg-emerald-500/20'
                      : 'bg-secondary'
                  }`}>
                    <step.icon className={`w-4 h-4 ${
                      isCurrent ? 'text-white' : isDone ? 'text-emerald-500' : 'text-muted-foreground'
                    }`} />
                  </div>
                  {i < Object.keys(statusSteps).length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${isDone || isCurrent ? 'bg-emerald-500' : 'bg-border'}`} />
                  )}
                </div>
                <div className="pt-2">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-emerald-600 font-medium">Paso actual</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón avanzar */}
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
            <p className="font-semibold text-emerald-600">¡Pedido entregado!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ganaste {formatPrice(order.driver_earnings)} en esta entrega
            </p>
          </div>
        )}

      </PageTransition>
    </DriverLayout>
  );
}

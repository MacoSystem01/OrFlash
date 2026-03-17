import { PageTransition } from '@/components/shared/Animations';
import { useOrderStore } from '@/app/store/orderStore';
import { useAuthStore } from '@/app/store/authStore';
import { motion } from 'framer-motion';
import { Check, Package, Truck, MapPin, ChefHat } from 'lucide-react';
import type { OrderStatus } from '@/mock/data';

const steps: { status: OrderStatus; label: string; icon: typeof Check }[] = [
  { status: 'pending', label: 'Pedido recibido', icon: Package },
  { status: 'confirmed', label: 'Confirmado', icon: Check },
  { status: 'preparing', label: 'Preparando', icon: ChefHat },
  { status: 'picked_up', label: 'Recogido', icon: Truck },
  { status: 'in_transit', label: 'En camino', icon: Truck },
  { status: 'delivered', label: 'Entregado', icon: MapPin },
];

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered'];

const ClientOrderTracking = () => {
  const user = useAuthStore((s) => s.user);
  const orders = useOrderStore((s) => s.orders);
  const activeOrder = orders.find((o) => o.clientId === user?.id && !['delivered', 'cancelled'].includes(o.status))
    || orders.find((o) => !['delivered', 'cancelled'].includes(o.status));

  if (!activeOrder) {
    return (
      <PageTransition className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <Package className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Sin pedidos activos</h2>
        <p className="text-muted-foreground text-sm text-center">Cuando hagas un pedido, podrás seguirlo aquí.</p>
      </PageTransition>
    );
  }

  const currentIdx = statusOrder.indexOf(activeOrder.status);

  return (
    <PageTransition className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seguimiento</h1>
        <p className="text-muted-foreground text-sm">{activeOrder.id} · {activeOrder.storeName}</p>
      </div>

      {/* Simulated map */}
      <div className="surface overflow-hidden h-48 relative">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, hsl(240, 5%, 20%) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        <motion.div
          animate={{ x: [0, 100, 180], y: [80, 40, 90] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm shadow-lg glow"
        >
          🛵
        </motion.div>
        <div className="absolute bottom-4 left-4 glass rounded-xl px-3 py-2 text-xs">
          <p className="font-medium">ETA: {activeOrder.estimatedDelivery}</p>
          <p className="text-muted-foreground">{activeOrder.driverName || 'Asignando driver...'}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {steps.map((step, i) => {
          const stepIdx = statusOrder.indexOf(step.status);
          const isDone = stepIdx <= currentIdx;
          const isCurrent = step.status === activeOrder.status;
          return (
            <div key={step.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isDone ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'} ${isCurrent ? 'glow' : ''}`}>
                  <step.icon className="w-4 h-4" />
                </div>
                {i < steps.length - 1 && <div className={`w-0.5 h-8 ${isDone ? 'bg-primary' : 'bg-secondary'}`} />}
              </div>
              <div className="pt-1">
                <p className={`text-sm font-medium ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                {isCurrent && <p className="text-xs text-primary">En progreso...</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order details */}
      <div className="surface p-4 space-y-2">
        <h3 className="font-semibold text-sm">Detalle del pedido</h3>
        {activeOrder.items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
            <span className="text-mono">${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex justify-between font-semibold text-sm">
          <span>Total</span>
          <span className="text-mono">${activeOrder.total.toLocaleString()}</span>
        </div>
      </div>
    </PageTransition>
  );
};

export default ClientOrderTracking;

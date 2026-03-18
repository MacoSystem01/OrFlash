import { PageTransition } from '@/components/shared/Animations';
import { useOrderStore, type Order } from '@/app/store/orderStore';
import { useAuthStore } from '@/app/store/authStore';
import { motion } from 'framer-motion';
import { Check, Package, Truck, MapPin, ChefHat } from 'lucide-react';
import { useState } from 'react';
import ClientMap from '@/components/map/ClientMap';
import { DriversMarkers } from '@/components/map/MapMarkers';
import { DeliveryStatus } from '@/components/map/DeliveryStatus';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'in-transit' | 'delivered' | 'cancelled';

const steps: { status: OrderStatus; label: string; icon: typeof Check }[] = [
  { status: 'pending', label: 'Pedido recibido', icon: Package },
  { status: 'confirmed', label: 'Confirmado', icon: Check },
  { status: 'preparing', label: 'Preparando', icon: ChefHat },
  { status: 'in-transit', label: 'En camino', icon: Truck },
  { status: 'delivered', label: 'Entregado', icon: MapPin },
];

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'in-transit', 'delivered'];

// Repartidor asignado a la orden
const assignedDriver = {
  id: '1',
  name: 'Carlos López',
  lat: 3.4516,
  lng: -76.532,
  status: 'available' as const,
};

// Puntos clave en la ruta
const routePoints = [
  { lat: 3.4272, lng: -76.5225, label: 'Tienda', time: 'Recogiendo...' },
  { lat: 3.4380, lng: -76.5300, label: 'En camino', time: 'En 8 min' },
  { lat: 3.4450, lng: -76.5200, label: 'Destino', time: 'En 15 min' },
];

const ClientOrderTracking = () => {
  const [showMap, setShowMap] = useState(true);
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

      {/* Map Section */}
      {showMap && (
        <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
          <ClientMap center={[routePoints[1].lat, routePoints[1].lng]} zoom={14}>
            <DriversMarkers drivers={[assignedDriver]} />
          </ClientMap>
        </div>
      )}

      {/* Delivery Status Card */}
      <DeliveryStatus status={activeOrder.status as OrderStatus} estimatedTime={activeOrder.estimatedDelivery} />

      {/* Driver Info Card */}
      <div className="rounded-2xl p-5 bg-linear-to-br from-violet-500/10 to-purple-500/10 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Repartidor asignado</p>
            <h3 className="font-bold">{assignedDriver.name}</h3>
          </div>
          <div className="text-3xl">🚴</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span>📱</span>
            <span className="text-muted-foreground">+57 300 123 4567</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="text-muted-foreground">4.8 (125 entregas)</span>
          </div>
        </div>
        <button className="w-full py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-medium transition-colors">
          Contactar repartidor
        </button>
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

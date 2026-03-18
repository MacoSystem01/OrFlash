import { Zap, Clock } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'in-transit' | 'delivered' | 'cancelled';

interface DeliveryStatusProps {
  status: OrderStatus;
  estimatedTime: string;
}

const statusMessages = {
  pending: { title: 'Pedido confirmado', color: 'blue' },
  confirmed: { title: 'Preparando tu pedido', color: 'violet' },
  preparing: { title: 'Preparando tu pedido', color: 'violet' },
  'in-transit': { title: 'En camino a tu puerta', color: 'emerald' },
  delivered: { title: 'Entragado correctamente', color: 'emerald' },
  cancelled: { title: 'Pedido cancelado', color: 'red' },
};

export function DeliveryStatus({ status, estimatedTime }: DeliveryStatusProps) {
  const info = statusMessages[status];
  const colorClass = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-200',
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-200',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-200',
    red: 'from-red-500/20 to-rose-500/20 border-red-200',
  }[info.color];

  return (
    <div className={`rounded-2xl p-5 bg-linear-to-br ${colorClass} border space-y-3`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Estado del pedido</p>
          <h3 className="font-bold text-lg">{info.title}</h3>
        </div>
        <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Entrega estimada: {estimatedTime}</span>
      </div>
    </div>
  );
}

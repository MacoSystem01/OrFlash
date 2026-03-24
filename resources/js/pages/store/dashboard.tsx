import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Package, DollarSign, Clock, TrendingUp, CheckCircle, Plus } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { formatPrice } from '@/lib/format';

interface OrderItem {
  product_name: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  total: number;
  client?: { name: string };
  items: OrderItem[];
}

interface Store {
  id: number;
  business_name: string;
  is_open: boolean;
  opening_time: string;
  closing_time: string;
}

interface PageProps {
  store: Store;
  stores: Store[];
  activeOrders: Order[];
  todayRevenue: number;
  todayDelivered: number;
  [key: string]: unknown;
}

export default function StoreDashboard() {
  const { store, activeOrders = [], todayRevenue = 0, todayDelivered = 0 } = usePage<PageProps>().props;

  const metrics = [
    {
      label: 'Pedidos activos',
      value: activeOrders.length,
      icon: Package,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/40',
    },
    {
      label: 'Ingresos hoy',
      value: formatPrice(todayRevenue),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/40',
    },
    {
      label: 'Horario',
      value: store ? `${store.opening_time} - ${store.closing_time}` : '—',
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/40',
    },
    {
      label: 'Completados hoy',
      value: todayDelivered,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/40',
    },
  ];

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inicio Tienda</h1>
            <p className="text-muted-foreground text-sm">Panel de control de tu negocio</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Crear tienda
            </Link>
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg ${
              store?.is_open
                ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                : 'bg-slate-500 text-white shadow-slate-500/40'
            }`}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {store?.is_open ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
        </div>

        {/* Métricas */}
        <StaggerList className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <StaggerItem key={m.label}>
              <div className={`rounded-2xl p-5 bg-linear-to-br ${m.gradient} text-white shadow-xl ${m.shadow}`}>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <m.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-white/75 mt-1">{m.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Pedidos entrantes */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Pedidos entrantes</h2>
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3 text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-violet-500" />
              </div>
              <p className="text-sm">No hay pedidos activos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div key={order.id} className="rounded-xl border-l-4 border-violet-500 bg-violet-500/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{String(order.id).padStart(8, '0')}
                    </span>
                    <StatusBadge status={order.status as any} />
                  </div>
                  <p className="font-semibold text-sm">{order.client?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.items?.map(i => `${i.product_name} x${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-sm font-bold text-violet-600 mt-2">{formatPrice(order.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </PageTransition>
    </StoreLayout>
  );
}

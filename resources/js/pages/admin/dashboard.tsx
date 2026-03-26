import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePage, router } from '@inertiajs/react';
import { ShoppingBag, Users, Truck, TrendingUp, ArrowUpRight, Store } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';

interface DashboardStats {
  total_users: number;
  total_stores: number;
  active_stores: number;
  total_drivers: number;
}

interface Order {
  id: number;
  client?: { name: string };
  store?: { business_name: string };
  total: number;
  status: string;
  created_at: string;
}

interface PageProps {
  stats: DashboardStats;
  orders: Order[];
  [key: string]: unknown;
}

export default function AdminDashboard() {
  useAutoRefresh();
  const { stats, orders = [] } = usePage<PageProps>().props;

  const metrics = [
    {
      label: 'Usuarios totales',
      value: stats?.total_users ?? 0,
      icon: Users,
      gradient: 'from-violet-600 to-purple-700',
      shadow: 'shadow-violet-500/40',
    },
    {
      label: 'Pedidos hoy',
      value: orders.length,
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/40',
    },
    {
      label: 'Tiendas activas',
      value: stats?.active_stores ?? 0,
      icon: Store,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/40',
    },
    {
      label: 'Domiciliarios',
      value: stats?.total_drivers ?? 0,
      icon: Truck,
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/40',
    },
  ];

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inicio</h1>
            <p className="text-muted-foreground text-sm">Vista general del sistema OrFlash</p>
          </div>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Sistema activo
          </span>
        </div>

        {/* Métricas */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <StaggerItem key={m.label}>
              <div className={`rounded-2xl p-5 bg-linear-to-br ${m.gradient} shadow-xl ${m.shadow} text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <m.icon className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-white/60" />
                </div>
                <p className="text-3xl font-bold">{m.value}</p>
                <p className="text-sm text-white/75 mt-1">{m.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Pedidos recientes */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Pedidos recientes</h3>
              <p className="text-xs text-muted-foreground">Últimas transacciones del sistema</p>
            </div>
            <button
              onClick={() => router.visit('/admin/orders')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/30"
            >
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Fecha</th>
                  <th className="pb-3 font-medium text-muted-foreground">ID</th>
                  <th className="pb-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="pb-3 font-medium text-muted-foreground">Tienda</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-violet-500" />
                        </div>
                        <p>No hay pedidos aún</p>
                        <p className="text-xs opacity-60">Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 6).map((o) => (
                    <tr key={o.id} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('es-CO')}</td>
                      <td className="py-3 text-xs font-mono">{o.id}</td>
                      <td className="py-3">{o.client?.name ?? '—'}</td>
                      <td className="py-3 text-muted-foreground">{o.store?.business_name ?? '—'}</td>
                      <td className="py-3 font-semibold">${o.total?.toLocaleString() ?? 0}</td>
                      <td className="py-3"><StatusBadge status={o.status as any} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </PageTransition>
    </AdminLayout>
  );
}
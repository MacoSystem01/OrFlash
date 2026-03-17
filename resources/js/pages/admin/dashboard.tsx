import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePage } from '@inertiajs/react';
import { DollarSign, ShoppingBag, Users, Truck, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import AdminLayout from '@/layouts/AdminLayout';

const chartData = [
  { name: 'Lun', ingresos: 850000 },
  { name: 'Mar', ingresos: 720000 },
  { name: 'Mié', ingresos: 1100000 },
  { name: 'Jue', ingresos: 960000 },
  { name: 'Vie', ingresos: 1340000 },
  { name: 'Sáb', ingresos: 1640000 },
  { name: 'Dom', ingresos: 1460000 },
];

const formatCurrency = (v: number) => `$${(v / 1000).toFixed(0)}k`;

const metrics = [
  {
    label: 'Ingresos totales', value: '$0',
    icon: DollarSign, change: '+12.5%',
    gradient: 'from-violet-600 to-purple-700',
    shadow: 'shadow-violet-500/40',
  },
  {
    label: 'Pedidos hoy', value: '0',
    icon: ShoppingBag, change: '+8.2%',
    gradient: 'from-blue-500 to-cyan-600',
    shadow: 'shadow-blue-500/40',
  },
  {
    label: 'Usuarios activos', value: '4',
    icon: Users, change: '+3.1%',
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/40',
  },
  {
    label: 'Domiciliarios online', value: '1',
    icon: Truck, change: '+1',
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/40',
  },
];

const summary = [
  { label: 'Pedidos pendientes', value: '0', dot: 'bg-amber-400' },
  { label: 'En camino',          value: '0', dot: 'bg-blue-400'  },
  { label: 'Entregados hoy',     value: '0', dot: 'bg-emerald-400'},
  { label: 'Cancelados hoy',     value: '0', dot: 'bg-red-400'   },
];

export default function AdminDashboard() {
  const orders: any[] = [];

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
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
              <div className={`rounded-2xl p-5 bg-gradient-to-br ${m.gradient} shadow-xl ${m.shadow} text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <m.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                    <TrendingUp className="w-3 h-3" /> {m.change}
                  </span>
                </div>
                <p className="text-3xl font-bold">{m.value}</p>
                <p className="text-sm text-white/75 mt-1">{m.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Área chart */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Ingresos semanales</h3>
                <p className="text-xs text-muted-foreground">Últimos 7 días</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600 text-white shadow-lg shadow-violet-500/40">
                <Activity className="w-3 h-3" /> +18.2%
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                  <Tooltip
                    contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff' }}
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Ingresos']}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke="#7c3aed" strokeWidth={3} fill="url(#colorIngresos)" dot={{ fill: '#7c3aed', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resumen */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
            <h3 className="font-semibold mb-4">Resumen rápido</h3>
            <div className="space-y-3 flex-1">
              {summary.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pedidos recientes */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Pedidos recientes</h3>
              <p className="text-xs text-muted-foreground">Últimas transacciones del sistema</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/30">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 font-medium text-muted-foreground">ID</th>
                  <th className="pb-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="pb-3 font-medium text-muted-foreground">Tienda</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-violet-500" />
                        </div>
                        <p>No hay pedidos aún</p>
                        <p className="text-xs opacity-60">Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
                      </div>
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 text-xs font-mono">{o.id}</td>
                    <td className="py-3">{o.clientName}</td>
                    <td className="py-3 text-muted-foreground">{o.storeName}</td>
                    <td className="py-3 font-semibold">${o.total.toLocaleString()}</td>
                    <td className="py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </PageTransition>
    </AdminLayout>
  );
}
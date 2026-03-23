import { PageTransition } from '@/components/shared/Animations';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Users, Store } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { usePage } from '@inertiajs/react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AnalyticsStats {
  total_users: number;
  active_users: number;
  total_stores: number;
  active_stores: number;
  by_role: {
    clients: number;
    stores: number;
    drivers: number;
  };
}

interface PageProps {
  stats: AnalyticsStats;
  [key: string]: unknown;
}

const COLORS = ['#7c3aed', '#10b981', '#f59e0b'];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const { stats } = usePage<PageProps>().props;

  const kpis = [
    {
      label: 'Usuarios totales',
      value: stats?.total_users ?? 0,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/40',
      icon: Users,
    },
    {
      label: 'Usuarios activos',
      value: stats?.active_users ?? 0,
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/40',
      icon: TrendingUp,
    },
    {
      label: 'Tiendas totales',
      value: stats?.total_stores ?? 0,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/40',
      icon: Store,
    },
    {
      label: 'Pedidos registrados',
      value: 0,
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/40',
      icon: ShoppingBag,
    },
  ];

  const barData = [
    { name: 'Clientes',      count: stats?.by_role?.clients ?? 0 },
    { name: 'Tiendas',       count: stats?.by_role?.stores  ?? 0 },
    { name: 'Domiciliarios', count: stats?.by_role?.drivers ?? 0 },
  ];

  const pieData = barData.filter(d => d.count > 0);

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Analíticas</h1>
          <p className="text-muted-foreground text-sm">Métricas reales del sistema</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={`rounded-2xl p-5 bg-linear-to-br ${k.gradient} text-white shadow-xl ${k.shadow}`}>
              <div className="flex items-center justify-between mb-3">
                <k.icon className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-white/75 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Barras por rol */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Usuarios por rol</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribución actual en el sistema</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e1b4b',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 12,
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pastel por rol */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Distribución de usuarios</h3>
            <p className="text-xs text-muted-foreground mb-4">Por tipo de cuenta</p>
            {pieData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                Sin datos suficientes
              </div>
            ) : (
              <>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#1e1b4b',
                          border: 'none',
                          borderRadius: 12,
                          fontSize: 12,
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {pieData.map((c, i) => (
                    <span key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      {c.name} ({c.count})
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </PageTransition>
    </AdminLayout>
  );
}
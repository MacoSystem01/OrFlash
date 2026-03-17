import { PageTransition } from '@/components/shared/Animations';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Users } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

const weeklyData = [
  { name: 'Lun', pedidos: 42 }, { name: 'Mar', pedidos: 38 }, { name: 'Mié', pedidos: 55 },
  { name: 'Jue', pedidos: 48 }, { name: 'Vie', pedidos: 67 }, { name: 'Sáb', pedidos: 82 }, { name: 'Dom', pedidos: 73 },
];

const categoryData = [
  { name: 'Abarrotes', value: 35 }, { name: 'Farmacia',  value: 20 },
  { name: 'Panadería', value: 18 }, { name: 'Carnicería',value: 15 }, { name: 'Otros', value: 12 },
];

const COLORS = ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const kpis = [
  { label: 'Tasa de conversión', value: '68%',    change: '+4.2%', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40', icon: TrendingUp  },
  { label: 'Ticket promedio',    value: '$24.500', change: '+2.1%', gradient: 'from-blue-500 to-cyan-600',     shadow: 'shadow-blue-500/40',   icon: DollarSign  },
  { label: 'Pedidos este mes',   value: '405',     change: '+18%',  gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40',icon: ShoppingBag },
  { label: 'Nuevos usuarios',    value: '32',      change: '+9%',   gradient: 'from-orange-500 to-amber-500',  shadow: 'shadow-orange-500/40', icon: Users       },
];

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analíticas</h1>
          <p className="text-muted-foreground text-sm">Métricas y estadísticas del sistema</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className={`rounded-2xl p-5 bg-gradient-to-br ${k.gradient} text-white shadow-xl ${k.shadow}`}>
              <div className="flex items-center justify-between mb-3">
                <k.icon className="w-5 h-5 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">{k.change}</span>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-white/75 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Pedidos por día</h3>
            <p className="text-xs text-muted-foreground mb-4">Últimos 7 días</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff' }} />
                  <Bar dataKey="pedidos" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-1">Por categoría</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribución de ventas</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {categoryData.map((c, i) => (
                <span key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} /> {c.name} ({c.value}%)
                </span>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    </AdminLayout>
  );
}
import { PageTransition } from '@/components/shared/Animations';
import { usePage } from '@inertiajs/react';
import { Package, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import DriverLayout from '@/layouts/DriverLayout';

export default function DriverHistory() {
  const { auth } = usePage().props as any;
  const orders: any[] = []; // Luego vendrán de Laravel

  const totalEarnings = orders.length * 3500;

  return (
    <DriverLayout>
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Historial de entregas</h1>
          <p className="text-muted-foreground text-sm">{orders.length} entregas completadas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Entregas',  value: orders.length,              gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40', icon: Package     },
            { label: 'Ganancias', value: `$${totalEarnings.toLocaleString()}`, gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40',icon: DollarSign  },
            { label: 'Esta semana',value: '0',                       gradient: 'from-blue-500 to-cyan-600',     shadow: 'shadow-blue-500/40',   icon: TrendingUp  },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 bg-gradient-to-br ${s.gradient} text-white shadow-xl ${s.shadow}`}>
              <s.icon className="w-4 h-4 mb-2 opacity-80" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-white/75 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lista */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin entregas aún</h2>
            <p className="text-sm text-muted-foreground">Tus entregas completadas aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o: any) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">{o.id}</span>
                  <p className="text-sm font-semibold mt-0.5">{o.storeName} → {o.clientName}</p>
                  <p className="text-xs text-emerald-600 font-bold mt-0.5">${o.total?.toLocaleString()}</p>
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600">
                  Entregado
                </span>
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    </DriverLayout>
  );
}
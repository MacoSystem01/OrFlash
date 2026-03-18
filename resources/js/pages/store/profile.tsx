import { PageTransition } from '@/components/shared/Animations';
import { usePage, router } from '@inertiajs/react';
import { Store, Clock, CreditCard, HelpCircle, ChevronRight, LogOut, Package, Star, TrendingUp } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';

const menuItems = [
  { label: 'Información del negocio', icon: Store,      color: 'from-violet-500 to-purple-600' },
  { label: 'Horarios',                icon: Clock,      color: 'from-blue-500 to-cyan-600'     },
  { label: 'Métodos de pago',         icon: CreditCard, color: 'from-emerald-500 to-teal-600'  },
  { label: 'Soporte',                 icon: HelpCircle, color: 'from-orange-500 to-amber-500'  },
];

export default function StoreProfile() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
              🏪
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-emerald-100 text-sm">{user?.email}</p>
              <span className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Tienda activa
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pedidos',      value: '0',   icon: Package  },
            { label: 'Calificación', value: '5.0', icon: Star     },
            { label: 'Este mes',     value: '$0',  icon: TrendingUp },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map(({ label, icon: Icon, color }) => (
            <button key={label} className="w-full rounded-2xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-secondary/30 transition-colors">
              <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="flex-1 text-sm font-medium text-left">{label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => router.post('/logout')}
          className="w-full rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex items-center justify-center gap-2 text-red-600 font-semibold text-sm hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </PageTransition>
    </StoreLayout>
  );
}
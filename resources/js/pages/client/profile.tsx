import { PageTransition } from '@/components/shared/Animations';
import { usePage, router } from '@inertiajs/react';
import { MapPin, CreditCard, Bell, HelpCircle, FileText, ChevronRight, LogOut } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';

const menuItems = [
  { label: 'Direcciones guardadas', icon: MapPin,       color: 'from-violet-500 to-purple-600' },
  { label: 'Métodos de pago',       icon: CreditCard,   color: 'from-blue-500 to-cyan-600'     },
  { label: 'Notificaciones',        icon: Bell,         color: 'from-amber-500 to-orange-500'  },
  { label: 'Soporte',               icon: HelpCircle,   color: 'from-emerald-500 to-teal-600'  },
  { label: 'Términos y condiciones',icon: FileText,     color: 'from-pink-500 to-rose-600'     },
];

export default function ClientProfile() {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  return (
    <ClientLayout>
      <PageTransition className="p-4 space-y-6">
        {/* Avatar card */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-xl shadow-violet-500/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-violet-200 text-sm">{user?.email}</p>
              <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                Cliente
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pedidos',   value: '0' },
            { label: 'Favoritos', value: '0' },
            { label: 'Puntos',    value: '0' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map(({ label, icon: Icon, color }) => (
            <button key={label} className="w-full rounded-2xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-secondary/30 transition-colors">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
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
    </ClientLayout>
  );
}
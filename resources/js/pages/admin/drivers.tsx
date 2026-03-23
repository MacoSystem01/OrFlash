import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Truck, Phone, Mail } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { usePage } from '@inertiajs/react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'pending' | 'rejected';
  created_at: string;
}

interface PageProps {
  drivers: Driver[];
  [key: string]: unknown;
}

// ─── Configuración ────────────────────────────────────────────────────────────

const statusMap = {
  active:   { label: 'Activo',        cls: 'bg-emerald-500/15 text-emerald-600' },
  pending:  { label: 'Pendiente',     cls: 'bg-yellow-500/15  text-yellow-600'  },
  rejected: { label: 'Deshabilitado', cls: 'bg-slate-500/15   text-slate-500'   },
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AdminDrivers() {
  const { drivers } = usePage<PageProps>().props;

  const active   = drivers.filter(d => d.status === 'active').length;
  const inactive = drivers.length - active;

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Domiciliarios</h1>
            <p className="text-muted-foreground text-sm">{drivers.length} domiciliarios registrados</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              {active} activos
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500 text-white shadow-lg shadow-slate-500/30">
              {inactive} inactivos
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total registrados', value: drivers.length, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40' },
            { label: 'Activos',           value: active,         gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 bg-linear-to-br ${s.gradient} text-white shadow-xl ${s.shadow}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-white/75 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        {drivers.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center">
              <Truck className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin domiciliarios registrados</h2>
            <p className="text-sm text-muted-foreground">Aparecerán aquí cuando se registren</p>
          </div>
        ) : (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((d) => {
              const st = statusMap[d.status] ?? statusMap.pending;
              return (
                <StaggerItem key={d.id}>
                  <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-linear-to-br from-orange-500 to-amber-500">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{d.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail  className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{d.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{d.phone ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        )}

      </PageTransition>
    </AdminLayout>
  );
}
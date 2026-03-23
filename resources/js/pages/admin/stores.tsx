import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { MapPin, Star, Search, Filter, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useState, useEffect, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Store {
  id: number;
  business_name: string;
  category: string;
  address: string;
  zone: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  is_open: boolean;
  user?: { name: string; email: string };
}

interface PageProps {
  stores: Store[];
  [key: string]: unknown;
}

type FilterType = 'all' | 'active' | 'inactive' | 'pending';
type ToastType  = 'success' | 'error';

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDone }: { message: string; type: ToastType; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
      animate-in slide-in-from-bottom-4 fade-in duration-300
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
    >
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertCircle  className="w-4 h-4 shrink-0" />
      }
      {message}
    </div>
  );
}

// ─── Configuración ────────────────────────────────────────────────────────────

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-600',
];

const statusMap = {
  active:   { label: 'Activa',    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  inactive: { label: 'Inactiva',  cls: 'bg-red-100     text-red-700     dark:bg-red-900/40     dark:text-red-300'     },
  pending:  { label: 'Pendiente', cls: 'bg-yellow-100  text-yellow-700  dark:bg-yellow-900/40  dark:text-yellow-300'  },
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AdminStores() {
  const { stores } = usePage<PageProps>().props;

  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<FilterType>('all');
  const [toggling, setToggling] = useState(false);
  const [toast,    setToast]    = useState<{ message: string; type: ToastType } | null>(null);

  const counts = {
    active:   stores.filter(s => s.status === 'active').length,
    inactive: stores.filter(s => s.status === 'inactive').length,
    pending:  stores.filter(s => s.status === 'pending').length,
  };

  const filtered = stores.filter(s => {
    const matchSearch = s.business_name.toLowerCase().includes(search.toLowerCase())
                     || s.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  // Toggle activa/inactiva
  const handleToggle = useCallback((store: Store) => {
    setToggling(true);
    const nextLabel = store.status === 'active' ? 'desactivada' : 'activada';

    router.patch(`/admin/stores/${store.id}/toggle`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        setToast({ message: `✓ "${store.business_name}" fue ${nextLabel} correctamente.`, type: 'success' });
        setToggling(false);
      },
      onError: () => {
        setToast({ message: `✗ No se pudo cambiar el estado de "${store.business_name}".`, type: 'error' });
        setToggling(false);
      },
    });
  }, []);

  // Aprobar tienda pendiente
  const handleApprove = useCallback((store: Store) => {
    setToggling(true);

    router.patch(`/admin/stores/${store.id}/toggle`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        setToast({ message: `✓ "${store.business_name}" fue aprobada y activada.`, type: 'success' });
        setToggling(false);
      },
      onError: () => {
        setToast({ message: `✗ No se pudo aprobar "${store.business_name}".`, type: 'error' });
        setToggling(false);
      },
    });
  }, []);

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tiendas</h1>
            <p className="text-muted-foreground text-sm">{stores.length} tiendas en el sistema</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              {counts.active} activas
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-lg shadow-yellow-500/30">
              {counts.pending} pendientes
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white shadow-lg shadow-red-500/30">
              {counts.inactive} inactivas
            </span>
          </div>
        </div>

        {/* Alerta tiendas pendientes */}
        {counts.pending > 0 && (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-yellow-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-700">
                {counts.pending} {counts.pending === 1 ? 'tienda pendiente' : 'tiendas pendientes'} de aprobación
              </p>
              <p className="text-xs text-yellow-600">
                Revisa y aprueba las tiendas para que puedan operar en la plataforma.
              </p>
            </div>
            <button
              onClick={() => setFilter('pending')}
              className="px-3 py-1.5 rounded-xl bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 transition-colors"
            >
              Ver pendientes
            </button>
          </div>
        )}

        {/* Buscador + Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(['all', 'active', 'pending', 'inactive'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  filter === f
                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/30'
                    : 'bg-card text-muted-foreground border-border hover:border-violet-400'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : f === 'pending' ? 'Pendientes' : 'Inactivas'}
              </button>
            ))}
          </div>
        </div>

        {/* Mosaico */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Search className="w-7 h-7 text-violet-400" />
            </div>
            <p className="font-medium">Sin resultados</p>
            <p className="text-xs">Intenta con otro nombre o categoría</p>
          </div>
        ) : (
          <StaggerList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((store, i) => {
              const st       = statusMap[store.status] ?? statusMap.pending;
              const isActive = store.status === 'active';
              const isPending = store.status === 'pending';

              return (
                <StaggerItem key={store.id}>
                  <div className={`rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group ${
                    isPending ? 'border-yellow-500/40' : 'border-border'
                  }`}>

                    {/* Banner */}
                    <div className={`h-14 bg-linear-to-r ${gradients[i % gradients.length]} relative`}>
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                      />
                      <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>
                        {st.label}
                      </span>
                      <div className={`absolute -bottom-4 left-3 w-8 h-8 rounded-xl bg-linear-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-card group-hover:scale-110 transition-transform`}>
                        {store.business_name.charAt(0)}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="pt-6 px-3 pb-3">
                      <h3 className="font-semibold text-sm leading-tight truncate">{store.business_name}</h3>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{store.category}</p>
                      {store.user && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">👤 {store.user.name}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          {store.rating > 0 ? store.rating : '—'}
                        </span>

                        {/* Botón según estado */}
                        {isPending ? (
                          <button
                            onClick={() => handleApprove(store)}
                            disabled={toggling}
                            title="Aprobar tienda"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                          >
                            <ShieldCheck className="w-3 h-3" /> Aprobar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggle(store)}
                            disabled={toggling}
                            title={isActive ? 'Desactivar tienda' : 'Activar tienda'}
                            className={`p-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              isActive
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                          >
                            {isActive
                              ? <ToggleLeft  className="w-4 h-4" />
                              : <ToggleRight className="w-4 h-4" />
                            }
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        )}

      </PageTransition>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </AdminLayout>
  );
}
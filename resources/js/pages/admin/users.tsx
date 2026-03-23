import { PageTransition } from '@/components/shared/Animations';
import {
  Search, Users, Shield, Store, Truck,
  Eye, ToggleLeft, ToggleRight,
  X, Phone, Mail, MapPin, CreditCard,
  Building2, Car, FileText,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'store' | 'driver';
  phone: string | null;
  status: 'active' | 'pending' | 'rejected';
  created_at: string;
  cedula?: string | null;
  address?: string | null;
  nit?: string | null;
  business_name?: string | null;
  commercial_address?: string | null;
  chamber_of_commerce?: string | null;
  license_number?: string | null;
  vehicle_plate?: string | null;
  arl?: string | null;
  insurance?: string | null;
}

interface PageProps {
  users: User[];
  flash?: { success?: string; error?: string };
  [key: string]: unknown;
}

// ─── Roles ────────────────────────────────────────────────────────────────────

const roleConfig: Record<string, { label: string; gradient: string; icon: React.ElementType }> = {
  admin:  { label: 'Admin',        gradient: 'from-violet-500 to-purple-600', icon: Shield },
  client: { label: 'Cliente',      gradient: 'from-blue-500 to-cyan-600',     icon: Users  },
  store:  { label: 'Tienda',       gradient: 'from-emerald-500 to-teal-600',  icon: Store  },
  driver: { label: 'Domiciliario', gradient: 'from-orange-500 to-amber-500',  icon: Truck  },
};

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error';

function Toast({ message, type, onDone }: { message: string; type: ToastType; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
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

// ─── Badge de estado ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: User['status'] }) {
  const map = {
    active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    pending:  'bg-yellow-100  text-yellow-700  dark:bg-yellow-900/40  dark:text-yellow-300',
    rejected: 'bg-red-100     text-red-700     dark:bg-red-900/40     dark:text-red-300',
  };
  const labels = { active: 'Activo', pending: 'Pendiente', rejected: 'Deshabilitado' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

// ─── Modal de detalle ─────────────────────────────────────────────────────────

function UserDetailModal({
  user,
  onClose,
  onToggle,
  toggling,
}: {
  user: User;
  onClose: () => void;
  onToggle: (u: User) => void;
  toggling: boolean;
}) {
  const cfg      = roleConfig[user.role];
  const Icon     = cfg.icon;
  const isActive = user.status === 'active';

  const field = (icon: React.ReactNode, label: string, value: string | null | undefined) =>
    value ? (
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-muted-foreground">{icon}</span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Encabezado */}
        <div className={`bg-linear-to-br ${cfg.gradient} p-6 rounded-t-2xl relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Icon className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80">{cfg.label}</span>
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-4">
          <div className="grid gap-3">
            {field(<Mail className="w-4 h-4" />,       'Correo electrónico', user.email)}
            {field(<Phone className="w-4 h-4" />,      'Teléfono',           user.phone)}
            {field(<CreditCard className="w-4 h-4" />, 'Cédula',             user.cedula)}
            {field(<MapPin className="w-4 h-4" />,     'Dirección',          user.address)}

            {user.role === 'store' && <>
              {field(<Building2 className="w-4 h-4" />, 'Razón social',        user.business_name)}
              {field(<FileText className="w-4 h-4" />,  'NIT',                 user.nit)}
              {field(<MapPin className="w-4 h-4" />,    'Dirección comercial', user.commercial_address)}
              {field(<FileText className="w-4 h-4" />,  'Cámara de comercio',  user.chamber_of_commerce)}
            </>}

            {user.role === 'driver' && <>
              {field(<Car className="w-4 h-4" />,      'Placa',    user.vehicle_plate)}
              {field(<FileText className="w-4 h-4" />, 'Licencia', user.license_number)}
              {field(<FileText className="w-4 h-4" />, 'ARL',      user.arl)}
              {field(<FileText className="w-4 h-4" />, 'Seguro',   user.insurance)}
            </>}

            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-muted-foreground"><FileText className="w-4 h-4" /></span>
              <div>
                <p className="text-xs text-muted-foreground">Registrado</p>
                <p className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString('es-CO', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Botón toggle */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => onToggle(user)}
              disabled={toggling}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
                ${isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {toggling
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : isActive
                  ? <><ToggleLeft  className="w-4 h-4" /> Deshabilitar usuario</>
                  : <><ToggleRight className="w-4 h-4" /> Habilitar usuario</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminUsers() {
  const { users, flash } = usePage<PageProps>().props;

  const [search,       setSearch]   = useState('');
  const [selectedUser, setSelected] = useState<User | null>(null);
  const [toggling,     setToggling] = useState(false);
  const [toast,        setToast]    = useState<{ message: string; type: ToastType } | null>(null);

  // Cuando Inertia recarga los props, sincroniza el usuario abierto en el modal
  useEffect(() => {
    if (selectedUser) {
      const fresh = users.find((u) => u.id === selectedUser.id);
      if (fresh) setSelected(fresh);
    }
  }, [users]);

  // Flash messages opcionales desde el servidor
  useEffect(() => {
    if (flash?.success) setToast({ message: flash.success, type: 'success' });
    if (flash?.error)   setToast({ message: flash.error,   type: 'error'   });
  }, [flash]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Toggle ────────────────────────────────────────────────────────────────
  const handleToggle = useCallback((user: User) => {
    setToggling(true);
    const nextLabel = user.status === 'active' ? 'deshabilitado' : 'habilitado';

    router.patch(
      `/admin/users/${user.id}/toggle`,
      {},
      {
        preserveScroll: true,
        // Sin preserveState → Inertia recarga props frescos desde la BD
        onSuccess: () => {
          setToast({ message: `✓ "${user.name}" fue ${nextLabel} correctamente.`, type: 'success' });
          setToggling(false);
        },
        onError: () => {
          setToast({ message: `✗ No se pudo cambiar el estado de "${user.name}".`, type: 'error' });
          setToggling(false);
        },
      }
    );
  }, []);

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Usuarios</h1>
            <p className="text-muted-foreground text-sm">{users.length} usuarios registrados</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card w-64 shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuario..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(['client', 'store', 'driver'] as const).map((role) => {
            const count = users.filter((u) => u.role === role).length;
            const cfg   = roleConfig[role];
            const Icon  = cfg.icon;
            return (
              <div key={role} className={`rounded-2xl p-4 bg-linear-to-br ${cfg.gradient} text-white shadow-lg`}>
                <Icon className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-white/75">{cfg.label}s</p>
              </div>
            );
          })}
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Usuario</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Email</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Rol</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Estado</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Teléfono</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
                {filtered.map((u) => {
                  const cfg      = roleConfig[u.role];
                  const isActive = u.status === 'active';
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${cfg.gradient} flex items-center justify-center text-white font-bold shadow-md`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>

                      <td className="px-5 py-3.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-linear-to-r ${cfg.gradient} shadow-sm`}>
                          {cfg.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status={u.status} />
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">
                        {u.phone ?? '—'}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">

                          {/* Ver detalle */}
                          <button
                            onClick={() => setSelected(u)}
                            title="Ver detalle"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle rápido */}
                          <button
                            onClick={() => handleToggle(u)}
                            disabled={toggling}
                            title={isActive ? 'Deshabilitar' : 'Habilitar'}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                              ${isActive
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              }`}
                          >
                            {isActive
                              ? <ToggleLeft  className="w-4 h-4" />
                              : <ToggleRight className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </PageTransition>

      {/* Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelected(null)}
          onToggle={handleToggle}
          toggling={toggling}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
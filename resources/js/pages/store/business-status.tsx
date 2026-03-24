import { PageTransition } from '@/components/shared/Animations';
import { Power, Clock, ShoppingBag, CheckCircle, Pencil, X, Save } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Store {
  id: number;
  business_name: string;
  is_open: boolean;
  opening_time: string;
  closing_time: string;
  attention_days: string[] | null;
  status: string;
}

interface PageProps {
  store: Store;
  stores: { id: number; business_name: string }[];
  todayOrders: number;
  [key: string]: unknown;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ─── Modal de edición de horario ──────────────────────────────────────────────

function HoursModal({ store, onClose }: { store: Store; onClose: () => void }) {
  const [opening, setOpening]   = useState(store.opening_time ?? '08:00');
  const [closing, setClosing]   = useState(store.closing_time ?? '20:00');
  const [days,    setDays]      = useState<string[]>(store.attention_days ?? []);
  const [saving,  setSaving]    = useState(false);
  const [errors,  setErrors]    = useState<Record<string, string>>({});

  const toggleDay = (day: string) =>
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleSave = () => {
    setSaving(true);
    router.patch(
      `/store/${store.id}/hours`,
      { opening_time: opening, closing_time: closing, attention_days: days },
      {
        preserveScroll: true,
        onSuccess: () => { setSaving(false); onClose(); },
        onError:   errs => { setErrors(errs); setSaving(false); },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">Editar horario de atención</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Horario */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Hora apertura <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={opening}
                onChange={e => setOpening(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              {errors.opening_time && <p className="text-xs text-red-500">{errors.opening_time}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Hora cierre <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={closing}
                onChange={e => setClosing(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              {errors.closing_time && <p className="text-xs text-red-500">{errors.closing_time}</p>}
            </div>
          </div>

          {/* Días de atención */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Días de atención
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    days.includes(day)
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function StoreBusinessStatus() {
  const { store, todayOrders = 0 } = usePage<PageProps>().props;
  const [showHoursModal, setShowHoursModal] = useState(false);

  const isOpen = store?.is_open ?? false;

  const handleToggle = () => {
    router.patch(`/store/${store.id}/toggle-status`, {}, {
      preserveScroll: true,
    });
  };

  const attentionDays = store?.attention_days?.join(', ') ?? 'No configurado';

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Estado del negocio</h1>
          <p className="text-muted-foreground text-sm">Controla la disponibilidad de tu tienda</p>
        </div>

        {/* Estado principal */}
        <div className={`rounded-2xl p-8 text-center transition-all duration-500 ${
          isOpen
            ? 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30'
            : 'bg-linear-to-br from-slate-500 to-slate-600 shadow-xl shadow-slate-500/30'
        }`}>
          <div className="text-6xl mb-4">{isOpen ? '🟢' : '🔴'}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isOpen ? 'Tienda Abierta' : 'Tienda Cerrada'}
          </h2>
          <p className="text-white/75 text-sm mb-6">
            {isOpen ? 'Estás recibiendo pedidos activamente' : 'No recibirás nuevos pedidos'}
          </p>
          <button
            onClick={handleToggle}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 mx-auto ${
              isOpen
                ? 'bg-white text-red-600 hover:bg-red-50 shadow-white/30'
                : 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-white/30'
            }`}
          >
            <Power className="w-4 h-4" />
            {isOpen ? 'Cerrar tienda' : 'Abrir tienda'}
          </button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Horario — con botón editar */}
          <div className="rounded-2xl p-5 bg-linear-to-br from-blue-500 to-cyan-600 text-white shadow-xl shadow-blue-500/40">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <button
                onClick={() => setShowHoursModal(true)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Editar horario"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-2xl font-bold">
              {store?.opening_time ?? '--:--'} – {store?.closing_time ?? '--:--'}
            </p>
            <p className="text-xs text-white/75 mt-1">Horario de atención</p>
            {store?.attention_days && store.attention_days.length > 0 && (
              <p className="text-xs text-white/60 mt-1">{attentionDays}</p>
            )}
          </div>

          {/* Pedidos de hoy */}
          <div className="rounded-2xl p-5 bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/40">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold">{todayOrders}</p>
            <p className="text-xs text-white/75 mt-1">Pedidos de hoy</p>
          </div>

        </div>

        {/* Checklist */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4">Estado de la tienda</h3>
          <div className="space-y-3">
            {[
              { label: 'Tienda aprobada por admin',   done: store?.status === 'active' },
              { label: 'Tienda abierta para pedidos', done: isOpen },
              { label: 'Horario configurado',          done: !!(store?.opening_time && store?.closing_time) },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  item.done ? 'bg-emerald-500/15' : 'bg-secondary'
                }`}>
                  <CheckCircle className={`w-4 h-4 ${item.done ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </PageTransition>

      {showHoursModal && (
        <HoursModal store={store} onClose={() => setShowHoursModal(false)} />
      )}

    </StoreLayout>
  );
}
import { PageTransition } from '@/components/shared/Animations';
import { usePage, router } from '@inertiajs/react';
import {
  Store, Clock, HelpCircle, ChevronRight, LogOut,
  Package, Star, TrendingUp, X, Save, Pencil,
  Phone, MapPin, Tag, FileText, Upload,
} from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import { formatPrice } from '@/lib/format';
import { useState, useRef } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface StoreData {
  id: number;
  business_name: string;
  description: string | null;
  address: string;
  phone: string | null;
  category: string;
  zone: string;
  opening_time: string;
  closing_time: string;
  attention_days: string[] | null;
  images: string[] | null;
  rating: number;
  status: string;
}

interface StoreStats {
  total_orders: number;
  monthly_revenue: number;
}

interface PageProps {
  store: StoreData;
  stores: StoreData[];
  storeStats: StoreStats;
  auth: { user: { name: string; email: string } };
  [key: string]: unknown;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ─── Modal: Información del negocio ──────────────────────────────────────────

function BusinessInfoModal({ store, onClose }: { store: StoreData; onClose: () => void }) {
  const [form, setForm] = useState({
    business_name: store.business_name ?? '',
    description:   store.description  ?? '',
    address:       store.address       ?? '',
    phone:         store.phone         ?? '',
    category:      store.category      ?? '',
    zone:          store.zone          ?? '',
  });
  const [saving,    setSaving]    = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [previews,  setPreviews]  = useState<string[]>(
    store.images?.map(img => `/storage/${img}`) ?? []
  );
  const imageRef = useRef<HTMLInputElement>(null);

  const u = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p.filter(s => !s.startsWith('/storage')), ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleSave = () => {
    setSaving(true);
    const data = new FormData();
    data.append('_method', 'PATCH');
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (imageRef.current?.files && imageRef.current.files.length > 0) {
      Array.from(imageRef.current.files).forEach(f => data.append('images[]', f));
    }

    router.post(`/store/${store.id}/info`, data as any, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => { setSaving(false); onClose(); },
      onError:   errs => { setErrors(errs); setSaving(false); },
    });
  };

  const Field = ({ label, field, icon: Icon, placeholder, textarea = false }: {
    label: string; field: keyof typeof form; icon: any; placeholder: string; textarea?: boolean;
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        {textarea ? (
          <textarea
            value={form[field]}
            onChange={e => u(field, e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none"
          />
        ) : (
          <input
            value={form[field]}
            onChange={e => u(field, e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
        )}
      </div>
      {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h2 className="font-bold text-lg">Información del negocio</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Nombre del negocio *" field="business_name" icon={Store}    placeholder="Ej: Tienda El Amigo" />
          <Field label="Categoría *"           field="category"      icon={Tag}      placeholder="Ej: Abarrotes, Panadería..." />
          <Field label="Zona / Barrio *"       field="zone"          icon={MapPin}   placeholder="Ej: Centro, Norte..." />
          <Field label="Dirección *"           field="address"       icon={MapPin}   placeholder="Calle y número" />
          <Field label="Teléfono"              field="phone"         icon={Phone}    placeholder="Ej: 3001234567" />
          <Field label="Descripción" field="description" icon={FileText} placeholder="Describe tu negocio..." textarea />

          {/* Imágenes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Imágenes de la tienda</label>
            <div
              onClick={() => imageRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all"
            >
              <input ref={imageRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
              <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Toca para subir imágenes</p>
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="w-16 h-16 object-cover rounded-xl border border-border" alt="" />
                    <button
                      type="button"
                      onClick={() => setPreviews(p => p.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
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

// ─── Modal: Horarios ──────────────────────────────────────────────────────────

function HoursModal({ store, onClose }: { store: StoreData; onClose: () => void }) {
  const [opening, setOpening] = useState(store.opening_time ?? '08:00');
  const [closing, setClosing] = useState(store.closing_time ?? '20:00');
  const [days,    setDays]    = useState<string[]>(store.attention_days ?? []);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const toggleDay = (day: string) =>
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleSave = () => {
    setSaving(true);
    router.patch(`/store/${store.id}/hours`, { opening_time: opening, closing_time: closing, attention_days: days }, {
      preserveScroll: true,
      onSuccess: () => { setSaving(false); onClose(); },
      onError:   errs => { setErrors(errs); setSaving(false); },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">Horarios de atención</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Apertura *</label>
              <input
                type="time"
                value={opening}
                onChange={e => setOpening(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              {errors.opening_time && <p className="text-xs text-red-500">{errors.opening_time}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cierre *</label>
              <input
                type="time"
                value={closing}
                onChange={e => setClosing(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              {errors.closing_time && <p className="text-xs text-red-500">{errors.closing_time}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Días de atención</label>
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

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
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

// ─── Modal: Soporte ───────────────────────────────────────────────────────────

function SupportModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">Soporte</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Tienes algún problema con tu tienda o necesitas ayuda? Contáctanos por los siguientes medios:
          </p>
          <div className="space-y-3">
            {[
              { label: 'WhatsApp',      value: '+57 300 000 0000', href: 'https://wa.me/573000000000' },
              { label: 'Email',         value: 'soporte@orflash.com', href: 'mailto:soporte@orflash.com' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.value}</span>
              </a>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

type ActiveModal = 'info' | 'hours' | 'support' | null;

export default function StoreProfile() {
  const { auth, store, storeStats } = usePage<PageProps>().props;
  const user = auth?.user;

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const menuItems = [
    {
      label: 'Información del negocio',
      icon: Store,
      color: 'from-violet-500 to-purple-600',
      subtitle: store?.business_name,
      modal: 'info' as ActiveModal,
    },
    {
      label: 'Horarios',
      icon: Clock,
      color: 'from-blue-500 to-cyan-600',
      subtitle: store?.opening_time ? `${store.opening_time} – ${store.closing_time}` : 'No configurado',
      modal: 'hours' as ActiveModal,
    },
    {
      label: 'Soporte',
      icon: HelpCircle,
      color: 'from-orange-500 to-amber-500',
      subtitle: 'Contactar al equipo OrFlash',
      modal: 'support' as ActiveModal,
    },
  ];

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">

        {/* Banner */}
        <div className="rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 overflow-hidden shrink-0">
              {store?.images?.[0] ? (
                <img
                  src={`/storage/${store.images[0]}`}
                  alt={store.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                  🏪
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{store?.business_name ?? user?.name}</h1>
              <p className="text-emerald-100 text-sm">{user?.email}</p>
              <span className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {store?.status === 'active' ? 'Tienda activa' : 'Pendiente de aprobación'}
              </span>
            </div>
            <button
              onClick={() => setActiveModal('info')}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              title="Editar información"
            >
              <Pencil className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pedidos',      value: storeStats?.total_orders ?? 0,                             icon: Package    },
            { label: 'Calificación', value: store?.rating > 0 ? store.rating.toFixed(1) : '—',        icon: Star       },
            { label: 'Este mes',     value: formatPrice(storeStats?.monthly_revenue ?? 0),              icon: TrendingUp },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Menú de configuración */}
        <div className="space-y-2">
          {menuItems.map(({ label, icon: Icon, color, subtitle, modal }) => (
            <button
              key={label}
              onClick={() => setActiveModal(modal)}
              className="w-full rounded-2xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-secondary/30 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-sm shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium">{label}</p>
                {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
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

      {/* Modales */}
      {activeModal === 'info'    && <BusinessInfoModal store={store} onClose={() => setActiveModal(null)} />}
      {activeModal === 'hours'   && <HoursModal        store={store} onClose={() => setActiveModal(null)} />}
      {activeModal === 'support' && <SupportModal                    onClose={() => setActiveModal(null)} />}

    </StoreLayout>
  );
}
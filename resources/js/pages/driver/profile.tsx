import { PageTransition } from '@/components/shared/Animations';
import { usePage, router } from '@inertiajs/react';
import {
  Bike, FileText, DollarSign, HelpCircle, ChevronRight,
  LogOut, Star, Package, X, Save, User, Phone, Car,
  MapPin, Calendar, CreditCard, Upload, CheckCircle,
  TrendingUp, Clock, BarChart3,
} from 'lucide-react';
import DriverLayout from '@/layouts/DriverLayout';
import { formatPrice } from '@/lib/format';
import { useState, useRef } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DriverStats {
  total_deliveries: number;
  total_earnings:   number;
  earnings_today:   number;
  earnings_week:    number;
  earnings_month:   number;
  rating:           number | null;
}

interface RecentOrder {
  id:              number;
  driver_earnings: number;
  delivered_at:    string;
  store:           { business_name: string };
}

interface ProfileData {
  name:            string;
  email:           string;
  phone:           string | null;
  birth_date:      string | null;
  address:         string | null;
  neighborhood:    string | null;
  city:            string | null;
  document_type:   string | null;
  document_number: string | null;
  vehicle_type:    string | null;
  vehicle_brand:   string | null;
  vehicle_model:   string | null;
  vehicle_color:   string | null;
  vehicle_plate:   string | null;
  document_photo:  string | null;
  selfie_photo:    string | null;
  soat:            string | null;
  license:         string | null;
}

interface PageProps {
  driverStats:  DriverStats;
  recentOrders: RecentOrder[];
  profileData:  ProfileData;
  auth: { user: { name: string; email: string } };
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, value, icon: Icon, placeholder, onChange, type = 'text', readOnly = false, error,
}: {
  label: string; value: string; icon?: any; placeholder?: string;
  onChange?: (v: string) => void; type?: string; readOnly?: boolean; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none transition-colors ${
            readOnly ? 'opacity-60 cursor-default' : 'focus:ring-2 focus:ring-emerald-500'
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Modal: Información personal ──────────────────────────────────────────────

function PersonalModal({ profileData, onClose }: { profileData: ProfileData; onClose: () => void }) {
  const [form, setForm] = useState({
    name:            profileData.name            ?? '',
    phone:           profileData.phone           ?? '',
    birth_date:      profileData.birth_date      ?? '',
    address:         profileData.address         ?? '',
    neighborhood:    profileData.neighborhood    ?? '',
    city:            profileData.city            ?? '',
    document_type:   profileData.document_type   ?? 'CC',
    document_number: profileData.document_number ?? '',
    vehicle_brand:   profileData.vehicle_brand   ?? '',
    vehicle_model:   profileData.vehicle_model   ?? '',
    vehicle_color:   profileData.vehicle_color   ?? '',
    vehicle_plate:   profileData.vehicle_plate   ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const u = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    router.patch('/driver/profile', form, {
      preserveScroll: true,
      onSuccess: () => { setSaving(false); onClose(); },
      onError:   errs => { setErrors(errs); setSaving(false); },
    });
  };

  const showVehicle = profileData.vehicle_type && profileData.vehicle_type !== 'a_pie';
  const needsPlate  = profileData.vehicle_type === 'moto' || profileData.vehicle_type === 'carro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-bold text-lg">Información personal</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Datos personales */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos personales</p>
          <Field label="Nombre completo" value={form.name}         icon={User}     placeholder="Tu nombre"     onChange={v => u('name', v)}         error={errors.name}  />
          <Field label="Correo"          value={profileData.email} icon={CreditCard} readOnly                                                                              />
          <Field label="Teléfono"        value={form.phone}        icon={Phone}    placeholder="3001234567"    onChange={v => u('phone', v)}        error={errors.phone} />
          <Field label="Fecha de nac."   value={form.birth_date}   icon={Calendar} type="date"                 onChange={v => u('birth_date', v)}                         />

          {/* Residencia */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Residencia</p>
          <Field label="Dirección"    value={form.address}      icon={MapPin} placeholder="Carrera 10 # 12-34" onChange={v => u('address', v)}      />
          <Field label="Barrio"       value={form.neighborhood}             placeholder="Nombre del barrio"    onChange={v => u('neighborhood', v)} />
          <Field label="Ciudad"       value={form.city}         icon={MapPin} placeholder="Cali"               onChange={v => u('city', v)}         error={errors.city}  />

          {/* Documento */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Documento</p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</label>
            <select
              value={form.document_type}
              onChange={e => u('document_type', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>
          <Field label="Número de documento" value={form.document_number} icon={CreditCard} placeholder="1234567890" onChange={v => u('document_number', v)} error={errors.document_number} />

          {/* Vehículo */}
          {showVehicle && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Vehículo</p>
              <Field label="Marca"  value={form.vehicle_brand} icon={Car} placeholder="Honda"  onChange={v => u('vehicle_brand', v)} />
              <Field label="Modelo" value={form.vehicle_model} icon={Car} placeholder="2022"   onChange={v => u('vehicle_model', v)} />
              <Field label="Color"  value={form.vehicle_color} icon={Car} placeholder="Rojo"   onChange={v => u('vehicle_color', v)} />
              {needsPlate && <Field label="Placa" value={form.vehicle_plate} icon={Car} placeholder="ABC123" onChange={v => u('vehicle_plate', v)} />}
            </>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Modal: Documentos ────────────────────────────────────────────────────────

function DocumentsModal({ profileData, onClose }: { profileData: ProfileData; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const refs = {
    document_photo: useRef<HTMLInputElement>(null),
    selfie_photo:   useRef<HTMLInputElement>(null),
    soat:           useRef<HTMLInputElement>(null),
    license:        useRef<HTMLInputElement>(null),
  };
  const [selected, setSelected] = useState<Record<string, File | null>>({
    document_photo: null, selfie_photo: null, soat: null, license: null,
  });

  const docList: { key: keyof typeof refs; label: string; hint: string; accept: string }[] = [
    { key: 'document_photo', label: 'Foto del documento',   hint: 'CC / CE / Pasaporte',       accept: 'image/*'            },
    { key: 'selfie_photo',   label: 'Selfie con documento', hint: 'Foto sosteniendo tu doc.',  accept: 'image/*'            },
    { key: 'soat',           label: 'SOAT',                 hint: 'PDF o imagen del seguro',   accept: 'image/*,application/pdf' },
    { key: 'license',        label: 'Licencia de conducción', hint: 'Foto de la licencia',     accept: 'image/*'            },
  ];

  const handleUpload = () => {
    const data = new FormData();
    let hasFile = false;
    Object.entries(selected).forEach(([k, file]) => {
      if (file) { data.append(k, file); hasFile = true; }
    });
    if (!hasFile) return;

    setSaving(true);
    router.post('/driver/profile/documents', data as any, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => { setSaving(false); setSuccess('Documentos actualizados.'); setTimeout(onClose, 1500); },
      onError:   () => setSaving(false),
    });
  };

  const existingUrl = (path: string | null) => path ? `/storage/${path}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-bold text-lg">Documentos</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}

          {docList.map(({ key, label, hint, accept }) => {
            const existing   = existingUrl((profileData as any)[key]);
            const fileChosen = selected[key];
            const isOk       = existing && !fileChosen;

            return (
              <div key={key} className="rounded-2xl border border-border bg-secondary/20 p-4 flex items-center gap-3">
                {/* Estado */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isOk ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                }`}>
                  {isOk
                    ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                    : <FileText    className="w-5 h-5 text-amber-600"   />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {fileChosen ? fileChosen.name : isOk ? 'Cargado ✓' : hint}
                  </p>
                </div>

                {/* Botón subir */}
                <input
                  ref={refs[key]}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={e => setSelected(p => ({ ...p, [key]: e.target.files?.[0] ?? null }))}
                />
                <button
                  onClick={() => refs[key].current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-secondary transition-colors flex items-center gap-1 shrink-0"
                >
                  <Upload className="w-3 h-3" />
                  {isOk ? 'Cambiar' : 'Subir'}
                </button>
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground px-1">
            Los documentos serán verificados por el equipo de OrFlash. Formatos: JPG, PNG, PDF (máx. 4 MB).
          </p>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
              Cerrar
            </button>
            <button
              onClick={handleUpload}
              disabled={saving || !Object.values(selected).some(Boolean)}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Subiendo…' : 'Guardar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Modal: Mis ganancias ─────────────────────────────────────────────────────

function EarningsModal({
  driverStats,
  recentOrders,
  onClose,
}: {
  driverStats:  DriverStats;
  recentOrders: RecentOrder[];
  onClose:      () => void;
}) {
  const periods = [
    { label: 'Hoy',      value: driverStats.earnings_today,  icon: Clock,       color: 'from-violet-500 to-purple-600' },
    { label: 'Semana',   value: driverStats.earnings_week,   icon: TrendingUp,  color: 'from-blue-500 to-indigo-600'  },
    { label: 'Mes',      value: driverStats.earnings_month,  icon: BarChart3,   color: 'from-emerald-500 to-teal-600' },
    { label: 'Total',    value: driverStats.total_earnings,  icon: DollarSign,  color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-bold text-lg">Mis ganancias</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Tarjetas por período */}
          <div className="grid grid-cols-2 gap-3">
            {periods.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-2xl p-4 bg-linear-to-br ${color} text-white shadow-lg`}>
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg font-bold leading-tight">{formatPrice(value)}</p>
                <p className="text-xs text-white/75 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Entregas totales */}
          <div className="rounded-2xl border border-border bg-secondary/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Entregas realizadas</p>
                <p className="text-xs text-muted-foreground">Total histórico</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-emerald-600">{driverStats.total_deliveries}</span>
          </div>

          {/* Últimas entregas */}
          {recentOrders.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Últimas entregas</p>
              <div className="space-y-2">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{order.store.business_name}</p>
                      <p className="text-xs text-muted-foreground">
                        #{String(order.id).padStart(8, '0')} · {new Date(order.delivered_at).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 shrink-0 ml-2">
                      +{formatPrice(order.driver_earnings)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {recentOrders.length === 0 && (
            <div className="text-center py-6">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aún no tienes entregas</p>
            </div>
          )}

          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
            Cerrar
          </button>

        </div>
      </div>
    </div>
  );
}

// ─── Modal: Soporte ───────────────────────────────────────────────────────────

function SupportModal({ onClose }: { onClose: () => void }) {
  const { support } = usePage().props as any;
  const contacts = [
    { label: 'WhatsApp', value: support?.phone ?? '+57 300 000 0000', href: `https://wa.me/${support?.whatsapp ?? '573000000000'}` },
    { label: 'Email',    value: support?.email ?? 'soporte@orflash.com', href: `mailto:${support?.email ?? 'soporte@orflash.com'}` },
  ];
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
          <p className="text-sm text-muted-foreground">¿Tienes un problema? Contáctanos:</p>
          <div className="space-y-3">
            {contacts.map(item => (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.value}</span>
              </a>
            ))}
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

type ActiveModal = 'personal' | 'documents' | 'earnings' | 'vehicle' | 'support' | null;

export default function DriverProfile() {
  const { auth, driverStats, profileData, recentOrders } = usePage<PageProps>().props;
  const user = auth?.user;
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const vehicleLabel = profileData?.vehicle_type
    ? ({ moto: 'Moto 🛵', bicicleta: 'Bicicleta 🚲', carro: 'Carro 🚗', a_pie: 'A pie 🚶' } as Record<string, string>)[profileData.vehicle_type] ?? profileData.vehicle_type
    : null;

  const menuItems: { label: string; subtitle: string; icon: any; color: string; modal: ActiveModal }[] = [
    {
      label:    'Información personal',
      subtitle: [profileData?.city, profileData?.address].filter(Boolean).join(' · ') || 'Completar información',
      icon:     User,
      color:    'from-violet-500 to-purple-600',
      modal:    'personal',
    },
    {
      label:    'Mi vehículo',
      subtitle: profileData?.vehicle_brand
        ? `${profileData.vehicle_brand} ${profileData.vehicle_model ?? ''} · ${vehicleLabel ?? ''}`
        : vehicleLabel ?? 'Sin configurar',
      icon:     Bike,
      color:    'from-indigo-500 to-blue-600',
      modal:    'vehicle',
    },
    {
      label:    'Documentos',
      subtitle: [
        profileData?.document_photo && 'Documento',
        profileData?.selfie_photo   && 'Selfie',
        profileData?.soat           && 'SOAT',
        profileData?.license        && 'Licencia',
      ].filter(Boolean).join(', ') || 'Subir documentos requeridos',
      icon:     FileText,
      color:    'from-blue-500 to-cyan-600',
      modal:    'documents',
    },
    {
      label:    'Mis ganancias',
      subtitle: `${formatPrice(driverStats?.total_earnings ?? 0)} acumulado · ${driverStats?.total_deliveries ?? 0} entregas`,
      icon:     DollarSign,
      color:    'from-emerald-500 to-teal-600',
      modal:    'earnings',
    },
    {
      label:    'Soporte',
      subtitle: 'Contactar al equipo OrFlash',
      icon:     HelpCircle,
      color:    'from-orange-500 to-amber-500',
      modal:    'support',
    },
  ];

  return (
    <DriverLayout>
      <PageTransition className="space-y-6 p-4 pb-8">

        {/* Avatar card */}
        <div className="rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
              {(profileData?.name ?? user?.name)?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{profileData?.name ?? user?.name}</h1>
              <p className="text-emerald-100 text-sm">{user?.email}</p>
              {profileData?.city && (
                <p className="text-emerald-200 text-xs mt-0.5">📍 {profileData.city}</p>
              )}
              <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                Domiciliario {vehicleLabel && `· ${vehicleLabel}`}
              </span>
            </div>
            <button
              onClick={() => setActiveModal('personal')}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              title="Editar perfil"
            >
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Entregas',     value: driverStats?.total_deliveries ?? 0,                                              icon: Package    },
            { label: 'Calificación', value: driverStats?.rating != null ? driverStats.rating.toFixed(1) : '—',        icon: Star       },
            { label: 'Ganancias',    value: formatPrice(driverStats?.total_earnings ?? 0),                             icon: DollarSign },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="font-bold text-sm">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Menú */}
        <div className="space-y-2">
          {menuItems.map(({ label, subtitle, icon: Icon, color, modal }) => (
            <button
              key={label}
              onClick={() => modal && setActiveModal(modal)}
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

      {activeModal === 'personal'  && <PersonalModal   profileData={profileData} onClose={() => setActiveModal(null)} />}
      {activeModal === 'vehicle'   && <PersonalModal   profileData={profileData} onClose={() => setActiveModal(null)} />}
      {activeModal === 'documents' && <DocumentsModal  profileData={profileData} onClose={() => setActiveModal(null)} />}
      {activeModal === 'earnings'  && <EarningsModal   driverStats={driverStats} recentOrders={recentOrders ?? []} onClose={() => setActiveModal(null)} />}
      {activeModal === 'support'   && <SupportModal                              onClose={() => setActiveModal(null)} />}

    </DriverLayout>
  );
}

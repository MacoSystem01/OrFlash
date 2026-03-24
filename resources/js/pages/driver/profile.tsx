import { PageTransition } from '@/components/shared/Animations';
import { usePage, router } from '@inertiajs/react';
import {
  Bike, FileText, DollarSign, HelpCircle, ChevronRight,
  LogOut, Star, Package, X, Save, User, Phone, Car,
} from 'lucide-react';
import DriverLayout from '@/layouts/DriverLayout';
import { formatPrice } from '@/lib/format';
import { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DriverStats {
  total_deliveries: number;
  total_earnings:   number;
}

interface ProfileData {
  name:          string;
  phone:         string | null;
  vehicle_type:  string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
}

interface PageProps {
  driverStats:  DriverStats;
  profileData:  ProfileData;
  auth: { user: { name: string; email: string } };
  [key: string]: unknown;
}

// ─── Modal: Editar perfil personal ────────────────────────────────────────────

function PersonalModal({ profileData, onClose }: { profileData: ProfileData; onClose: () => void }) {
  const [form, setForm] = useState({
    name:          profileData.name          ?? '',
    phone:         profileData.phone         ?? '',
    vehicle_brand: profileData.vehicle_brand ?? '',
    vehicle_model: profileData.vehicle_model ?? '',
    vehicle_color: profileData.vehicle_color ?? '',
    vehicle_plate: profileData.vehicle_plate ?? '',
  });
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const u = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSave = () => {
    setSaving(true);
    router.patch('/driver/profile', form, {
      preserveScroll: true,
      onSuccess: () => { setSaving(false); onClose(); },
      onError:   errs => { setErrors(errs); setSaving(false); },
    });
  };

  const InputField = ({ label, field, icon: Icon, placeholder, type = 'text' }: {
    label: string; field: keyof typeof form; icon: any; placeholder: string; type?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={type}
          value={form[field]}
          onChange={e => u(field, e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
        />
      </div>
      {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
    </div>
  );

  const needsPlate = profileData.vehicle_type === 'moto' || profileData.vehicle_type === 'carro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h2 className="font-bold text-lg">Editar perfil</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Datos personales</p>
          {InputField({ label: 'Nombre completo', field: 'name',  icon: User,  placeholder: 'Tu nombre' })}
          {InputField({ label: 'Teléfono',        field: 'phone', icon: Phone, placeholder: '3001234567' })}

          {profileData.vehicle_type && profileData.vehicle_type !== 'a_pie' && (
            <>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-2">Datos del vehículo</p>
              {InputField({ label: 'Marca',  field: 'vehicle_brand', icon: Car, placeholder: 'Ej: Honda' })}
              {InputField({ label: 'Modelo', field: 'vehicle_model', icon: Car, placeholder: 'Ej: 2022'  })}
              {InputField({ label: 'Color',  field: 'vehicle_color', icon: Car, placeholder: 'Ej: Rojo'  })}
              {needsPlate && InputField({ label: 'Placa', field: 'vehicle_plate', icon: Car, placeholder: 'Ej: ABC123' })}
            </>
          )}

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
          <p className="text-sm text-muted-foreground">¿Tienes un problema? Contáctanos:</p>
          <div className="space-y-3">
            {[
              { label: 'WhatsApp', value: '+57 300 000 0000', href: 'https://wa.me/573000000000' },
              { label: 'Email',    value: 'soporte@orflash.com', href: 'mailto:soporte@orflash.com' },
            ].map(item => (
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

type ActiveModal = 'edit' | 'support' | null;

export default function DriverProfile() {
  const { auth, driverStats, profileData } = usePage<PageProps>().props;
  const user = auth?.user;
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const vehicleLabel = profileData?.vehicle_type
    ? { moto: 'Moto 🛵', bicicleta: 'Bicicleta 🚲', carro: 'Carro 🚗', a_pie: 'A pie 🚶' }[profileData.vehicle_type] ?? profileData.vehicle_type
    : null;

  const menuItems = [
    {
      label:    'Mi vehículo',
      subtitle: profileData?.vehicle_brand
        ? `${profileData.vehicle_brand} ${profileData.vehicle_model ?? ''} · ${vehicleLabel ?? ''}`
        : vehicleLabel ?? 'Sin configurar',
      icon:  Bike,
      color: 'from-violet-500 to-purple-600',
      modal: 'edit' as ActiveModal,
    },
    {
      label:    'Documentos',
      subtitle: 'Ver documentos registrados',
      icon:  FileText,
      color: 'from-blue-500 to-cyan-600',
      modal: null,
    },
    {
      label:    'Mis ganancias',
      subtitle: formatPrice(driverStats?.total_earnings ?? 0) + ' acumulado',
      icon:  DollarSign,
      color: 'from-emerald-500 to-teal-600',
      modal: null,
    },
    {
      label:    'Soporte',
      subtitle: 'Contactar al equipo OrFlash',
      icon:  HelpCircle,
      color: 'from-orange-500 to-amber-500',
      modal: 'support' as ActiveModal,
    },
  ];

  return (
    <DriverLayout>
      <PageTransition className="space-y-6">

        {/* Avatar card */}
        <div className="rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
              {(profileData?.name ?? user?.name)?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{profileData?.name ?? user?.name}</h1>
              <p className="text-emerald-100 text-sm">{user?.email}</p>
              <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                Domiciliario {vehicleLabel && `· ${vehicleLabel}`}
              </span>
            </div>
            <button
              onClick={() => setActiveModal('edit')}
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
            { label: 'Entregas',     value: driverStats?.total_deliveries ?? 0,            icon: Package    },
            { label: 'Calificación', value: '5.0',                                          icon: Star       },
            { label: 'Ganancias',    value: formatPrice(driverStats?.total_earnings ?? 0), icon: DollarSign },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{s.value}</p>
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

      {activeModal === 'edit'    && <PersonalModal profileData={profileData} onClose={() => setActiveModal(null)} />}
      {activeModal === 'support' && <SupportModal                            onClose={() => setActiveModal(null)} />}

    </DriverLayout>
  );
}
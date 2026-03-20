import { PageTransition } from '@/components/shared/Animations';
import { router, usePage } from '@inertiajs/react';
import {
  MapPin, CreditCard, Bell, HelpCircle, FileText,
  ChevronRight, LogOut, User, Phone, Home,
  Hash, AlertCircle, CheckCircle, X, Trash2,
} from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface ProfileData {
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  references: string | null;
  alternate_phone: string | null;
  cedula: string | null;
  notifications?: string | null;
}

interface PaymentMethod {
  id: number;
  type: 'cash' | 'pse' | 'nequi' | 'daviplata';
  is_default: boolean;
  pse_bank?: string;
  pse_person_type?: string;
  pse_account_type?: string;
  pse_email?: string;
  pse_document?: string;
  nequi_phone?: string;
  nequi_name?: string;
  daviplata_phone?: string;
}

interface PageProps extends Record<string, unknown> {
  auth: { user: UserData };
  user: UserData;
  profile: ProfileData | null;
  paymentMethods: PaymentMethod[];
  flash: { success?: string; error?: string };
}

// ─── Bancos PSE ───────────────────────────────────────────────────────────────

const PSE_BANKS = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA', 'Banco Popular',
  'Banco Agrario', 'Banco Caja Social', 'Banco Falabella', 'Banco Pichincha',
  'Banco Santander', 'Bancoomeva', 'Citibank', 'Colpatria', 'Nequi',
  'Daviplata', 'Lulo Bank', 'Rappipay', 'Nubank',
];

// ─── Componente Field ─────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, icon: Icon, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background focus-within:border-violet-500 transition-colors">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>
    </div>
  );
}

// ─── Componente Select ────────────────────────────────────────────────────────

function SelectField({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background outline-none text-sm focus:border-violet-500 transition-colors"
      >
        <option value="">Seleccionar...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Modal genérico ───────────────────────────────────────────────────────────

function Modal({
  title, children, onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-base">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ClientProfile() {
  const { user, profile, paymentMethods, flash } = usePage<PageProps>().props;

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activePayment, setActivePayment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Datos personales
  const [name, setName] = useState(user.name ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [altPhone, setAltPhone] = useState(profile?.alternate_phone ?? '');
  const [cedula, setCedula] = useState(profile?.cedula ?? '');

  // Dirección
  const [address, setAddress] = useState(profile?.address ?? '');
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [references, setReferences] = useState(profile?.references ?? '');

  // Notificaciones
  const notifData = profile ? (() => {
    try { return JSON.parse((profile as any).notifications ?? '{}'); } catch { return {}; }
  })() : {};
  const [notifyOrders, setNotifyOrders] = useState(notifData.notify_orders ?? true);
  const [notifyPromotions, setNotifyPromotions] = useState(notifData.notify_promotions ?? false);
  const [notifyNews, setNotifyNews] = useState(notifData.notify_news ?? false);

  // PSE
  const pseSaved = paymentMethods.find((m) => m.type === 'pse');
  const [pseBank, setPseBank] = useState(pseSaved?.pse_bank ?? '');
  const [psePersonType, setPsePersonType] = useState(pseSaved?.pse_person_type ?? '');
  const [pseAccountType, setPseAccountType] = useState(pseSaved?.pse_account_type ?? '');
  const [pseEmail, setPseEmail] = useState(pseSaved?.pse_email ?? '');
  const [pseDocument, setPseDocument] = useState(pseSaved?.pse_document ?? '');

  // Nequi
  const nequiSaved = paymentMethods.find((m) => m.type === 'nequi');
  const [nequiPhone, setNequiPhone] = useState(nequiSaved?.nequi_phone ?? '');
  const [nequiName, setNequiName] = useState(nequiSaved?.nequi_name ?? '');

  // Daviplata
  const daviplataMethod = paymentMethods.find((m) => m.type === 'daviplata');
  const [daviplataPhone, setDaviplataPhone] = useState(daviplataMethod?.daviplata_phone ?? '');

  const save = (url: string, data: Record<string, any>, method: 'put' | 'post' = 'put') => {
    setSaving(true);
    router[method](url, data, {
      onFinish: () => { setSaving(false); setActivePayment(null); },
    });
  };

  const deletePayment = (type: string) => {
    router.delete('/client/profile/payment-method', {
      data: { type },
    });
  };

  const menuItems = [
    {
      key: 'address',
      label: 'Direcciones guardadas',
      icon: MapPin,
      color: 'from-violet-500 to-purple-600',
      value: profile?.address ? `${profile.address}, ${profile.city ?? ''}` : 'Sin dirección registrada',
    },
    {
      key: 'personal',
      label: 'Datos personales',
      icon: User,
      color: 'from-blue-500 to-cyan-600',
      value: user.phone ?? 'Sin teléfono registrado',
    },
    {
      key: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
      color: 'from-amber-500 to-orange-500',
      value: notifyOrders ? 'Activas' : 'Desactivadas',
    },
    {
      key: 'payment',
      label: 'Métodos de pago',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-600',
      value: paymentMethods.find((m) => m.is_default)?.type === 'pse' ? 'PSE'
        : paymentMethods.find((m) => m.is_default)?.type === 'nequi' ? 'Nequi'
          : paymentMethods.find((m) => m.is_default)?.type === 'daviplata' ? 'Daviplata'
            : 'Efectivo contra entrega',
    },
    {
      key: 'support',
      label: 'Soporte',
      icon: HelpCircle,
      color: 'from-pink-500 to-rose-600',
      value: 'Ayuda y contacto',
    },
    {
      key: 'terms',
      label: 'Términos y condiciones',
      icon: FileText,
      color: 'from-slate-500 to-slate-600',
      value: 'Ver documento',
    },
  ];

  const paymentOptions = [
    {
      key: 'cash',
      label: 'Efectivo contra entrega',
      desc: 'Paga cuando recibas tu pedido',
      emoji: '💵',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      key: 'pse',
      label: 'PSE',
      desc: 'Débito bancario en línea',
      emoji: '🏦',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      key: 'nequi',
      label: 'Nequi',
      desc: 'Aprueba el pago desde tu app',
      emoji: '💜',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      key: 'daviplata',
      label: 'Daviplata',
      desc: 'Confirma el pago en tu celular',
      emoji: '❤️',
      gradient: 'from-red-500 to-rose-600',
    },
  ];

  return (
    <ClientLayout>
      <PageTransition className="p-4 space-y-6">

        {/* Flash */}
        {flash?.success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />{flash.success}
          </div>
        )}
        {flash?.error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{flash.error}
          </div>
        )}

        {/* Avatar */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-xl shadow-violet-500/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
              {user.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-violet-200 text-sm">{user.email}</p>
              {user.phone && <p className="text-violet-200 text-xs mt-0.5">📞 {user.phone}</p>}
              <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">Cliente</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Pedidos', value: '0' }, { label: 'Favoritos', value: '0' }, { label: 'Puntos', value: '0' }].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Menú */}
        <div className="space-y-2">
          {menuItems.map(({ key, label, icon: Icon, color, value }) => (
            <button
              key={key}
              onClick={() => setActiveModal(key)}
              className="w-full rounded-2xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-secondary/30 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{value}</p>
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

      {/* ── Modal: Datos personales ── */}
      {activeModal === 'personal' && (
        <Modal title="Datos personales" onClose={() => setActiveModal(null)}>
          <Field label="Nombre completo" value={name} onChange={setName} icon={User} placeholder="Tu nombre" />
          <Field label="Teléfono principal" value={phone} onChange={setPhone} icon={Phone} placeholder="300 000 0000" type="tel" />
          <Field label="Teléfono secundario" value={altPhone} onChange={setAltPhone} icon={Phone} placeholder="301 000 0000" type="tel" />
          <Field label="Cédula" value={cedula} onChange={setCedula} icon={Hash} placeholder="1234567890" />
          <button
            onClick={() => save('/client/profile/user', { name, phone, alternate_phone: altPhone, cedula })}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </Modal>
      )}

      {/* ── Modal: Dirección ── */}
      {activeModal === 'address' && (
        <Modal title="Dirección de entrega" onClose={() => setActiveModal(null)}>
          <Field label="Dirección" value={address} onChange={setAddress} icon={Home} placeholder="Calle 45 #12-30" />
          <Field label="Barrio" value={neighborhood} onChange={setNeighborhood} icon={MapPin} placeholder="El Poblado" />
          <Field label="Ciudad" value={city} onChange={setCity} icon={MapPin} placeholder="Cali" />
          <Field label="Referencias" value={references} onChange={setReferences} icon={AlertCircle} placeholder="Apto 502, edificio azul" />
          <button
            onClick={() => save('/client/profile/details', { address, neighborhood, city, references })}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar dirección'}
          </button>
        </Modal>
      )}

      {/* ── Modal: Notificaciones ── */}
      {activeModal === 'notifications' && (
        <Modal title="Notificaciones" onClose={() => setActiveModal(null)}>
          {[
            { label: 'Pedidos y entregas', desc: 'Estado de tus pedidos en tiempo real', emoji: '📦', value: notifyOrders, set: setNotifyOrders },
            { label: 'Promociones', desc: 'Descuentos y ofertas especiales', emoji: '🎁', value: notifyPromotions, set: setNotifyPromotions },
            { label: 'Novedades', desc: 'Nuevas tiendas y productos', emoji: '🆕', value: notifyNews, set: setNotifyNews },
          ].map(({ label, desc, emoji, value, set }) => (
            <button
              key={label}
              onClick={() => set(!value)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${value ? 'border-violet-500 bg-violet-500/10' : 'border-border bg-background hover:bg-secondary/30'
                }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${value ? 'bg-violet-500/20' : 'bg-secondary'}`}>
                {emoji}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${value ? 'text-violet-600' : 'text-foreground'}`}>{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${value ? 'border-violet-500 bg-violet-500' : 'border-muted-foreground'
                }`}>
                {value && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </button>
          ))}
          <button
            onClick={() => save('/client/profile/notifications', { notify_orders: notifyOrders, notify_promotions: notifyPromotions, notify_news: notifyNews })}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm disabled:opacity-50 shadow-lg shadow-violet-500/30"
          >
            {saving ? 'Guardando...' : 'Guardar preferencias'}
          </button>
        </Modal>
      )}

      {/* ── Modal: Métodos de pago ── */}
      {activeModal === 'payment' && !activePayment && (
        <Modal title="Métodos de pago" onClose={() => setActiveModal(null)}>
          <p className="text-xs text-muted-foreground px-1">Selecciona y configura tu método de pago</p>
          {paymentOptions.map(({ key, label, desc, emoji, gradient }) => {
            const saved = paymentMethods.find((m) => m.type === key);
            const isActive = saved !== undefined || key === 'cash';
            return (
              <div
                key={key}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isActive ? 'border-violet-500 bg-violet-500/10' : 'border-border bg-background'
                  }`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shrink-0 shadow-sm`}>
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  {saved?.is_default && (
                    <span className="text-xs text-violet-600 font-semibold">★ Predeterminado</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {key !== 'cash' && (
                    <button
                      onClick={() => setActivePayment(key)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold shadow-sm"
                    >
                      {saved ? 'Editar' : 'Configurar'}
                    </button>
                  )}
                  {saved && key !== 'cash' && (
                    <button
                      onClick={() => deletePayment(key)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Quitar
                    </button>
                  )}
                  {key === 'cash' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Modal>
      )}

      {/* ── Sub-modal: PSE ── */}
      {activeModal === 'payment' && activePayment === 'pse' && (
        <Modal title="Configurar PSE" onClose={() => setActivePayment(null)}>
          <SelectField
            label="Banco"
            value={pseBank}
            onChange={setPseBank}
            options={PSE_BANKS.map((b) => ({ value: b, label: b }))}
          />
          <SelectField
            label="Tipo de persona"
            value={psePersonType}
            onChange={setPsePersonType}
            options={[{ value: 'natural', label: 'Natural' }, { value: 'juridica', label: 'Jurídica' }]}
          />
          <SelectField
            label="Tipo de cuenta (opcional)"
            value={pseAccountType}
            onChange={setPseAccountType}
            options={[{ value: 'ahorros', label: 'Ahorros' }, { value: 'corriente', label: 'Corriente' }]}
          />
          <Field label="Correo electrónico" value={pseEmail} onChange={setPseEmail} icon={AlertCircle} placeholder="correo@banco.com" type="email" />
          <Field label="Documento" value={pseDocument} onChange={setPseDocument} icon={Hash} placeholder="1234567890" />
          <div className="flex gap-2">
            <button
              onClick={() => save('/client/profile/payment-method', {
                type: 'pse', is_default: false,
                pse_bank: pseBank, pse_person_type: psePersonType,
                pse_account_type: pseAccountType, pse_email: pseEmail, pse_document: pseDocument,
              }, 'post')}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar PSE'}
            </button>
            <button
              onClick={() => save('/client/profile/payment-method', {
                type: 'pse', is_default: true,
                pse_bank: pseBank, pse_person_type: psePersonType,
                pse_account_type: pseAccountType, pse_email: pseEmail, pse_document: pseDocument,
              }, 'post')}
              disabled={saving}
              className="flex-1 py-3 rounded-xl border border-violet-500 text-violet-600 font-semibold text-sm disabled:opacity-50"
            >
              ★ Predeterminar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Sub-modal: Nequi ── */}
      {activeModal === 'payment' && activePayment === 'nequi' && (
        <Modal title="Configurar Nequi" onClose={() => setActivePayment(null)}>
          <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-sm text-violet-700">
            💜 Ingresa el número registrado en tu cuenta Nequi. Al pagar recibirás una notificación para aprobar.
          </div>
          <Field label="Teléfono Nequi" value={nequiPhone} onChange={setNequiPhone} icon={Phone} placeholder="300 000 0000" type="tel" />
          <Field label="Nombre (opcional)" value={nequiName} onChange={setNequiName} icon={User} placeholder="Tu nombre" />
          <div className="flex gap-2">
            <button
              onClick={() => save('/client/profile/payment-method', { type: 'nequi', is_default: false, nequi_phone: nequiPhone, nequi_name: nequiName }, 'post')}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Nequi'}
            </button>
            <button
              onClick={() => save('/client/profile/payment-method', { type: 'nequi', is_default: true, nequi_phone: nequiPhone, nequi_name: nequiName }, 'post')}
              disabled={saving}
              className="flex-1 py-3 rounded-xl border border-violet-500 text-violet-600 font-semibold text-sm disabled:opacity-50"
            >
              ★ Predeterminar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Sub-modal: Daviplata ── */}
      {activeModal === 'payment' && activePayment === 'daviplata' && (
        <Modal title="Configurar Daviplata" onClose={() => setActivePayment(null)}>
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-sm text-red-700">
            ❤️ Ingresa el número registrado en tu cuenta Daviplata. Al pagar recibirás una notificación para confirmar.
          </div>
          <Field label="Teléfono Daviplata" value={daviplataPhone} onChange={setDaviplataPhone} icon={Phone} placeholder="300 000 0000" type="tel" />
          <div className="flex gap-2">
            <button
              onClick={() => save('/client/profile/payment-method', { type: 'daviplata', is_default: false, daviplata_phone: daviplataPhone }, 'post')}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Daviplata'}
            </button>
            <button
              onClick={() => save('/client/profile/payment-method', { type: 'daviplata', is_default: true, daviplata_phone: daviplataPhone }, 'post')}
              disabled={saving}
              className="flex-1 py-3 rounded-xl border border-red-500 text-red-600 font-semibold text-sm disabled:opacity-50"
            >
              ★ Predeterminar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Soporte ── */}
      {activeModal === 'support' && (
        <Modal title="Soporte" onClose={() => setActiveModal(null)}>
          {[
            { emoji: '💬', label: 'Chat en vivo', desc: 'Habla con un agente ahora' },
            { emoji: '📧', label: 'Correo electrónico', desc: 'soporte@orflash.com' },
            { emoji: '📞', label: 'Línea de soporte', desc: 'Lunes a viernes 8am - 6pm' },
            { emoji: '❓', label: 'Preguntas frecuentes', desc: 'Encuentra respuestas rápidas' },
          ].map(({ emoji, label, desc }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-secondary/30 transition-colors text-left"
            >
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          ))}
        </Modal>
      )}

      {/* ── Modal: Términos ── */}
      {activeModal === 'terms' && (
        <Modal title="Términos y condiciones" onClose={() => setActiveModal(null)}>
          <div className="space-y-4 text-sm text-muted-foreground">

            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-700 text-xs">
              Última actualización: marzo 2026 — Versión 1.0
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">1. Identificación del responsable</p>
              <p>
                OrFlash es una plataforma de comercio electrónico y delivery operada por{' '}
                <span className="font-semibold text-foreground">[RAZÓN SOCIAL]</span>, identificada con NIT{' '}
                <span className="font-semibold text-foreground">[NIT]</span>, domiciliada en{' '}
                <span className="font-semibold text-foreground">[CIUDAD]</span>, Colombia. Correo de contacto:{' '}
                <span className="font-semibold text-foreground">legal@orflash.com</span>.
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">2. Objeto del servicio</p>
              <p>
                OrFlash actúa como intermediario tecnológico entre consumidores, comercios y repartidores
                independientes, facilitando la realización de pedidos y su entrega a domicilio, de conformidad
                con la <span className="font-semibold text-foreground">Ley 1480 de 2011</span> (Estatuto del Consumidor).
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">3. Aceptación de términos</p>
              <p>
                El uso de la plataforma implica la aceptación plena de estos términos. Si no está de acuerdo,
                debe abstenerse de usar el servicio. OrFlash se reserva el derecho de modificar estos términos
                con previo aviso de 15 días hábiles.
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">4. Tratamiento de datos personales</p>
              <p>
                En cumplimiento de la <span className="font-semibold text-foreground">Ley 1581 de 2012</span> y
                el <span className="font-semibold text-foreground">Decreto 1377 de 2013</span>, OrFlash recopila
                y trata datos personales para la prestación del servicio, facturación, soporte y mejora de la
                plataforma. El titular de los datos tiene derecho a conocer, actualizar, rectificar y suprimir
                su información. Para ejercer estos derechos contacte a:{' '}
                <span className="font-semibold text-foreground">datos@orflash.com</span>.
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">5. Derechos del consumidor</p>
              <p>
                De acuerdo con el Estatuto del Consumidor, el usuario tiene derecho a recibir productos y
                servicios de calidad, a la información veraz, a la protección contra prácticas abusivas y a
                presentar reclamaciones. OrFlash habilitará un canal de PQRS respondido en máximo{' '}
                <span className="font-semibold text-foreground">15 días hábiles</span>.
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">6. Precios y pagos</p>
              <p>
                Los precios publicados incluyen IVA cuando aplique, conforme al{' '}
                <span className="font-semibold text-foreground">Estatuto Tributario colombiano</span>. OrFlash
                no se responsabiliza por variaciones de precio generadas por los comercios aliados. Los métodos
                de pago disponibles están sujetos a las condiciones de cada pasarela y entidad financiera.
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">7. Política de cancelaciones y devoluciones</p>
              <p>
                El usuario podrá cancelar su pedido dentro de los{' '}
                <span className="font-semibold text-foreground">5 minutos</span> siguientes a su realización
                sin penalización. Transcurrido ese tiempo, la cancelación quedará sujeta al estado del pedido.
                Las devoluciones por productos en mal estado o incorrectos serán gestionadas conforme al
                artículo 58 de la Ley 1480 de 2011.
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">8. Responsabilidad</p>
              <p>
                OrFlash actúa como intermediario y no es responsable directo de la calidad de los productos
                ofrecidos por los comercios aliados. La responsabilidad de OrFlash se limita al valor del
                pedido afectado. OrFlash no responde por fallas de conectividad, casos fortuitos o fuerza mayor.
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">9. Propiedad intelectual</p>
              <p>
                Todos los contenidos de la plataforma (marca, diseño, código, textos e imágenes) son propiedad
                de OrFlash o sus licenciantes y están protegidos por la{' '}
                <span className="font-semibold text-foreground">Ley 23 de 1982</span> sobre derechos de autor.
                Queda prohibida su reproducción sin autorización escrita.
              </p>
            </div>

            <div>
              <p className="font-bold text-foreground mb-1">10. Ley aplicable y jurisdicción</p>
              <p>
                Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia será
                resuelta ante los jueces competentes de{' '}
                <span className="font-semibold text-foreground">[CIUDAD]</span>, agotando previamente la vía
                de conciliación conforme a la{' '}
                <span className="font-semibold text-foreground">Ley 640 de 2001</span>.
              </p>
            </div>

            {/* <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs">
              ⚠️ Los campos marcados con <span className="font-bold">[CORCHETES]</span> deben ser reemplazados
              con los datos reales de la empresa antes de publicar.
            </div> */}

          </div>
        </Modal>
      )}

    </ClientLayout>
  );
}
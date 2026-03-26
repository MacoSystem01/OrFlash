import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useCartStore } from '@/app/store/cartStore';
import { PageTransition } from '@/components/shared/Animations';
import {
  MapPin, CreditCard, ArrowLeft, ArrowRight, X,
  Loader2, CheckCircle, AlertCircle, ShoppingBag,
  Banknote, Smartphone, Building2, Home, Check, Phone, Hash,
} from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ClientProfile {
  address:       string | null;
  neighborhood:  string | null;
  city:          string | null;
  references:    string | null;
}

interface PaymentMethod {
  type:             string;
  is_default:       boolean;
  nequi_phone?:     string;
  daviplata_phone?: string;
  pse_bank?:        string;
  pse_person_type?: string;
  pse_account_type?: string;
  pse_email?:       string;
  pse_document?:    string;
}

interface PageProps {
  profile?:        ClientProfile;
  paymentMethods?: PaymentMethod[];
  deliveryFee:     number;
  wompiEnabled:    boolean;
  [key: string]: unknown;
}

// ─── Tarifa por distancia ─────────────────────────────────────────────────────

interface StoreLocation {
  latitude:          number | null;
  longitude:         number | null;
  coverage_radius_m: number;
  delivery_fee:      number | null;
}

interface DeliveryFeeResult {
  fee:       number;
  zone:      string;
  available: boolean;
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6_371_000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcDistanceFee(distanceM: number, storeCustomFee: number | null): DeliveryFeeResult {
  if (storeCustomFee !== null) return { fee: storeCustomFee, zone: 'Tarifa fija',        available: true  };
  if (distanceM <= 500)        return { fee: 1500,           zone: 'Zona cercana',       available: true  };
  if (distanceM <= 1000)       return { fee: 2500,           zone: 'Zona media',         available: true  };
  if (distanceM <= 1500)       return { fee: 3500,           zone: 'Zona lejana',        available: true  };
  if (distanceM <= 2000)       return { fee: 4500,           zone: 'Zona máxima',        available: true  };
  return                              { fee: 0,              zone: 'Fuera de cobertura', available: false };
}

// ─── Bancos PSE ───────────────────────────────────────────────────────────────

const PSE_BANKS = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA', 'Banco Popular',
  'Banco Agrario', 'Banco Caja Social', 'Banco Falabella', 'Banco Pichincha',
  'Banco Santander', 'Bancoomeva', 'Citibank', 'Colpatria', 'Nequi',
  'Daviplata', 'Lulo Bank', 'Rappipay', 'Nubank',
];

// ─── Config de visualización ──────────────────────────────────────────────────

const paymentConfig: Record<string, {
  label:    string;
  icon:     React.ElementType;
  gradient: string;
}> = {
  cash:           { label: 'Efectivo',       icon: Banknote,   gradient: 'from-green-500 to-emerald-600'  },
  contra_entrega: { label: 'Contra Entrega', icon: Home,       gradient: 'from-amber-500 to-orange-500'   },
  nequi:          { label: 'Nequi',          icon: Smartphone, gradient: 'from-pink-500 to-rose-500'      },
  pse:            { label: 'PSE',            icon: Building2,  gradient: 'from-blue-500 to-indigo-600'    },
  daviplata:      { label: 'Daviplata',      icon: Smartphone, gradient: 'from-red-500 to-rose-600'       },
};

const ALL_TYPES      = ['contra_entrega', 'cash', 'nequi', 'daviplata', 'pse'];
const ALWAYS_AVAILABLE = ['cash', 'contra_entrega'];
const ONLINE_TYPES   = ['nequi', 'daviplata', 'pse'];

function methodDetail(m: PaymentMethod): string | null {
  if (m.type === 'nequi'     && m.nequi_phone)     return m.nequi_phone;
  if (m.type === 'daviplata' && m.daviplata_phone)  return m.daviplata_phone;
  if (m.type === 'pse'       && m.pse_bank)         return m.pse_bank;
  return null;
}

// ─── Helper XSRF ─────────────────────────────────────────────────────────────

function getXsrf() {
  return decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
}

// ─── Modal genérico ───────────────────────────────────────────────────────────

function ConfigModal({
  title, gradient, children, onClose,
}: {
  title: string; gradient: string; children: React.ReactNode; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden">
        <div className={`flex items-center justify-between px-5 py-4 bg-linear-to-r ${gradient}`}>
          <h2 className="font-bold text-white text-sm">{title}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Campo de texto para modales ──────────────────────────────────────────────

function ModalField({
  label, value, onChange, placeholder, icon: Icon, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon?: React.ElementType; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background focus-within:border-violet-500 transition-colors">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>
    </div>
  );
}

// ─── Modal Nequi ─────────────────────────────────────────────────────────────

function NequiModal({
  onSave, onClose, saving,
}: {
  onSave: (data: Record<string, string>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [phone, setPhone] = useState('');
  const [name,  setName]  = useState('');
  return (
    <ConfigModal title="Configurar Nequi" gradient="from-pink-500 to-rose-500" onClose={onClose}>
      <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-sm text-pink-700">
        💜 Ingresa el número registrado en tu cuenta Nequi.
      </div>
      <ModalField label="Teléfono Nequi" value={phone} onChange={setPhone} icon={Phone} placeholder="300 000 0000" type="tel" />
      <ModalField label="Nombre (opcional)" value={name} onChange={setName} placeholder="Tu nombre" />
      <button
        onClick={() => onSave({ nequi_phone: phone, nequi_name: name })}
        disabled={saving || !phone.trim()}
        className="w-full py-3 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : 'Guardar y seleccionar'}
      </button>
    </ConfigModal>
  );
}

// ─── Modal Daviplata ──────────────────────────────────────────────────────────

function DaviplataModal({
  onSave, onClose, saving,
}: {
  onSave: (data: Record<string, string>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [phone, setPhone] = useState('');
  return (
    <ConfigModal title="Configurar Daviplata" gradient="from-red-500 to-rose-600" onClose={onClose}>
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-sm text-red-700">
        ❤️ Ingresa el número registrado en tu cuenta Daviplata.
      </div>
      <ModalField label="Teléfono Daviplata" value={phone} onChange={setPhone} icon={Phone} placeholder="300 000 0000" type="tel" />
      <button
        onClick={() => onSave({ daviplata_phone: phone })}
        disabled={saving || !phone.trim()}
        className="w-full py-3 rounded-xl bg-linear-to-r from-red-500 to-rose-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : 'Guardar y seleccionar'}
      </button>
    </ConfigModal>
  );
}

// ─── Modal PSE ────────────────────────────────────────────────────────────────

function PSEModal({
  onSave, onClose, saving,
}: {
  onSave: (data: Record<string, string>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [bank,        setBank]        = useState('');
  const [personType,  setPersonType]  = useState('');
  const [accountType, setAccountType] = useState('');
  const [email,       setEmail]       = useState('');
  const [document,    setDocument]    = useState('');
  return (
    <ConfigModal title="Configurar PSE" gradient="from-blue-500 to-indigo-600" onClose={onClose}>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Banco</label>
        <select value={bank} onChange={e => setBank(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background outline-none text-sm focus:border-violet-500">
          <option value="">Seleccionar banco...</option>
          {PSE_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo de persona</label>
        <select value={personType} onChange={e => setPersonType(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background outline-none text-sm focus:border-violet-500">
          <option value="">Seleccionar...</option>
          <option value="natural">Natural</option>
          <option value="juridica">Jurídica</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo de cuenta (opcional)</label>
        <select value={accountType} onChange={e => setAccountType(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background outline-none text-sm focus:border-violet-500">
          <option value="">Seleccionar...</option>
          <option value="ahorros">Ahorros</option>
          <option value="corriente">Corriente</option>
        </select>
      </div>
      <ModalField label="Correo electrónico" value={email} onChange={setEmail} icon={AlertCircle} placeholder="correo@banco.com" type="email" />
      <ModalField label="Documento" value={document} onChange={setDocument} icon={Hash} placeholder="1234567890" />
      <button
        onClick={() => onSave({ pse_bank: bank, pse_person_type: personType, pse_account_type: accountType, pse_email: email, pse_document: document })}
        disabled={saving || !bank || !personType}
        className="w-full py-3 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : 'Guardar y seleccionar'}
      </button>
    </ConfigModal>
  );
}

// ─── Selector de métodos de pago ──────────────────────────────────────────────

function PaymentSelector({
  methods, selected, rejected, onChange, onConfigure,
}: {
  methods:     PaymentMethod[];
  selected:    string;
  rejected:    string[];
  onChange:    (type: string) => void;
  onConfigure: (type: string) => void;
}) {
  return (
    <div className="space-y-2">
      {ALL_TYPES.map(type => {
        const saved      = methods.find(m => m.type === type);
        const configured = ALWAYS_AVAILABLE.includes(type) || !!saved;
        const isRejected = rejected.includes(type);
        const cfg        = paymentConfig[type];
        const Icon       = cfg?.icon ?? CreditCard;
        const isSelected = selected === type;
        const detail     = saved ? methodDetail(saved) : null;

        if (isRejected) {
          // Método descartado — mostrar deshabilitado
          return (
            <div key={type} className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-border bg-secondary/10 opacity-50 cursor-not-allowed">
              <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${cfg?.gradient ?? 'from-slate-400 to-slate-500'} flex items-center justify-center shrink-0 opacity-40`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-muted-foreground line-through">{cfg?.label ?? type}</p>
                <p className="text-xs text-muted-foreground">No seleccionado</p>
              </div>
            </div>
          );
        }

        if (configured) {
          // Método disponible — seleccionable
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                isSelected
                  ? 'border-violet-500 bg-violet-500/8 ring-1 ring-violet-500/30'
                  : 'border-border bg-card hover:border-violet-500/40 hover:bg-secondary/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${cfg?.gradient ?? 'from-slate-400 to-slate-500'} flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{cfg?.label ?? type}</p>
                {detail ? (
                  <p className="text-xs text-muted-foreground truncate">
                    {detail}{saved?.is_default ? ' · Predeterminado' : ''}
                  </p>
                ) : saved?.is_default ? (
                  <p className="text-xs text-violet-500 font-medium">Predeterminado</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Disponible</p>
                )}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isSelected ? 'border-violet-600 bg-violet-600' : 'border-muted-foreground/40'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        }

        // Método digital no configurado — abre modal de configuración
        return (
          <button
            key={type}
            type="button"
            onClick={() => onConfigure(type)}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-border bg-card hover:border-violet-500/50 hover:bg-secondary/30 transition-all text-left"
          >
            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${cfg?.gradient ?? 'from-slate-400 to-slate-500'} flex items-center justify-center shrink-0 shadow-sm opacity-70`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{cfg?.label ?? type}</p>
              <p className="text-xs text-violet-500 font-medium">Toca para configurar →</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30 shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ClientCheckout() {
  const { profile, paymentMethods = [], deliveryFee, wompiEnabled } = usePage<PageProps>().props;
  const { items, total, clearCart }      = useCartStore();

  const defaultMethod = (paymentMethods as PaymentMethod[]).find(m => m.is_default);
  const [localMethods,    setLocalMethods]    = useState<PaymentMethod[]>(paymentMethods as PaymentMethod[]);
  const [selectedType,    setSelectedType]    = useState<string>(defaultMethod?.type ?? 'contra_entrega');
  const [rejectedTypes,   setRejectedTypes]   = useState<string[]>([]);
  const [configuringType, setConfiguringType] = useState<string | null>(null);
  const [configSaving,    setConfigSaving]    = useState(false);
  const [configError,     setConfigError]     = useState('');

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [step,      setStep]      = useState<'review' | 'payment' | 'success'>('review');
  const [wompiData, setWompiData] = useState<any>(null);

  const [successMsg,     setSuccessMsg]     = useState('Tu pedido está siendo procesado por la tienda');
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [storeCoords,    setStoreCoords]    = useState<StoreLocation | null>(null);
  const [dynamicFee,     setDynamicFee]     = useState<number>(deliveryFee);
  const [deliveryZone,   setDeliveryZone]   = useState<string | null>(null);
  const [coverageError,  setCoverageError]  = useState<string>('');

  const grandTotal  = total() + dynamicFee;
  const isCod       = selectedType === 'contra_entrega' || selectedType === 'cash';
  const hasRejected = rejectedTypes.length > 0;

  // Obtener GPS del cliente al montar el componente
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setDeliveryCoords({ lat: coords.latitude, lng: coords.longitude }),
        () => {} // ignorar si deniega el permiso
      );
    }
  }, []);

  // Obtener coordenadas y tarifa de la tienda al montar
  useEffect(() => {
    const storeId = items[0]?.product?.storeId;
    if (!storeId) return;
    fetch(`/client/stores/${storeId}/location`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(r => r.json())
      .then((data: StoreLocation) => setStoreCoords(data))
      .catch(() => {});
  }, []);

  // Recalcular tarifa de domicilio cuando cambian las coordenadas
  useEffect(() => {
    if (!storeCoords) return;

    // Sin GPS del cliente o sin coordenadas de la tienda
    if (!deliveryCoords || storeCoords.latitude === null || storeCoords.longitude === null) {
      if (storeCoords.delivery_fee !== null) {
        setDynamicFee(storeCoords.delivery_fee);
        setDeliveryZone('Tarifa fija');
      }
      return;
    }

    const distM  = haversineMeters(
      storeCoords.latitude, storeCoords.longitude,
      deliveryCoords.lat,   deliveryCoords.lng
    );
    const result = calcDistanceFee(distM, storeCoords.delivery_fee);
    setDynamicFee(result.fee);
    setDeliveryZone(result.zone);
    setCoverageError(
      result.available
        ? ''
        : `Tu dirección está a ${(distM / 1000).toFixed(2)} km, fuera del radio de cobertura de ${(storeCoords.coverage_radius_m / 1000).toFixed(1)} km.`
    );
  }, [storeCoords, deliveryCoords]);

  useEffect(() => {
    if (items.length === 0 && step !== 'success') router.visit('/client/home');
  }, [items]);

  // ── Guardar método de pago desde el modal ─────────────────────────────────
  const handleConfigSave = async (type: string, data: Record<string, string>) => {
    setConfigSaving(true);
    setConfigError('');
    try {
      const res = await fetch('/client/profile/payment-method', {
        method:  'POST',
        headers: {
          'Content-Type':     'application/json',
          'Accept':           'application/json',
          'X-XSRF-TOKEN':     getXsrf(),
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ type, is_default: false, ...data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg  = body.message
          ?? Object.values(body.errors ?? {})[0]?.[0]
          ?? 'Error al guardar. Verifica los datos.';
        setConfigError(msg as string);
        return;
      }
      const newMethod: PaymentMethod = { type, is_default: false, ...data } as PaymentMethod;
      setLocalMethods(prev => [...prev.filter(m => m.type !== type), newMethod]);
      setRejectedTypes(prev => prev.filter(t => t !== type));
      setSelectedType(type);
      setConfiguringType(null);
    } catch {
      setConfigError('Error de conexión. Intenta de nuevo.');
    } finally {
      setConfigSaving(false);
    }
  };

  // ── Cerrar modal sin guardar → marcar como rechazado ─────────────────────
  const handleConfigClose = () => {
    if (configuringType && !localMethods.find(m => m.type === configuringType)) {
      setRejectedTypes(prev =>
        prev.includes(configuringType) ? prev : [...prev, configuringType]
      );
    }
    setConfiguringType(null);
    setConfigError('');
  };

  // ── Crear orden ───────────────────────────────────────────────────────────
  const handleCreateOrder = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/client/orders', {
        method:  'POST',
        headers: {
          'Content-Type':     'application/json',
          'X-XSRF-TOKEN':     getXsrf(),
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          store_id:            Number(items[0].product.storeId),
          delivery_fee:        dynamicFee,
          payment_method_type: selectedType || undefined,
          items:               items.map(i => ({ product_id: Number(i.product.id), quantity: i.quantity })),
          delivery_lat:        deliveryCoords?.lat ?? null,
          delivery_lng:        deliveryCoords?.lng ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error al crear el pedido.'); setLoading(false); return; }

      if (data.is_cod) {
        clearCart();
        if (data.is_manual_online) {
          const label = paymentConfig[data.payment_method as string]?.label ?? data.payment_method;
          setSuccessMsg(`Tu pedido está confirmado con pago por ${label}. La tienda verificará tu pago y procesará el pedido.`);
        }
        setStep('success');
        setLoading(false);
        return;
      }

      const wompiRes = await fetch(`/client/payments/generate/${data.order_id}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const wompi = await wompiRes.json();

      if (!wompiRes.ok) {
        if (wompi.wompi_error) {
          // Wompi no configurado — informar al cliente y ofrecer cambiar a contra entrega
          setError('El pago en línea no está disponible. Por favor selecciona Contra Entrega y vuelve a intentarlo.');
          setLoading(false);
          return;
        }
        setError(wompi.error ?? 'Error al iniciar el pago en línea.');
        setLoading(false);
        return;
      }

      setWompiData(wompi);
      setStep('payment');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    }
    setLoading(false);
  };

  // ── Iniciar widget Wompi ──────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'payment' || !wompiData) return;
    const launch = () => {
      const form = document.createElement('form');
      form.action = 'https://checkout.wompi.co/p/';
      form.method = 'GET';
      const fields: Record<string, string> = {
        'public-key':          wompiData.public_key,
        'currency':            wompiData.currency,
        'amount-in-cents':     String(wompiData.amount_in_cents),
        'reference':           wompiData.reference,
        'signature:integrity': wompiData.signature,
        'redirect-url':        wompiData.redirect_url,
      };
      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      clearCart();
    };
    if (!document.getElementById('wompi-script')) {
      const s = document.createElement('script');
      s.id = 'wompi-script'; s.src = 'https://checkout.wompi.co/widget.js'; s.async = true;
      s.onload = launch;
      document.body.appendChild(s);
    } else { launch(); }
  }, [step, wompiData]);

  // ── Éxito ─────────────────────────────────────────────────────────────────
  if (step === 'success') return (
    <ClientLayout>
      <PageTransition className="flex flex-col items-center justify-center min-h-[70vh] gap-5 p-6">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">¡Pedido confirmado!</h2>
          <p className="text-muted-foreground text-sm mt-1">{successMsg}</p>
        </div>
        <button onClick={() => router.visit('/client/orders')}
          className="px-6 py-3 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center gap-2">
          Ver mis pedidos <ArrowRight className="w-4 h-4" />
        </button>
      </PageTransition>
    </ClientLayout>
  );

  // ── Carrito vacío ─────────────────────────────────────────────────────────
  if (items.length === 0) return (
    <ClientLayout>
      <PageTransition className="flex flex-col items-center justify-center min-h-[70vh] gap-5 p-6">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-violet-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Carrito vacío</h2>
          <p className="text-muted-foreground text-sm mt-1">Agrega productos antes de continuar</p>
        </div>
        <button onClick={() => router.visit('/client/home')}
          className="px-6 py-3 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30">
          Explorar tiendas
        </button>
      </PageTransition>
    </ClientLayout>
  );

  return (
    <ClientLayout>
      <PageTransition className="p-4 space-y-5 pb-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.visit('/client/cart')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {/* Error de cobertura */}
        {coverageError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{coverageError}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Dirección */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Dirección de entrega</p>
              <p className="text-xs text-muted-foreground">
                {profile?.address
                  ? `${profile.address}${profile.neighborhood ? ', ' + profile.neighborhood : ''}${profile.city ? ', ' + profile.city : ''}`
                  : 'Sin dirección configurada'}
              </p>
            </div>
          </div>
          {profile?.references && <p className="text-xs text-muted-foreground pl-12">📍 {profile.references}</p>}
          {!profile?.address && (
            <button onClick={() => router.visit('/client/profile')}
              className="mt-2 text-xs text-violet-600 font-semibold pl-12 hover:underline">
              Configurar dirección →
            </button>
          )}
        </div>

        {/* Método de pago */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Método de pago</p>
              {hasRejected && (
                <p className="text-xs text-amber-600 font-medium mt-0.5">
                  ¿Con qué opción de pago deseas continuar?
                </p>
              )}
            </div>
          </div>

          <PaymentSelector
            methods={localMethods}
            selected={selectedType}
            rejected={rejectedTypes}
            onChange={setSelectedType}
            onConfigure={setConfiguringType}
          />
        </div>

        {/* Resumen */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">Resumen del pedido</h3>
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate mr-2">{product.name} x{quantity}</span>
              <span className="font-medium shrink-0">{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm pt-1 border-t border-border">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(total())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Domicilio</span>
              {deliveryZone && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  coverageError
                    ? 'bg-red-500/10 text-red-600'
                    : 'bg-violet-500/10 text-violet-600'
                }`}>
                  {deliveryZone}
                </span>
              )}
            </div>
            <span className={`font-medium ${coverageError ? 'text-red-500' : ''}`}>
              {coverageError ? '—' : formatPrice(dynamicFee)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Comisión plataforma</span>
            <span className="font-medium text-violet-600">Incluida</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-violet-600">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Distribución */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Distribución del pago</p>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tienda recibe (90%)</span>
            <span className="font-medium">{formatPrice(Math.round(total() * 0.9))}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Repartidor recibe (90%)</span>
            <span className="font-medium">{formatPrice(Math.round(dynamicFee * 0.9))}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>OrFlash (10% c/u)</span>
            <span className="font-medium">{formatPrice(Math.round(total() * 0.1) + Math.round(dynamicFee * 0.1))}</span>
          </div>
        </div>

        {/* Botón confirmar */}
        <button
          onClick={handleCreateOrder}
          disabled={loading || items.length === 0 || !profile?.address || !selectedType || !!coverageError}
          className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
          ) : isCod ? (
            <><Home className="w-4 h-4" /> Confirmar pedido ({paymentConfig[selectedType]?.label ?? selectedType})</>
          ) : (
            <><CreditCard className="w-4 h-4" /> Ir a pagar {formatPrice(grandTotal)}</>
          )}
        </button>

        {!profile?.address && (
          <p className="text-center text-xs text-amber-600 font-medium">
            ⚠️ Debes configurar tu dirección de entrega antes de continuar
          </p>
        )}
        {!isCod && selectedType && (
          <p className="text-center text-xs text-muted-foreground">🔒 Pago seguro procesado por Wompi</p>
        )}

      </PageTransition>

      {/* ── Modales de configuración ── */}
      {configuringType === 'nequi' && (
        <NequiModal
          saving={configSaving}
          onSave={data => handleConfigSave('nequi', data)}
          onClose={handleConfigClose}
        />
      )}
      {configuringType === 'daviplata' && (
        <DaviplataModal
          saving={configSaving}
          onSave={data => handleConfigSave('daviplata', data)}
          onClose={handleConfigClose}
        />
      )}
      {configuringType === 'pse' && (
        <PSEModal
          saving={configSaving}
          onSave={data => handleConfigSave('pse', data)}
          onClose={handleConfigClose}
        />
      )}
      {configError && configuringType && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-red-500 text-white text-sm font-medium px-4 py-3 text-center shadow-xl">
          {configError}
        </div>
      )}

    </ClientLayout>
  );
}

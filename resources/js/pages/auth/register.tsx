import { Head, router } from '@inertiajs/react';
import GoogleButton from '@/components/shared/GoogleButton';
import { useState, useCallback } from 'react';
import {
  Zap, User, Mail, Lock, Phone,
  Building, FileText, Car, Shield, ChevronRight,
  ChevronLeft, CheckCircle, CreditCard, Calendar, X
} from 'lucide-react';

type Role = 'client' | 'store' | 'driver' | null;

const roles = [
  { id: 'client', label: 'Cliente',       emoji: '🛒', desc: 'Quiero hacer pedidos a domicilio', gradient: 'from-blue-500 to-cyan-600',     shadow: 'shadow-blue-500/30'    },
  { id: 'store',  label: 'Comercio',      emoji: '🏪', desc: 'Quiero vender mis productos',       gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/30' },
  { id: 'driver', label: 'Domiciliario',  emoji: '🛵', desc: 'Quiero realizar entregas y ganar',  gradient: 'from-orange-500 to-amber-500',  shadow: 'shadow-orange-500/30'  },
];

// ─── Componentes FUERA del componente principal ───────────────────────────────

function Field({ label, field, type = 'text', placeholder, icon: Icon, required = false, optional = false, value, onChange, error }: {
  label: string; field: string; type?: string; placeholder: string;
  icon: any; required?: boolean; optional?: boolean;
  value: string; onChange: (field: string, val: string) => void; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-xs text-muted-foreground ml-1">(opcional)</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SectionHeader({ num, title, gradient }: { num: string; title: string; gradient: string }) {
  return (
    <div className={`rounded-xl bg-linear-to-r ${gradient} px-4 py-2.5 flex items-center gap-2`}>
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">{num}</div>
      <h3 className="font-semibold text-white text-sm">{title}</h3>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Register() {
  const [role, setRole] = useState<Role>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const chamberRef = { current: null as HTMLInputElement | null };
  const rutRef     = { current: null as HTMLInputElement | null };

  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', phone: '', cedula: '',
    document_type: 'CC', document_number: '', birth_date: '',
    accepted_terms: false, accepted_data_policy: false,
    merchant_type: 'natural', business_name: '', document_or_nit: '', legal_representative: '',
  });

  const u = useCallback((field: string, value: any) =>
    setForm(p => ({ ...p, [field]: value })), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
    data.append('role', role!);

    // Archivos de comercio
    const chamberInput = document.getElementById('chamber_of_commerce') as HTMLInputElement;
    const rutInput     = document.getElementById('rut_file') as HTMLInputElement;
    if (chamberInput?.files?.[0]) data.append('chamber_of_commerce', chamberInput.files[0]);
    if (rutInput?.files?.[0])     data.append('rut', rutInput.files[0]);

    router.post('/register', data, {
      onError:   errs => { setErrors(errs); setProcessing(false); },
      onSuccess: () => setProcessing(false),
    });
  };

  const F = (props: Omit<Parameters<typeof Field>[0], 'value' | 'onChange' | 'error'>) =>
    Field({
      ...props,
      value:    form[props.field as keyof typeof form] as string,
      onChange: u,
      error:    errors[props.field],
    });

  const btnGradient = role === 'client'
    ? 'from-blue-500 to-cyan-600'
    : role === 'store'
      ? 'from-emerald-500 to-teal-600'
      : 'from-orange-500 to-amber-500';

  return (
    <div className="min-h-screen bg-background flex">
      <Head title="Crear cuenta — OrFlash" />

      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex lg:w-2/5 bg-linear-to-br from-violet-600 via-purple-600 to-blue-700 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-15 -right-15 w-64 h-64 rounded-full bg-white/10" />
        <div className="relative z-10 text-center text-white space-y-6">
          <div className="w-full h-50 rounded-3xl bg-white flex items-center justify-center mx-auto shadow-2xl">
            <img src="/logo-png.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">OrFlash</h1>
            <p className="text-violet-200 text-lg mt-2">Plataforma de domicilios</p>
          </div>
          <div className="space-y-3 text-left max-w-xs">
            {[
              { emoji: '🛒', text: 'Clientes — Pide a domicilio fácil' },
              { emoji: '🏪', text: 'Comercios — Llega a más clientes' },
              { emoji: '🛵', text: 'Domiciliarios — Genera ingresos' },
              { emoji: '🔒', text: 'Cumplimiento Ley 1581 de 2012' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-3/5 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6 py-8">

          <div className="flex lg:hidden items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">OrFlash</span>
          </div>

          {/* Selección de rol */}
          {!role && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold">Crear cuenta 🎉</h2>
                <p className="text-muted-foreground mt-1">¿Cómo quieres usar OrFlash?</p>
              </div>
              <div className="space-y-3">
                {roles.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id as Role)}
                    className="w-full rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-lg transition-all group">
                    <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${r.gradient} flex items-center justify-center text-3xl shadow-lg ${r.shadow} shrink-0 group-hover:scale-110 transition-transform`}>
                      {r.emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-lg">{r.label}</p>
                      <p className="text-sm text-muted-foreground">{r.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">o regístrate con</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <GoogleButton />
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-violet-600 font-semibold">Inicia sesión</a>
              </p>
            </div>
          )}

          {/* Formulario */}
          {role && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setRole(null); setErrors({}); }}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">
                    {role === 'client' ? '🛒 Registro Cliente' : role === 'store' ? '🏪 Registro Comercio' : '🛵 Registro Domiciliario'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {role !== 'client' ? 'Tu cuenta será revisada antes de activarse (24-48h)' : 'Datos básicos — dirección y foto se configuran al ingresar'}
                  </p>
                </div>
              </div>

              {role !== 'client' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Requiere aprobación del administrador. Recibirás un correo cuando sea activada.</span>
                </div>
              )}

              {/* ═══ CLIENTE — fase 1: solo datos básicos ═══ */}
              {role === 'client' && (
                <>
                  <SectionHeader num="1" title="Datos básicos" gradient="from-blue-500 to-cyan-600" />
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-blue-700">
                    Al ingresar completarás tu dirección de entrega y foto de perfil.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">{F({label: 'Nombre completo', field: 'name', placeholder: 'Tu nombre completo', icon: User, required: true})}</div>
                    {F({label: 'Celular', field: 'phone', placeholder: '3001234567', icon: Phone, required: true})}
                    {F({label: 'Cédula',  field: 'cedula', placeholder: 'Opcional', icon: CreditCard, optional: true})}
                    <div className="sm:col-span-2">{F({label: 'Correo electrónico', field: 'email', type: 'email', placeholder: 'correo@ejemplo.com', icon: Mail, required: true})}</div>
                    {F({label: 'Contraseña',           field: 'password',              type: 'password', placeholder: 'Mín. 8 caracteres', icon: Lock, required: true})}
                    {F({label: 'Confirmar contraseña', field: 'password_confirmation', type: 'password', placeholder: 'Repite',             icon: Lock, required: true})}
                  </div>
                </>
              )}

              {/* ═══ DOMICILIARIO — fase 1: solo datos personales ═══ */}
              {role === 'driver' && (
                <>
                  <SectionHeader num="1" title="Datos personales" gradient="from-orange-500 to-amber-500" />
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-xs text-orange-700">
                    Al ingresar completarás tus fotos, dirección y datos del vehículo.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">{F({label: 'Nombre completo', field: 'name', placeholder: 'Tu nombre completo', icon: User, required: true})}</div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Tipo documento <span className="text-red-500">*</span></label>
                      <select value={form.document_type} onChange={e => u('document_type', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500">
                        <option value="CC">Cédula ciudadanía</option>
                        <option value="CE">Cédula extranjería</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                    </div>
                    {F({label: 'Número documento', field: 'document_number', placeholder: 'Tu número', icon: CreditCard, required: true})}
                    <div className="space-y-1.5">
                      {F({label: 'Fecha nacimiento', field: 'birth_date', type: 'date', placeholder: '', icon: Calendar, required: true})}
                      {errors.birth_date && <p className="text-xs text-red-500">{errors.birth_date}</p>}
                    </div>
                    {F({label: 'Celular', field: 'phone', placeholder: '3001234567', icon: Phone, required: true})}
                    <div className="sm:col-span-2">{F({label: 'Correo electrónico', field: 'email', type: 'email', placeholder: 'correo@ejemplo.com', icon: Mail, required: true})}</div>
                    {F({label: 'Contraseña',           field: 'password',              type: 'password', placeholder: 'Mín. 8 caracteres', icon: Lock, required: true})}
                    {F({label: 'Confirmar contraseña', field: 'password_confirmation', type: 'password', placeholder: 'Repite',            icon: Lock, required: true})}
                  </div>
                </>
              )}

              {/* ═══ COMERCIO ═══ */}
              {role === 'store' && (
                <>
                  <SectionHeader num="1" title="Tipo de registro" gradient="from-emerald-500 to-teal-600" />
                  <div className="grid grid-cols-2 gap-3">
                    {[{ id: 'natural', label: 'Persona natural', emoji: '👤' }, { id: 'empresa', label: 'Empresa', emoji: '🏢' }].map(t => (
                      <button key={t.id} type="button" onClick={() => u('merchant_type', t.id)}
                        className={`p-4 rounded-xl border text-center transition-all ${form.merchant_type === t.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-border hover:border-emerald-400'}`}>
                        <div className="text-2xl">{t.emoji}</div>
                        <div className="text-sm font-medium mt-1">{t.label}</div>
                      </button>
                    ))}
                  </div>

                  <SectionHeader num="2" title="Datos del merchant" gradient="from-emerald-500 to-teal-600" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      {F({label: form.merchant_type === 'empresa' ? 'Razón social' : 'Nombre completo', field: 'name', placeholder: 'Nombre o razón social', icon: User, required: true})}
                    </div>
                    {F({label: form.merchant_type === 'empresa' ? 'NIT' : 'Cédula', field: 'document_or_nit', placeholder: 'Ej: 900123456-1', icon: FileText, required: true})}
                    {form.merchant_type === 'empresa' && (
                      F({label: 'Representante legal', field: 'legal_representative', placeholder: 'Nombre del rep.', icon: User})
                    )}
                    {F({label: 'Celular', field: 'phone', placeholder: '3001234567', icon: Phone, required: true})}
                    <div className="sm:col-span-2">{F({label: 'Correo electrónico', field: 'email', type: 'email', placeholder: 'correo@ejemplo.com', icon: Mail, required: true})}</div>
                    {F({label: 'Contraseña',           field: 'password',              type: 'password', placeholder: 'Mín. 8 caracteres', icon: Lock, required: true})}
                    {F({label: 'Confirmar contraseña', field: 'password_confirmation', type: 'password', placeholder: 'Repite',            icon: Lock, required: true})}
                  </div>

                  <SectionHeader num="3" title="Documentos legales (opcionales)" gradient="from-emerald-500 to-teal-600" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex gap-1">Cámara de comercio <span className="text-xs text-muted-foreground">(opcional)</span></label>
                      <label className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 transition-all block">
                        <input id="chamber_of_commerce" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                        <Building className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Toca para subir</p>
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex gap-1">RUT <span className="text-xs text-muted-foreground">(opcional)</span></label>
                      <label className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 transition-all block">
                        <input id="rut_file" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                        <FileText className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Toca para subir</p>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700">
                    <p className="font-semibold mb-1">💡 Después del registro</p>
                    <p>Podrás crear y configurar tus tiendas con logo, banner, horarios, zona de cobertura y más.</p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                    <p className="text-sm font-semibold">Validaciones legales <span className="text-red-500">*</span></p>
                    {[
                      { field: 'accepted_terms',       label: 'Acepto el contrato comercial con OrFlash' },
                      { field: 'accepted_data_policy', label: 'Autorizo el tratamiento de datos personales (Ley 1581 de 2012)' },
                    ].map(item => (
                      <label key={item.field} className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={form[item.field as keyof typeof form] as boolean}
                          onChange={e => u(item.field, e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded accent-emerald-500" />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <button type="submit" disabled={processing}
                className={`w-full h-12 rounded-2xl bg-linear-to-r ${btnGradient} text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}>
                {processing ? 'Creando cuenta...' : (
                  <><CheckCircle className="w-5 h-5" />{role === 'client' ? 'Crear mi cuenta' : 'Enviar solicitud'}</>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-violet-600 font-semibold">Inicia sesión</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

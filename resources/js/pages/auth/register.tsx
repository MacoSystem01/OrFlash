import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Zap, User, Mail, Lock, Phone, CreditCard, MapPin, Building, FileText, Car, Shield, ChevronRight, ChevronLeft } from 'lucide-react';

type Role = 'client' | 'store' | 'driver' | null;

export default function Register() {
  const [role, setRole]       = useState<Role>(null);
  const [step, setStep]       = useState(1);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [form, setForm]       = useState({
    name: '', email: '', password: '', password_confirmation: '',
    phone: '', cedula: '', address: '',
    // Tienda
    nit: '', business_name: '', commercial_address: '', chamber_of_commerce: '',
    // Domiciliario
    license_number: '', vehicle_plate: '', arl: '', insurance: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const roles = [
    { id: 'client', label: 'Cliente',        emoji: '🛒', desc: 'Quiero hacer pedidos',              gradient: 'from-blue-500 to-cyan-600',     shadow: 'shadow-blue-500/30'    },
    { id: 'store',  label: 'Tienda',          emoji: '🏪', desc: 'Quiero vender mis productos',       gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/30' },
    { id: 'driver', label: 'Domiciliario',    emoji: '🛵', desc: 'Quiero hacer entregas',             gradient: 'from-orange-500 to-amber-500',  shadow: 'shadow-orange-500/30'  },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    router.post('/register', { ...form, role }, {
      onError: (errs) => { setErrors(errs); setProcessing(false); },
      onSuccess: () => setProcessing(false),
    });
  };

  const Field = ({ label, field, type = 'text', placeholder, icon: Icon }: any) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={type}
          value={form[field as keyof typeof form]}
          onChange={(e) => update(field, e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 h-12 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Head title="Crear cuenta — OrFlash" />

      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-700 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/10" />
        <div className="relative z-10 text-center text-white space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto backdrop-blur-sm shadow-2xl">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">OrFlash</h1>
            <p className="text-violet-200 text-lg mt-2">Únete a nuestra plataforma</p>
          </div>
          <div className="space-y-3 text-left max-w-xs">
            {[
              { emoji: '🛒', text: 'Clientes — Pide a domicilio fácil' },
              { emoji: '🏪', text: 'Tiendas — Llega a más clientes'    },
              { emoji: '🛵', text: 'Domiciliarios — Genera ingresos'   },
              { emoji: '🔒', text: 'Cumplimiento Ley 1581 de 2012'     },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6 py-8">

          {/* Logo móvil */}
          <div className="flex lg:hidden items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">OrFlash</span>
          </div>

          {/* Step 1 — Selección de rol */}
          {!role && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold">Crear cuenta 🎉</h2>
                <p className="text-muted-foreground mt-2">¿Cómo quieres usar OrFlash?</p>
              </div>
              <div className="space-y-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id as Role)}
                    className="w-full rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-lg transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-3xl shadow-lg ${r.shadow} flex-shrink-0 group-hover:scale-110 transition-transform`}>
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
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-violet-600 font-semibold hover:text-violet-700">Inicia sesión</a>
              </p>
            </div>
          )}

          {/* Step 2 — Formulario */}
          {role && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Header con rol seleccionado */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold">
                    {role === 'client' ? '🛒 Registro como Cliente' : role === 'store' ? '🏪 Registro como Tienda' : '🛵 Registro como Domiciliario'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {role === 'store' || role === 'driver' ? 'Tu cuenta será revisada antes de activarse' : 'Completa tus datos personales'}
                  </p>
                </div>
              </div>

              {/* Aviso aprobación */}
              {(role === 'store' || role === 'driver') && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Tu cuenta requiere aprobación del administrador (24-48 horas). Recibirás un correo cuando sea activada.</span>
                </div>
              )}

              {/* Sección: Datos personales */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center text-xs text-violet-600 font-bold">1</div>
                  Datos personales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre completo"  field="name"     placeholder="Tu nombre"          icon={User}       />
                  <Field label="Cédula de ciudadanía" field="cedula" placeholder="Ej: 1234567890"   icon={CreditCard} />
                  <Field label="Teléfono celular" field="phone"    placeholder="Ej: 3001234567"     icon={Phone}      />
                  <Field label="Dirección"        field="address"  placeholder="Calle 45 #12-30"    icon={MapPin}     />
                </div>
              </div>

              {/* Sección: Datos de tienda */}
              {role === 'store' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-600 font-bold">2</div>
                    Datos del negocio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="NIT"                    field="nit"                 placeholder="Ej: 900123456-1"    icon={FileText}  />
                    <Field label="Razón social"           field="business_name"       placeholder="Nombre del negocio" icon={Building}  />
                    <Field label="Dirección comercial"    field="commercial_address"  placeholder="Dirección tienda"   icon={MapPin}    />
                    <Field label="Cámara de comercio"     field="chamber_of_commerce" placeholder="No. registro"       icon={FileText}  />
                  </div>
                </div>
              )}

              {/* Sección: Datos domiciliario */}
              {role === 'driver' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center text-xs text-orange-600 font-bold">2</div>
                    Datos del vehículo y documentos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="No. licencia de conducción" field="license_number" placeholder="Ej: 12345678"       icon={CreditCard} />
                    <Field label="Placa del vehículo"         field="vehicle_plate"  placeholder="Ej: ABC123"         icon={Car}        />
                    <Field label="ARL (Administradora)"       field="arl"            placeholder="Ej: Positiva ARL"   icon={Shield}     />
                    <Field label="Seguro SOAT"                field="insurance"      placeholder="No. póliza SOAT"    icon={Shield}     />
                  </div>
                </div>
              )}

              {/* Sección: Credenciales */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${role === 'client' ? 'bg-violet-500/20 text-violet-600' : role === 'store' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-orange-500/20 text-orange-600'}`}>
                    {role === 'client' ? '2' : '3'}
                  </div>
                  Credenciales de acceso
                </h3>
                <Field label="Correo electrónico" field="email"                 placeholder="correo@ejemplo.com" icon={Mail} type="email"    />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full pl-10 pr-4 h-12 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Confirmar contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={form.password_confirmation}
                        onChange={(e) => update('password_confirmation', e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="w-full pl-10 pr-4 h-12 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Términos — Ley 1581 */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Autorización tratamiento de datos personales</p>
                <p>De conformidad con la <strong>Ley 1581 de 2012</strong> y el Decreto 1377 de 2013, autorizo a OrFlash para recolectar, almacenar y procesar mis datos personales con la finalidad de prestar los servicios de la plataforma. Puedes ejercer tus derechos de habeas data contactando a <strong>datos@orflash.com</strong>.</p>
              </div>

              {/* Botón submit */}
              <button
                type="submit"
                disabled={processing}
                className={`w-full h-12 rounded-xl text-white font-bold text-sm shadow-lg transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${
                  role === 'client' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 shadow-blue-500/30' :
                  role === 'store'  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30' :
                  'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30'
                }`}
              >
                {processing ? 'Creando cuenta...' : role === 'client' ? '✓ Crear mi cuenta' : '✓ Enviar solicitud'}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-violet-600 font-semibold hover:text-violet-700">Inicia sesión</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
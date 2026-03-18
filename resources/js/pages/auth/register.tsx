import { Head, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import {
  Zap, User, Mail, Lock, Phone, MapPin, Home,
  Building, FileText, Car, Shield, ChevronRight,
  ChevronLeft, Camera, Upload, CheckCircle,
  CreditCard, Calendar, X
} from 'lucide-react';

type Role = 'client' | 'store' | 'driver' | null;

const roles = [
  { id: 'client', label: 'Cliente', emoji: '🛒', desc: 'Quiero hacer pedidos a domicilio', gradient: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/30' },
  { id: 'store', label: 'Comercio', emoji: '🏪', desc: 'Quiero vender mis productos', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
  { id: 'driver', label: 'Domiciliario', emoji: '🛵', desc: 'Quiero realizar entregas y ganar', gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/30' },
];

const vehicleTypes = [
  { id: 'moto', label: 'Moto', emoji: '🛵' },
  { id: 'bicicleta', label: 'Bicicleta', emoji: '🚲' },
  { id: 'carro', label: 'Carro', emoji: '🚗' },
  { id: 'a_pie', label: 'A pie', emoji: '🚶' },
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

function FileUpload({ label, preview, inputRef, onChange, accept = 'image/*', optional = false }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label} {optional && <span className="text-xs text-muted-foreground">(opcional)</span>}
      </label>
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all">
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />
        {preview ? (
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            {typeof preview === 'string' && preview.startsWith('data:image')
              ? <img src={preview} className="w-16 h-16 object-cover rounded-lg mx-auto" alt="" />
              : <span className="text-sm font-medium truncate max-w-50">{preview}</span>}
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">Toca para subir</p>
          </div>
        )}
      </div>
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
  const [docPhotoPreview, setDocPhotoPreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [vehiclePhotoPreviews, setVehiclePhotoPreviews] = useState<string[]>([]);

  const docPhotoRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const vehiclePhotosRef = useRef<HTMLInputElement>(null);
  const soatRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);
  const chamberRef = useRef<HTMLInputElement>(null);
  const rutRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', phone: '',
    address: '', neighborhood: '', city: '', references: '', alternate_phone: '', cedula: '',
    document_type: 'CC', document_number: '', birth_date: '',
    vehicle_type: '', vehicle_brand: '', vehicle_model: '', vehicle_color: '', vehicle_plate: '',
    accepted_terms: false, accepted_data_policy: false, accepted_responsibility: false,
    merchant_type: 'natural', business_name: '', document_or_nit: '', legal_representative: '',
  });

  const u = useCallback((field: string, value: any) =>
    setForm(p => ({ ...p, [field]: value })), []);

  const handleFilePreview = (file: File, setter: (s: string) => void) => {
    const reader = new FileReader();
    reader.onload = e => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleVehiclePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setVehiclePhotoPreviews(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
    data.append('role', role!);
    if (docPhotoRef.current?.files?.[0]) data.append('document_photo', docPhotoRef.current.files[0]);
    if (selfieRef.current?.files?.[0]) data.append('selfie_photo', selfieRef.current.files[0]);
    if (profilePhotoRef.current?.files?.[0]) data.append('profile_photo', profilePhotoRef.current.files[0]);
    if (soatRef.current?.files?.[0]) data.append('soat', soatRef.current.files[0]);
    if (licenseRef.current?.files?.[0]) data.append('license', licenseRef.current.files[0]);
    if (chamberRef.current?.files?.[0]) data.append('chamber_of_commerce', chamberRef.current.files[0]);
    if (rutRef.current?.files?.[0]) data.append('rut', rutRef.current.files[0]);
    if (vehiclePhotosRef.current?.files)
      Array.from(vehiclePhotosRef.current.files).forEach(f => data.append('vehicle_photos[]', f));

    router.post('/register', data, {
      onError: errs => { setErrors(errs); setProcessing(false); },
      onSuccess: () => setProcessing(false),
    });
  };

  const F = (props: Omit<Parameters<typeof Field>[0], 'value' | 'onChange' | 'error'>) => (
    <Field
      {...props}
      value={form[props.field as keyof typeof form] as string}
      onChange={u}
      error={errors[props.field]}
    />
  );

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
            <img
              src="/logo-png.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
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
                    {role !== 'client' ? 'Tu cuenta será revisada antes de activarse (24-48h)' : 'Completa tus datos para empezar a pedir'}
                  </p>
                </div>
              </div>

              {role !== 'client' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Requiere aprobación del administrador. Recibirás un correo cuando sea activada.</span>
                </div>
              )}

              {/* ═══ CLIENTE ═══ */}
              {role === 'client' && (
                <>
                  <SectionHeader num="1" title="Datos básicos" gradient="from-blue-500 to-cyan-600" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><F label="Nombre completo" field="name" placeholder="Tu nombre completo" icon={User} required /></div>
                    <F label="Celular" field="phone" placeholder="3001234567" icon={Phone} required />
                    <F label="Cédula" field="cedula" placeholder="Opcional" icon={CreditCard} optional />
                    <div className="sm:col-span-2"><F label="Correo electrónico" field="email" type="email" placeholder="correo@ejemplo.com" icon={Mail} required /></div>
                    <F label="Contraseña" field="password" type="password" placeholder="Mín. 8 caracteres" icon={Lock} required />
                    <F label="Confirmar contraseña" field="password_confirmation" type="password" placeholder="Repite" icon={Lock} required />
                  </div>

                  <SectionHeader num="2" title="Datos de ubicación" gradient="from-blue-500 to-cyan-600" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><F label="Dirección exacta" field="address" placeholder="Calle 45 #12-30" icon={MapPin} required /></div>
                    <F label="Barrio" field="neighborhood" placeholder="Tu barrio" icon={Home} required />
                    <F label="Ciudad" field="city" placeholder="Tu ciudad" icon={Building} required />
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium flex items-center gap-1 mb-1.5">
                        Referencias <span className="text-xs text-muted-foreground">(opcional)</span>
                      </label>
                      <textarea value={form.references} onChange={e => u('references', e.target.value)}
                        placeholder="Ej: Casa verde, portón negro, torre 2 apto 301" rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500 resize-none" />
                    </div>
                    <F label="Número alterno" field="alternate_phone" placeholder="Opcional" icon={Phone} optional />
                  </div>

                  <SectionHeader num="3" title="Foto de perfil" gradient="from-blue-500 to-cyan-600" />
                  <FileUpload label="Foto de perfil" preview={profilePhotoPreview} inputRef={profilePhotoRef}
                    onChange={(e: any) => { const f = e.target.files?.[0]; if (f) handleFilePreview(f, setProfilePhotoPreview); }} optional />
                </>
              )}

              {/* ═══ DOMICILIARIO ═══ */}
              {role === 'driver' && (
                <>
                  <SectionHeader num="1" title="Datos personales" gradient="from-orange-500 to-amber-500" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><F label="Nombre completo" field="name" placeholder="Tu nombre completo" icon={User} required /></div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Tipo documento <span className="text-red-500">*</span></label>
                      <select value={form.document_type} onChange={e => u('document_type', e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500">
                        <option value="CC">Cédula ciudadanía</option>
                        <option value="CE">Cédula extranjería</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                    </div>
                    <F label="Número documento" field="document_number" placeholder="Tu número" icon={CreditCard} required />
                    <F label="Fecha nacimiento" field="birth_date" type="date" placeholder="" icon={Calendar} required />
                    <F label="Celular" field="phone" placeholder="3001234567" icon={Phone} required />
                    <div className="sm:col-span-2"><F label="Correo electrónico" field="email" type="email" placeholder="correo@ejemplo.com" icon={Mail} required /></div>
                    <F label="Contraseña" field="password" type="password" placeholder="Mín. 8 caracteres" icon={Lock} required />
                    <F label="Confirmar contraseña" field="password_confirmation" type="password" placeholder="Repite" icon={Lock} required />
                  </div>

                  <SectionHeader num="2" title="Fotos de validación" gradient="from-orange-500 to-amber-500" />
                  <div className="grid grid-cols-2 gap-3">
                    <FileUpload label="Foto del documento" preview={docPhotoPreview} inputRef={docPhotoRef}
                      onChange={(e: any) => { const f = e.target.files?.[0]; if (f) handleFilePreview(f, setDocPhotoPreview); }} />
                    <FileUpload label="Selfie biométrica" preview={selfiePreview} inputRef={selfieRef}
                      onChange={(e: any) => { const f = e.target.files?.[0]; if (f) handleFilePreview(f, setSelfiePreview); }} />
                  </div>

                  <SectionHeader num="3" title="Datos de residencia" gradient="from-orange-500 to-amber-500" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><F label="Dirección" field="address" placeholder="Tu dirección" icon={MapPin} required /></div>
                    <F label="Barrio" field="neighborhood" placeholder="Tu barrio" icon={Home} required />
                    <F label="Ciudad" field="city" placeholder="Tu ciudad" icon={Building} required />
                  </div>

                  <SectionHeader num="4" title="Datos del vehículo" gradient="from-orange-500 to-amber-500" />
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tipo de vehículo <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-4 gap-2">
                        {vehicleTypes.map(v => (
                          <button key={v.id} type="button" onClick={() => u('vehicle_type', v.id)}
                            className={`p-3 rounded-xl border text-center transition-all ${form.vehicle_type === v.id ? 'border-orange-500 bg-orange-500/10 text-orange-600' : 'border-border hover:border-orange-400'}`}>
                            <div className="text-2xl">{v.emoji}</div>
                            <div className="text-xs font-medium mt-1">{v.label}</div>
                          </button>
                        ))}
                      </div>
                      {errors.vehicle_type && <p className="text-xs text-red-500 mt-1">{errors.vehicle_type}</p>}
                    </div>

                    {form.vehicle_type && form.vehicle_type !== 'a_pie' && (
                      <div className="grid grid-cols-2 gap-3">
                        <F label="Marca" field="vehicle_brand" placeholder="Ej: Honda" icon={Car} />
                        <F label="Modelo" field="vehicle_model" placeholder="Ej: 2022" icon={Car} />
                        <F label="Color" field="vehicle_color" placeholder="Ej: Rojo" icon={Car} />
                        {form.vehicle_type !== 'bicicleta' && <F label="Placa" field="vehicle_plate" placeholder="Ej: ABC123" icon={Car} />}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div onClick={() => vehiclePhotosRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-3 text-center cursor-pointer hover:border-orange-500 transition-all">
                        <input ref={vehiclePhotosRef} type="file" accept="image/*" multiple onChange={handleVehiclePhotos} className="hidden" />
                        <Camera className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Fotos vehículo</p>
                      </div>
                      {form.vehicle_type !== 'bicicleta' && form.vehicle_type !== 'a_pie' && (
                        <>
                          <FileUpload label="SOAT vigente" preview={soatRef.current?.files?.[0]?.name || ''} inputRef={soatRef} onChange={() => { }} accept=".pdf,.jpg,.jpeg,.png" optional />
                          <FileUpload label="Licencia conducción" preview={licenseRef.current?.files?.[0]?.name || ''} inputRef={licenseRef} onChange={() => { }} accept=".pdf,.jpg,.jpeg,.png" optional />
                        </>
                      )}
                    </div>

                    {vehiclePhotoPreviews.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {vehiclePhotoPreviews.map((src, i) => (
                          <div key={i} className="relative">
                            <img src={src} className="w-16 h-16 object-cover rounded-lg border border-border" alt="" />
                            <button type="button" onClick={() => setVehiclePhotoPreviews(p => p.filter((_, j) => j !== i))}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                    <p className="text-sm font-semibold">Validaciones legales <span className="text-red-500">*</span></p>
                    {[
                      { field: 'accepted_terms', label: 'Acepto los términos y condiciones de OrFlash' },
                      { field: 'accepted_data_policy', label: 'Autorizo el tratamiento de mis datos personales (Ley 1581 de 2012)' },
                      { field: 'accepted_responsibility', label: 'Acepto la responsabilidad sobre los pedidos asignados' },
                    ].map(item => (
                      <label key={item.field} className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={form[item.field as keyof typeof form] as boolean}
                          onChange={e => u(item.field, e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded accent-orange-500" />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                    {(errors.accepted_terms || errors.accepted_data_policy || errors.accepted_responsibility) && (
                      <p className="text-xs text-red-500">Debes aceptar todos los términos para continuar</p>
                    )}
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
                      <F label={form.merchant_type === 'empresa' ? 'Razón social' : 'Nombre completo'} field="name" placeholder="Nombre o razón social" icon={User} required />
                    </div>
                    <F label={form.merchant_type === 'empresa' ? 'NIT' : 'Cédula'} field="document_or_nit" placeholder="Ej: 900123456-1" icon={FileText} required />
                    {form.merchant_type === 'empresa' && (
                      <F label="Representante legal" field="legal_representative" placeholder="Nombre del rep." icon={User} />
                    )}
                    <F label="Celular" field="phone" placeholder="3001234567" icon={Phone} required />
                    <div className="sm:col-span-2"><F label="Correo electrónico" field="email" type="email" placeholder="correo@ejemplo.com" icon={Mail} required /></div>
                    <F label="Contraseña" field="password" type="password" placeholder="Mín. 8 caracteres" icon={Lock} required />
                    <F label="Confirmar contraseña" field="password_confirmation" type="password" placeholder="Repite" icon={Lock} required />
                  </div>

                  <SectionHeader num="3" title="Documentos legales (opcionales)" gradient="from-emerald-500 to-teal-600" />
                  <div className="grid grid-cols-2 gap-3">
                    <FileUpload label="Cámara de comercio" preview={chamberRef.current?.files?.[0]?.name || ''} inputRef={chamberRef} onChange={() => { }} accept=".pdf,.jpg,.jpeg,.png" optional />
                    <FileUpload label="RUT" preview={rutRef.current?.files?.[0]?.name || ''} inputRef={rutRef} onChange={() => { }} accept=".pdf,.jpg,.jpeg,.png" optional />
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700">
                    <p className="font-semibold mb-1">💡 Después del registro</p>
                    <p>Podrás crear y configurar tus tiendas con logo, banner, horarios, zona de cobertura y más.</p>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                    <p className="text-sm font-semibold">Validaciones legales <span className="text-red-500">*</span></p>
                    {[
                      { field: 'accepted_terms', label: 'Acepto el contrato comercial con OrFlash' },
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

                  <div className="rounded-xl border border-border bg-secondary/20 p-4 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Autorización tratamiento de datos</p>
                    <p>De conformidad con la <strong>Ley 1581 de 2012</strong> y el Decreto 1377 de 2013, autorizo a OrFlash para recolectar, almacenar y procesar mis datos personales. Habeas data: <strong>datos@orflash.com</strong>.</p>
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
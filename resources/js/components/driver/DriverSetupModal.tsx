import { router } from '@inertiajs/react';
import {
  Camera, MapPin, Home, Building, Car, Upload,
  CheckCircle, ChevronRight, ChevronLeft, FileText, Shield
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

// ─── Tipos de vehículo ────────────────────────────────────────────────────────
const VEHICLE_TYPES = [
  { id: 'moto',      label: 'Moto',      emoji: '🛵' },
  { id: 'bicicleta', label: 'Bicicleta', emoji: '🚲' },
  { id: 'carro',     label: 'Carro',     emoji: '🚗' },
  { id: 'a_pie',     label: 'A pie',     emoji: '🚶' },
];

// ─── Componentes de formulario (nivel módulo para evitar re-mount) ────────────

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
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-background text-sm outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SingleFileUpload({ label, preview, inputRef, onChange, accept = 'image/*', required = false }: {
  label: React.ReactNode; preview: string; inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-all"
      >
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />
        {preview ? (
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            {preview.startsWith('data:image')
              ? <img src={preview} className="w-14 h-14 object-cover rounded-lg mx-auto" alt="" />
              : <span className="text-xs font-medium truncate max-w-32">{preview}</span>
            }
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="w-5 h-5 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">Toca para subir</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal principal (wizard 3 pasos) ────────────────────────────────────────

const STEPS = [
  { num: '2', title: 'Fotos de validación',  gradient: 'from-orange-500 to-amber-500' },
  { num: '3', title: 'Datos de residencia',  gradient: 'from-orange-500 to-amber-500' },
  { num: '4', title: 'Datos del vehículo',   gradient: 'from-orange-500 to-amber-500' },
];

export default function DriverSetupModal() {
  const [step, setStep]           = useState(0);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  // Fotos
  const [docPhotoPreview,  setDocPhotoPreview]  = useState('');
  const [selfiePreview,    setSelfiePreview]    = useState('');
  const [soatPreview,      setSoatPreview]      = useState('');
  const [licensePreview,   setLicensePreview]   = useState('');
  const [vehiclePreviews,  setVehiclePreviews]  = useState<string[]>([]);

  const docPhotoRef  = useRef<HTMLInputElement>(null);
  const selfieRef    = useRef<HTMLInputElement>(null);
  const soatRef      = useRef<HTMLInputElement>(null);
  const licenseRef   = useRef<HTMLInputElement>(null);
  const vehicleRef   = useRef<HTMLInputElement>(null);

  // Formulario
  const [form, setForm] = useState({
    address: '', neighborhood: '', city: '',
    vehicle_type: '', vehicle_brand: '', vehicle_color: '',
    vehicle_model: '', vehicle_plate: '',
    accepted_terms: false, accepted_data_policy: false, accepted_responsibility: false,
  });

  const u = useCallback((field: string, value: any) =>
    setForm(p => ({ ...p, [field]: value })), []);

  const needsMotorDocs = form.vehicle_type === 'moto' || form.vehicle_type === 'carro';

  // Helpers de preview
  const imgPreview = (file: File, setter: (s: string) => void) => {
    const r = new FileReader();
    r.onload = ev => setter(ev.target?.result as string);
    r.readAsDataURL(file);
  };
  const filePreview = (file: File, setter: (s: string) => void) => {
    setter(file.name);
  };

  const handleVehiclePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(f => {
      const r = new FileReader();
      r.onload = ev => setVehiclePreviews(p => [...p, ev.target?.result as string]);
      r.readAsDataURL(f);
    });
  };

  const F = (props: Omit<Parameters<typeof Field>[0], 'value' | 'onChange' | 'error'>) =>
    Field({ ...props, value: form[props.field as keyof typeof form] as string, onChange: u, error: errors[props.field] });

  // Validación por paso antes de avanzar
  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!docPhotoRef.current?.files?.[0])  e.document_photo = 'La foto del documento es obligatoria.';
      if (!selfieRef.current?.files?.[0])    e.selfie_photo   = 'La selfie biométrica es obligatoria.';
    }
    if (step === 1) {
      if (!form.address)      e.address      = 'La dirección es obligatoria.';
      if (!form.neighborhood) e.neighborhood = 'El barrio es obligatorio.';
      if (!form.city)         e.city         = 'La ciudad es obligatoria.';
    }
    if (step === 2) {
      if (!form.vehicle_type) e.vehicle_type = 'Selecciona un tipo de vehículo.';
      if (needsMotorDocs && !form.vehicle_plate) e.vehicle_plate = 'La placa es obligatoria.';
      if (needsMotorDocs && !soatRef.current?.files?.[0])    e.soat    = 'El SOAT es obligatorio.';
      if (needsMotorDocs && !licenseRef.current?.files?.[0]) e.license = 'La licencia es obligatoria.';
      if (!form.accepted_terms)          e.accepted_terms          = 'Debes aceptar los términos.';
      if (!form.accepted_data_policy)    e.accepted_data_policy    = 'Debes autorizar el tratamiento de datos.';
      if (!form.accepted_responsibility) e.accepted_responsibility = 'Debes aceptar la responsabilidad.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleSubmit = () => {
    if (!validateStep()) return;
    setProcessing(true);

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
    if (docPhotoRef.current?.files?.[0])  data.append('document_photo', docPhotoRef.current.files[0]);
    if (selfieRef.current?.files?.[0])    data.append('selfie_photo',   selfieRef.current.files[0]);
    if (soatRef.current?.files?.[0])      data.append('soat',           soatRef.current.files[0]);
    if (licenseRef.current?.files?.[0])   data.append('license',        licenseRef.current.files[0]);
    if (vehicleRef.current?.files) {
      Array.from(vehicleRef.current.files).forEach(f => data.append('vehicle_photos[]', f));
    }

    router.post('/driver/profile/complete-setup', data, {
      forceFormData: true,
      onError: errs => { setErrors(errs); setProcessing(false); },
      onSuccess: () => setProcessing(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95dvh] flex flex-col">

        {/* Header con indicador de pasos */}
        <div className="bg-linear-to-r from-orange-500 to-amber-500 px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Completa tu perfil</h2>
              <p className="text-orange-100 text-xs">Requerido para comenzar a recibir pedidos</p>
            </div>
          </div>
          {/* Indicador de pasos */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-white text-orange-600' :
                  i === step ? 'bg-white text-orange-600 ring-2 ring-white/50' :
                  'bg-white/20 text-white'
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-white font-semibold' : 'text-white/60'}`}>
                  {s.title}
                </span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/30" />}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── PASO 2: Fotos de validación ── */}
          {step === 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fotos de validación</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SingleFileUpload label="Foto del documento" preview={docPhotoPreview}
                    inputRef={docPhotoRef} onChange={e => { const f = e.target.files?.[0]; if (f) imgPreview(f, setDocPhotoPreview); }} required />
                  {errors.document_photo && <p className="text-xs text-red-500 mt-1">{errors.document_photo}</p>}
                </div>
                <div>
                  <SingleFileUpload label="Selfie biométrica" preview={selfiePreview}
                    inputRef={selfieRef} onChange={e => { const f = e.target.files?.[0]; if (f) imgPreview(f, setSelfiePreview); }} required />
                  {errors.selfie_photo && <p className="text-xs text-red-500 mt-1">{errors.selfie_photo}</p>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Las fotos se usan para validar tu identidad. Solo el equipo de OrFlash las verá.</p>
            </>
          )}

          {/* ── PASO 3: Datos de residencia ── */}
          {step === 1 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos de residencia</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  {F({ label: 'Dirección', field: 'address', placeholder: 'Tu dirección', icon: MapPin, required: true })}
                </div>
                {F({ label: 'Barrio', field: 'neighborhood', placeholder: 'Tu barrio', icon: Home, required: true })}
                {F({ label: 'Ciudad', field: 'city', placeholder: 'Tu ciudad', icon: Building, required: true })}
              </div>
            </>
          )}

          {/* ── PASO 4: Datos del vehículo ── */}
          {step === 2 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos del vehículo</p>

              {/* Tipo de vehículo */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tipo de vehículo <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {VEHICLE_TYPES.map(v => (
                    <button key={v.id} type="button" onClick={() => u('vehicle_type', v.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        form.vehicle_type === v.id
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                          : 'border-border hover:border-orange-400'
                      }`}>
                      <div className="text-2xl">{v.emoji}</div>
                      <div className="text-xs font-medium mt-1">{v.label}</div>
                    </button>
                  ))}
                </div>
                {errors.vehicle_type && <p className="text-xs text-red-500 mt-1">{errors.vehicle_type}</p>}
              </div>

              {/* Campos condicionales para vehículo con ruedas */}
              {form.vehicle_type && form.vehicle_type !== 'a_pie' && (
                <div className="grid grid-cols-2 gap-3">
                  {F({ label: 'Marca', field: 'vehicle_brand', placeholder: 'Ej: Honda', icon: Car })}
                  {F({ label: 'Color', field: 'vehicle_color', placeholder: 'Ej: Rojo',  icon: Car })}
                  {form.vehicle_type !== 'bicicleta' &&
                    F({ label: 'Modelo / Año', field: 'vehicle_model', placeholder: 'Ej: 2022', icon: Car })}
                  {needsMotorDocs && (
                    <div>
                      {F({ label: 'Placa', field: 'vehicle_plate', placeholder: 'Ej: ABC123', icon: Car, required: true })}
                      {errors.vehicle_plate && <p className="text-xs text-red-500 mt-1">{errors.vehicle_plate}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Fotos del vehículo */}
              {form.vehicle_type && form.vehicle_type !== 'a_pie' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Foto del vehículo{' '}
                    {needsMotorDocs
                      ? <span className="text-red-500">*</span>
                      : <span className="text-xs text-muted-foreground">(opcional)</span>}
                  </label>
                  <div onClick={() => vehicleRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-3 text-center cursor-pointer hover:border-orange-500 transition-all">
                    <input ref={vehicleRef} type="file" accept="image/*" multiple onChange={handleVehiclePhotos} className="hidden" />
                    <Camera className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Toca para subir fotos</p>
                  </div>
                  {vehiclePreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {vehiclePreviews.map((src, i) => (
                        <div key={i} className="relative">
                          <img src={src} className="w-14 h-14 object-cover rounded-lg border border-border" alt="" />
                          <button type="button" onClick={() => setVehiclePreviews(p => p.filter((_, j) => j !== i))}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SOAT y licencia — solo para moto/carro */}
              {needsMotorDocs && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <SingleFileUpload
                      label={<>SOAT vigente <span className="text-red-500">*</span></>}
                      preview={soatPreview}
                      inputRef={soatRef}
                      onChange={e => { const f = e.target.files?.[0]; if (f) filePreview(f, setSoatPreview); }}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {errors.soat && <p className="text-xs text-red-500 mt-1">{errors.soat}</p>}
                  </div>
                  <div>
                    <SingleFileUpload
                      label={<>Licencia de conducción <span className="text-red-500">*</span></>}
                      preview={licensePreview}
                      inputRef={licenseRef}
                      onChange={e => { const f = e.target.files?.[0]; if (f) filePreview(f, setLicensePreview); }}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {errors.license && <p className="text-xs text-red-500 mt-1">{errors.license}</p>}
                  </div>
                </div>
              )}

              {/* Términos y condiciones */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                <p className="text-sm font-semibold">Validaciones legales <span className="text-red-500">*</span></p>
                {[
                  { field: 'accepted_terms',          label: 'Acepto los términos y condiciones de OrFlash' },
                  { field: 'accepted_data_policy',    label: 'Autorizo el tratamiento de mis datos personales (Ley 1581 de 2012)' },
                  { field: 'accepted_responsibility', label: 'Acepto la responsabilidad sobre los pedidos asignados' },
                ].map(item => (
                  <label key={item.field} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[item.field as keyof typeof form] as boolean}
                      onChange={e => u(item.field, e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-orange-500"
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
                {(errors.accepted_terms || errors.accepted_data_policy || errors.accepted_responsibility) && (
                  <p className="text-xs text-red-500">Debes aceptar todos los términos para continuar.</p>
                )}
              </div>
            </>
          )}

        </div>

        {/* Navegación fija */}
        <div className="p-4 border-t border-border bg-background flex gap-3 shrink-0">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="h-12 px-5 rounded-2xl border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className="flex-1 h-12 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Enviando...
                </span>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Enviar solicitud</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

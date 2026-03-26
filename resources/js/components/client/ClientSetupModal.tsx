import { router } from '@inertiajs/react';
import { MapPin, Home, Building, Phone, Camera, Upload, CheckCircle } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

// ─── Componentes de formulario (a nivel módulo para evitar re-mount) ──────────

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
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-background text-sm outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export default function ClientSetupModal() {
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    address: '', neighborhood: '', city: '', references: '', alternate_phone: '',
  });

  const u = useCallback((field: string, value: string) =>
    setForm(p => ({ ...p, [field]: value })), []);

  const F = (props: Omit<Parameters<typeof Field>[0], 'value' | 'onChange' | 'error'>) =>
    Field({ ...props, value: form[props.field as keyof typeof form], onChange: u, error: errors[props.field] });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (photoRef.current?.files?.[0]) {
      data.append('profile_photo', photoRef.current.files[0]);
    }
    router.post('/client/profile/complete-setup', data, {
      forceFormData: true,
      onError: errs => { setErrors(errs); setProcessing(false); },
      onSuccess: () => setProcessing(false),
    });
  };

  return (
    /* Overlay — no se puede cerrar hasta completar el setup */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95dvh] flex flex-col">

        {/* Header */}
        <div className="bg-linear-to-r from-blue-500 to-cyan-600 px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">¡Un último paso!</h2>
              <p className="text-blue-100 text-xs">Configura tu dirección para recibir pedidos</p>
            </div>
          </div>
        </div>

        {/* Contenido scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* Datos de ubicación */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos de ubicación</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                {F({ label: 'Dirección exacta', field: 'address', placeholder: 'Calle 45 #12-30', icon: MapPin, required: true })}
              </div>
              {F({ label: 'Barrio', field: 'neighborhood', placeholder: 'Tu barrio', icon: Home, required: true })}
              {F({ label: 'Ciudad', field: 'city', placeholder: 'Tu ciudad', icon: Building, required: true })}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1">
                  Referencias <span className="text-xs text-muted-foreground">(opcional)</span>
                </label>
                <textarea
                  value={form.references}
                  onChange={e => u('references', e.target.value)}
                  placeholder="Ej: Casa verde, portón negro, torre 2 apto 301"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                {F({ label: 'Número alterno', field: 'alternate_phone', placeholder: '3001234567', icon: Phone, optional: true })}
              </div>
            </div>

            {/* Foto de perfil */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Foto de perfil</p>
              <label className="text-sm font-medium flex items-center gap-1">
                Foto de perfil <span className="text-xs text-muted-foreground">(opcional)</span>
              </label>
              <div
                onClick={() => photoRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all"
              >
                <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                {photoPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={photoPreview} className="w-20 h-20 object-cover rounded-full border-2 border-blue-500 mx-auto" alt="" />
                    <span className="text-xs text-blue-600 font-medium">Toca para cambiar</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Camera className="w-7 h-7 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">Toca para subir</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </form>

        {/* Botón fijo en la parte inferior */}
        <div className="p-4 border-t border-border bg-background shrink-0">
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={processing}
            className="w-full h-12 rounded-2xl bg-linear-to-r from-blue-500 to-cyan-600 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Guardando...
              </span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Empezar a pedir
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

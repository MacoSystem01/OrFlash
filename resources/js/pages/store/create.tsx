import { PageTransition } from '@/components/shared/Animations';
import { router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
  Building, FileText, MapPin, Phone, Clock,
  Camera, X, Upload, CheckCircle, Store, ChevronRight
} from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';

const categories = ['Abarrotes', 'Farmacia', 'Panadería', 'Carnicería', 'Verdulería', 'Electrónica', 'Restaurante', 'Licores', 'Mascotas', 'Otro'];
const zones      = ['Centro', 'Norte', 'Sur', 'Oriente', 'Occidente', 'Toda la ciudad'];
const allDays    = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ─── Campo genérico (fuera del componente para evitar re-montaje) ─────────────

function CreateField({
  label, field, value, onChange, type = 'text', placeholder, icon: Icon, required = false, error,
}: {
  label: string; field?: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon: any; required?: boolean; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function StoreCreate() {
  const { errors } = usePage().props as any;
  const [processing, setProcessing] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [chamberPreview, setChamberPreview] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chamberInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    business_name:  '',
    nit:            '',
    category:       '',
    zone:           '',
    description:    '',
    address:        '',
    phone:          '',
    attention_days: [] as string[],
    opening_time:   '08:00',
    closing_time:   '20:00',
  });

  const [imageFiles, setImageFiles]     = useState<File[]>([]);
  const [chamberFile, setChamberFile]   = useState<File | null>(null);

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      attention_days: prev.attention_days.includes(day)
        ? prev.attention_days.filter((d) => d !== day)
        : [...prev.attention_days, day],
    }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewImages((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChamber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChamberFile(file);
      setChamberPreview(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => data.append(`${key}[]`, v));
      } else {
        data.append(key, val);
      }
    });
    imageFiles.forEach((f) => data.append('images[]', f));
    if (chamberFile) data.append('chamber_of_commerce_file', chamberFile);

    router.post('/store/create', data, {
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <StoreLayout>
      <PageTransition className="space-y-6 max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Crear mi tienda</h1>
            <p className="text-muted-foreground text-sm">Completa la información de tu negocio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Sección 1 — Info básica */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-white" />
              <h2 className="font-semibold text-white text-sm">Información del negocio</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <CreateField label="Razón social" value={form.business_name} onChange={v => update('business_name', v)} placeholder="Nombre oficial del negocio" icon={Building} required error={errors?.business_name} />
              </div>
              <CreateField label="NIT (opcional)" value={form.nit}   onChange={v => update('nit', v)}   placeholder="Ej: 900123456-1"  icon={FileText} error={errors?.nit} />
              <CreateField label="Teléfono"       value={form.phone} onChange={v => update('phone', v)} placeholder="Ej: 3001234567"   icon={Phone}    error={errors?.phone} />
              <div className="sm:col-span-2">
                <CreateField label="Dirección" value={form.address} onChange={v => update('address', v)} placeholder="Calle 45 #12-30, Barrio..." icon={MapPin} required error={errors?.address} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Categoría <span className="text-red-500">*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500"
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                {errors?.category && <p className="text-xs text-red-500">{errors.category}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Zona de cobertura <span className="text-red-500">*</span></label>
                <select
                  value={form.zone}
                  onChange={(e) => update('zone', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500"
                >
                  <option value="">Seleccionar zona...</option>
                  {zones.map((z) => <option key={z}>{z}</option>)}
                </select>
                {errors?.zone && <p className="text-xs text-red-500">{errors.zone}</p>}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Descripción del negocio</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe brevemente tu negocio y los productos que ofreces..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 2 — Horarios */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              <h2 className="font-semibold text-white text-sm">Días y horarios de atención</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Días de atención <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {allDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.attention_days.includes(day)
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {errors?.attention_days && <p className="text-xs text-red-500 mt-1">{errors.attention_days}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Hora de apertura <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={form.opening_time}
                    onChange={(e) => update('opening_time', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Hora de cierre <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={form.closing_time}
                    onChange={(e) => update('closing_time', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3 — Documentos */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-white" />
              <h2 className="font-semibold text-white text-sm">Documentos (opcional)</h2>
            </div>
            <div className="p-5">
              <label className="text-sm font-medium mb-2 block">Cámara de comercio</label>
              <div
                onClick={() => chamberInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all"
              >
                <input ref={chamberInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChamber} className="hidden" />
                {chamberPreview ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{chamberPreview}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Haz clic para subir PDF, JPG o PNG</p>
                    <p className="text-xs text-muted-foreground">Máx. 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección 4 — Imágenes */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-white" />
              <h2 className="font-semibold text-white text-sm">Fotografías del negocio y productos</h2>
            </div>
            <div className="p-5 space-y-4">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all"
              >
                <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-sm">Haz clic para agregar fotos</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — Múltiples imágenes — Máx. 5MB c/u</p>
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {previewImages.map((src, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    <span className="text-2xl text-muted-foreground">+</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={processing}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? 'Guardando...' : (
              <>
                <CheckCircle className="w-5 h-5" />
                Crear mi tienda
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </PageTransition>
    </StoreLayout>
  );
}
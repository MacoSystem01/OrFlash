import { useForm, type InertiaFormProps } from '@inertiajs/react'
import { X, Store, Clock, MapPin, Phone, FileText, Image as ImageIcon } from 'lucide-react'
import { useRef } from 'react'

interface CreateStoreModalProps {
  open: boolean
  onClose: () => void
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function CreateStoreModal({ open, onClose }: CreateStoreModalProps) {

  const chamberRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<HTMLInputElement>(null)

  const { data, setData, post, processing, errors, reset } = useForm<{
    business_name: string
    nit: string
    category: string
    zone: string
    description: string
    address: string
    phone: string
    attention_days: string[]
    opening_time: string
    closing_time: string
    chamber_of_commerce_file: File | null
    images: File[]
  }>({
    business_name: '',
    nit: '',
    category: '',
    zone: '',
    description: '',
    address: '',
    phone: '',
    attention_days: [],
    opening_time: '',
    closing_time: '',
    chamber_of_commerce_file: null,
    images: [],
  })

  const toggleDay = (day: string) => {
    setData('attention_days',
      data.attention_days.includes(day)
        ? data.attention_days.filter(d => d !== day)
        : [...data.attention_days, day]
    )
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    post('/store', {
      forceFormData: true,
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold">Crear tienda</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <form onSubmit={submit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

          {/* Error global */}
          {(errors as any).error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {(errors as any).error}
            </div>
          )}

          {/* Nombre + NIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                Nombre del negocio <span className="text-red-500">*</span>
              </label>
              <input
                value={data.business_name}
                onChange={e => setData('business_name', e.target.value)}
                placeholder="Ej: Panadería El Trigal"
                className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
              />
              {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                NIT
              </label>
              <input
                value={data.nit}
                onChange={e => setData('nit', e.target.value)}
                placeholder="Ej: 900123456-1"
                className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
              />
              {errors.nit && <p className="text-red-500 text-xs mt-1">{errors.nit}</p>}
            </div>
          </div>

          {/* Categoría + Zona */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                value={data.category}
                onChange={e => setData('category', e.target.value)}
                className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
              >
                <option value="">Seleccionar...</option>
                <option value="Restaurante">Restaurante</option>
                <option value="Panadería">Panadería</option>
                <option value="Supermercado">Supermercado</option>
                <option value="Farmacia">Farmacia</option>
                <option value="Licores">Licores</option>
                <option value="Mascotas">Mascotas</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                Zona <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  value={data.zone}
                  onChange={e => setData('zone', e.target.value)}
                  placeholder="Ej: Norte, Centro..."
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                />
              </div>
              {errors.zone && <p className="text-red-500 text-xs mt-1">{errors.zone}</p>}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              value={data.address}
              onChange={e => setData('address', e.target.value)}
              placeholder="Calle 45 # 12-34, Barrio La Esperanza"
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Teléfono + Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  value={data.phone}
                  onChange={e => setData('phone', e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                Descripción
              </label>
              <textarea
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                placeholder="Breve descripción de tu tienda..."
                rows={2}
                className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none dark:bg-zinc-800"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Días de atención */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              Días de atención <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${data.attention_days.includes(day)
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.attention_days && <p className="text-red-500 text-xs mt-1">{errors.attention_days}</p>}
          </div>

          {/* Horario */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              <Clock className="w-4 h-4 inline mr-1 -mt-0.5" />
              Horario de atención <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-zinc-500 mb-1 block">Apertura</span>
                <input
                  type="time"
                  value={data.opening_time}
                  onChange={e => setData('opening_time', e.target.value)}
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                />
                {errors.opening_time && <p className="text-red-500 text-xs mt-1">{errors.opening_time}</p>}
              </div>
              <div>
                <span className="text-xs text-zinc-500 mb-1 block">Cierre</span>
                <input
                  type="time"
                  value={data.closing_time}
                  onChange={e => setData('closing_time', e.target.value)}
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                />
                {errors.closing_time && <p className="text-red-500 text-xs mt-1">{errors.closing_time}</p>}
              </div>
            </div>
          </div>

          {/* Archivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Cámara de comercio */}
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                <FileText className="w-4 h-4 inline mr-1 -mt-0.5" />
                Cámara de comercio
              </label>
              <input
                ref={chamberRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setData('chamber_of_commerce_file', e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => chamberRef.current?.click()}
                className="w-full border border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-3 text-sm text-zinc-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors text-left"
              >
                {data.chamber_of_commerce_file
                  ? (data.chamber_of_commerce_file as File).name
                  : 'Seleccionar archivo (PDF / imagen)'}
              </button>
              {errors.chamber_of_commerce_file && (
                <p className="text-red-500 text-xs mt-1">{errors.chamber_of_commerce_file}</p>
              )}
            </div>

            {/* Imágenes */}
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                <ImageIcon className="w-4 h-4 inline mr-1 -mt-0.5" />
                Imágenes de la tienda
              </label>
              <input
                ref={imagesRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                onChange={e => setData('images', e.target.files ? Array.from(e.target.files) : [])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imagesRef.current?.click()}
                className="w-full border border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-3 text-sm text-zinc-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors text-left"
              >
                {data.images.length > 0
                  ? `${data.images.length} imagen(es) seleccionada(s)`
                  : 'Seleccionar imágenes'}
              </button>
              {errors['images.0'] && (
                <p className="text-red-500 text-xs mt-1">{errors['images.0']}</p>
              )}
            </div>

          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            form="create-store-form"
            onClick={submit}
            disabled={processing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {processing ? 'Creando...' : 'Crear tienda'}
          </button>
        </div>

      </div>
    </div>
  )
}
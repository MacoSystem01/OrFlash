import { PageTransition } from '@/components/shared/Animations';
import AdminLayout from '@/layouts/AdminLayout';
import { router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
  Plus, Trash2, ToggleLeft, ToggleRight,
  Upload, X, ExternalLink, Image as ImageIcon,
  Check, AlertCircle,
} from 'lucide-react';

interface Carousel {
  id: number;
  image: string;
  redirect_url: string | null;
  is_active: boolean;
  order: number;
}

interface PageProps {
  carousels: Carousel[];
  flash?: { success?: string };
  [key: string]: unknown;
}

function CarouselModal({
  item,
  onClose,
}: {
  item: Carousel | null;
  onClose: () => void;
}) {
  const isEdit = !!item;
  const [preview, setPreview]     = useState(item ? `/storage/${item.image}` : '');
  const [redirectUrl, setRedirect] = useState(item?.redirect_url ?? '');
  const [order, setOrder]          = useState(String(item?.order ?? 0));
  const [isActive, setActive]      = useState(item?.is_active ?? true);
  const [saving, setSaving]        = useState(false);
  const [errors, setErrors]        = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    setSaving(true);
    const data = new FormData();
    if (fileRef.current?.files?.[0]) {
      data.append('image', fileRef.current.files[0]);
    }
    data.append('redirect_url', redirectUrl);
    data.append('order',        order);
    data.append('is_active',    isActive ? '1' : '0');

    const url = isEdit ? `/admin/carousels/${item!.id}` : '/admin/carousels';

    router.post(url, data as any, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => { setSaving(false); onClose(); },
      onError:   errs => { setErrors(errs); setSaving(false); },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{isEdit ? 'Editar slide' : 'Nuevo slide'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Imagen {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-violet-500 transition-colors"
              style={{ minHeight: 120 }}
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              {preview ? (
                <img src={preview} alt="" className="w-full h-40 object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                  <Upload className="w-6 h-6" />
                  <p className="text-xs">Toca para subir imagen</p>
                </div>
              )}
            </div>
            {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
          </div>

          {/* Redirect URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              URL de redirección <span className="text-muted-foreground">(opcional)</span>
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={redirectUrl}
                onChange={e => setRedirect(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
            {errors.redirect_url && <p className="text-xs text-red-500">{errors.redirect_url}</p>}
          </div>

          {/* Order */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Orden</label>
              <input
                type="number"
                min="0"
                value={order}
                onChange={e => setOrder(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activo</label>
              <button
                type="button"
                onClick={() => setActive(a => !a)}
                className={`relative inline-flex h-10 w-16 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCarousels() {
  const { carousels, flash } = usePage<PageProps>().props;
  const [modalItem, setModal] = useState<Carousel | null | 'new'>('new' as any);

  // Reset after mount
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Carousel | null>(null);

  const handleDelete = (id: number) => {
    if (!confirm('¿Eliminar esta imagen del carousel?')) return;
    router.delete(`/admin/carousels/${id}`, { preserveScroll: true });
  };

  const handleToggle = (id: number) => {
    router.patch(`/admin/carousels/${id}/toggle`, {}, { preserveScroll: true });
  };

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Carousel Principal</h1>
            <p className="text-muted-foreground text-sm">Gestiona las imágenes del carousel del home público</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Agregar slide
          </button>
        </div>

        {/* Flash */}
        {flash?.success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-600 font-medium">{flash.success}</p>
          </div>
        )}

        {/* Empty state */}
        {carousels.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4 text-muted-foreground">
            <ImageIcon className="w-12 h-12" />
            <p>No hay slides en el carousel todavía</p>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Agregar el primero
            </button>
          </div>
        )}

        {/* Grid */}
        {carousels.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {carousels.map(slide => (
              <div key={slide.id} className={`rounded-2xl border overflow-hidden ${slide.is_active ? 'border-border' : 'border-slate-300 opacity-60'}`}>
                <div className="relative h-40">
                  <img src={`/storage/${slide.image}`} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${slide.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-white'}`}>
                    {slide.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/50 text-white">
                    #{slide.order}
                  </span>
                </div>
                <div className="p-3 bg-card">
                  {slide.redirect_url && (
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      → {slide.redirect_url}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(slide); setShowModal(true); }}
                      className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggle(slide.id)}
                      className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                      title={slide.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {slide.is_active
                        ? <ToggleRight className="w-4 h-4 text-emerald-600" />
                        : <ToggleLeft className="w-4 h-4 text-slate-400" />
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-1.5 rounded-lg border border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </PageTransition>

      {showModal && (
        <CarouselModal
          item={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </AdminLayout>
  );
}

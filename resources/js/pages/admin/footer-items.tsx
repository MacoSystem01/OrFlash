import { PageTransition } from '@/components/shared/Animations';
import AdminLayout from '@/layouts/AdminLayout';
import { router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
  Plus, Trash2, ToggleLeft, ToggleRight,
  Upload, X, ExternalLink, Zap, Check, Pencil, AlertCircle,
} from 'lucide-react';

interface FooterItem {
  id: number;
  title: string;
  icon: string | null;
  redirect_url: string | null;
  is_active: boolean;
  order: number;
}

interface PageProps {
  items: FooterItem[];
  flash?: { success?: string };
  [key: string]: unknown;
}

function FooterItemModal({
  item,
  onClose,
}: {
  item: FooterItem | null;
  onClose: () => void;
}) {
  const isEdit = !!item;
  const [title,       setTitle]       = useState(item?.title ?? '');
  const [preview,     setPreview]     = useState(item?.icon ? `/storage/${item.icon}` : '');
  const [redirectUrl, setRedirect]    = useState(item?.redirect_url ?? '');
  const [order,       setOrder]       = useState(String(item?.order ?? 0));
  const [isActive,    setActive]      = useState(item?.is_active ?? true);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrors({ title: 'El título es obligatorio.' });
      return;
    }
    setSaving(true);
    setErrors({});

    const url = isEdit ? `/admin/footer-items/${item!.id}` : '/admin/footer-items';

    // Siempre usar FormData para tener control total sobre la serialización.
    // Boolean → '1'/'0', que Laravel acepta con la regla boolean.
    const data = new FormData();
    data.append('title',        title.trim());
    data.append('redirect_url', redirectUrl.trim());
    data.append('order',        String(parseInt(order, 10) || 0));
    data.append('is_active',    isActive ? '1' : '0');
    if (fileRef.current?.files?.[0]) {
      data.append('icon', fileRef.current.files[0]);
    }

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
          <h2 className="font-bold text-lg">{isEdit ? 'Editar ítem' : 'Nuevo ítem del footer'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Entrega Rápida"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Icon upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Icono / Imagen <span className="text-muted-foreground">(opcional)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-violet-500 transition-colors flex items-center gap-3"
            >
              <input ref={fileRef} type="file" accept="image/*,.svg" onChange={handleFile} className="hidden" />
              {preview ? (
                <img src={preview} alt="" className="w-14 h-14 object-contain rounded-xl border border-border" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">PNG, SVG, JPG, WebP, GIF — máx. 5 MB</p>
            </div>
            {errors.icon && <p className="text-xs text-red-500">{errors.icon}</p>}
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

          {/* Order + Active */}
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

          {/* Errores generales */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <ul className="text-xs text-red-600 space-y-0.5">
                {Object.values(errors).map((msg, i) => (
                  <li key={i}>{msg as string}</li>
                ))}
              </ul>
            </div>
          )}

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

export default function AdminFooterItems() {
  const { items, flash } = usePage<PageProps>().props;
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<FooterItem | null>(null);

  const handleDelete = (id: number) => {
    if (!confirm('¿Eliminar este ítem del footer?')) return;
    router.delete(`/admin/footer-items/${id}`, { preserveScroll: true });
  };

  const handleToggle = (id: number) => {
    router.patch(`/admin/footer-items/${id}/toggle`, {}, { preserveScroll: true });
  };

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Footer Mosaico</h1>
            <p className="text-muted-foreground text-sm">Íconos y tarjetas del footer del home público</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Agregar ítem
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
        {items.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4 text-muted-foreground">
            <Zap className="w-12 h-12" />
            <p>No hay ítems en el footer todavía</p>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Agregar el primero
            </button>
          </div>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map(item => (
              <div key={item.id} className={`rounded-2xl border bg-card overflow-hidden ${item.is_active ? 'border-border' : 'border-slate-300 opacity-60'}`}>
                <div className="p-4 flex flex-col items-center gap-2">
                  {item.icon ? (
                    <img src={`/storage/${item.icon}`} alt={item.title} className="w-12 h-12 object-contain rounded-xl" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-violet-500" />
                    </div>
                  )}
                  <p className="text-xs font-semibold text-center leading-tight">{item.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="border-t border-border p-2 flex gap-1 justify-center">
                  <button
                    onClick={() => { setEditing(item); setShowModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    title={item.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {item.is_active
                      ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                      : <ToggleLeft  className="w-3.5 h-3.5 text-slate-400" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </PageTransition>

      {showModal && (
        <FooterItemModal
          item={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </AdminLayout>
  );
}

import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Package, TrendingUp, ShoppingBag,
  ToggleLeft, ToggleRight, Pencil, Trash2,
  X, Upload, CheckCircle, AlertCircle, Search,
} from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import { router, usePage } from '@inertiajs/react';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  store_id: number;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  is_available: boolean;
  images: string[] | null;
}

interface Store {
  id: number;
  business_name: string;
}

interface PageProps {
  store: Store;
  stores: Store[];
  products: Product[];
  [key: string]: unknown;
}

type ToastType = 'success' | 'error';

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDone }: { message: string; type: ToastType; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
      animate-in slide-in-from-bottom-4 fade-in duration-300
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
    >
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertCircle  className="w-4 h-4 shrink-0" />
      }
      {message}
    </div>
  );
}

// ─── Modal crear / editar producto ───────────────────────────────────────────

function ProductModal({
  storeId,
  product,
  onClose,
}: {
  storeId: number;
  product: Product | null;
  onClose: () => void;
}) {
  const isEdit = !!product;

  const [form, setForm] = useState({
    name:         product?.name         ?? '',
    description:  product?.description  ?? '',
    category:     product?.category     ?? '',
    price:        product?.price        != null ? String(product.price) : '',
    stock:        product?.stock        != null ? String(product.stock) : '',
    is_available: product?.is_available ?? true,
  });

  const [processing, setProcessing] = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const imageRef = useRef<HTMLInputElement>(null);
  // For edits, seed previews with existing images from storage
  const [previews, setPreviews] = useState<string[]>(
    product?.images?.map(img => `/storage/${img}`) ?? []
  );
  // Track which existing image paths to keep (those not removed by user)
  const [keptImages, setKeptImages] = useState<string[]>(
    product?.images ?? []
  );

  const u = (field: string, value: unknown) =>
    setForm(p => ({ ...p, [field]: value }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setProcessing(true);

    const data = new FormData();
    data.append('name',         form.name);
    data.append('description',  form.description);
    data.append('category',     form.category);
    data.append('price',        form.price);
    data.append('stock',        form.stock === '' ? '0' : form.stock);
    // Laravel boolean rule sólo acepta '1' y '0', no 'true'/'false'
    data.append('is_available', form.is_available ? '1' : '0');

    // When editing, pass which existing image paths to retain
    if (isEdit) {
      keptImages.forEach(p => data.append('keep_images[]', p));
    }

    // Only append newly-selected files (those with blob: URLs)
    const newFilePreviews = previews.filter(p => !p.startsWith('/storage/'));
    if (imageRef.current?.files && newFilePreviews.length > 0) {
      Array.from(imageRef.current.files).forEach(f => data.append('images[]', f));
    }

    const url = isEdit
      ? `/store/${storeId}/products/${product!.id}`
      : `/store/${storeId}/products`;

    const method = isEdit ? 'put' : 'post';

    router[method](url, data as any, {
      forceFormData: true,
      onSuccess: () => { setProcessing(false); onClose(); },
      onError:   errs => { setErrors(errs); setProcessing(false); },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => u('name', e.target.value)}
              placeholder="Ej: Arroz Diana 1kg"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Categoría <span className="text-red-500">*</span>
            </label>
            <input
              value={form.category}
              onChange={e => u('category', e.target.value)}
              placeholder="Ej: Granos, Lácteos, Bebidas..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            />
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Precio (COP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="100"
                value={form.price}
                onChange={e => u('price', e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={e => u('stock', e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              />
              {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Descripción <span className="text-xs text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => u('description', e.target.value)}
              placeholder="Describe tu producto..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-colors resize-none"
            />
          </div>

          {/* Disponible */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Disponible para venta</label>
            <button
              type="button"
              onClick={() => u('is_available', !form.is_available)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.is_available ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.is_available ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Imágenes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Imágenes <span className="text-xs text-muted-foreground">(opcional)</span>
            </label>
            <div
              onClick={() => imageRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all"
            >
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Toca para subir imágenes</p>
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="w-16 h-16 object-cover rounded-xl border border-border" alt="" />
                    <button
                      type="button"
                      onClick={() => {
                        const removed = previews[i];
                        setPreviews(p => p.filter((_, j) => j !== i));
                        // If it was a storage image, remove from kept list
                        if (removed.startsWith('/storage/')) {
                          const path = removed.replace('/storage/', '');
                          setKeptImages(k => k.filter(k => k !== path));
                        }
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear producto'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function StoreProducts() {
  const { store, products } = usePage<PageProps>().props;

  const [search,      setSearch]    = useState('');
  const [modalOpen,   setModalOpen] = useState(false);
  const [editProduct, setEdit]      = useState<Product | null>(null);
  const [toast,       setToast]     = useState<{ message: string; type: ToastType } | null>(null);
  const [processing,  setProcessing]= useState(false);

  const inStock  = products.filter(p => p.is_available).length;
  const outStock = products.filter(p => !p.is_available).length;
  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = useCallback((product: Product) => {
    setProcessing(true);
    router.patch(
      `/store/${store.id}/products/${product.id}/toggle`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setToast({
            message: `"${product.name}" ${product.is_available ? 'marcado como agotado' : 'marcado como disponible'}.`,
            type: 'success',
          });
          setProcessing(false);
        },
        onError: () => {
          setToast({ message: 'Error al cambiar el estado.', type: 'error' });
          setProcessing(false);
        },
      }
    );
  }, [store.id]);

  const handleDelete = useCallback((product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;

    router.delete(`/store/${store.id}/products/${product.id}`, {
      preserveScroll: true,
      onSuccess: () => setToast({ message: `"${product.name}" eliminado.`, type: 'success' }),
      onError:   () => setToast({ message: 'Error al eliminar el producto.', type: 'error' }),
    });
  }, [store.id]);

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Catálogo</h1>
            <p className="text-muted-foreground text-sm">{products.length} productos registrados</p>
          </div>
          <button
            onClick={() => { setEdit(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30"
          >
            <Plus className="w-4 h-4" /> Agregar producto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total productos', value: products.length, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40', icon: Package     },
            { label: 'Disponibles',     value: inStock,         gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40',icon: TrendingUp  },
            { label: 'Agotados',        value: outStock,        gradient: 'from-red-500 to-rose-600',      shadow: 'shadow-red-500/40',    icon: ShoppingBag },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-5 bg-linear-to-br ${s.gradient} text-white shadow-xl ${s.shadow}`}>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-white/75 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto o categoría..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        {/* Sin productos */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center">
              <Package className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin productos aún</h2>
            <p className="text-sm text-muted-foreground">Agrega tu primer producto para empezar a vender</p>
            <button
              onClick={() => { setEdit(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-violet-500/30"
            >
              <Plus className="w-4 h-4" /> Agregar producto
            </button>
          </div>
        )}

        {/* Productos por categoría */}
        {categories.map(cat => {
          const catProducts = filtered.filter(p => p.category === cat);
          if (catProducts.length === 0) return null;

          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-6 rounded-full bg-linear-to-b from-violet-500 to-purple-600" />
                <h2 className="font-bold">{cat}</h2>
                <span className="text-xs text-muted-foreground">({catProducts.length})</span>
              </div>

              <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {catProducts.map(p => (
                  <StaggerItem key={p.id}>
                    <div className={`rounded-2xl border overflow-hidden transition-all ${
                      p.is_available
                        ? 'border-border bg-card'
                        : 'border-red-500/20 bg-red-500/5'
                    }`}>
                      <div className="p-4 flex items-center gap-4">

                        {/* Imagen o placeholder */}
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.images?.[0] ? (
                            <img
                              src={`/storage/${p.images[0]}`}
                              className="w-full h-full object-cover"
                              alt={p.name}
                            />
                          ) : (
                            <Package className="w-6 h-6 text-violet-500" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">Stock: {p.stock} unidades</p>
                          <p className="text-base font-bold text-violet-600 mt-0.5">{formatPrice(p.price)}</p>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-1 shrink-0">

                          {/* Editar */}
                          <button
                            onClick={() => { setEdit(p); setModalOpen(true); }}
                            title="Editar"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Toggle disponibilidad */}
                          <button
                            onClick={() => handleToggle(p)}
                            disabled={processing}
                            title={p.is_available ? 'Marcar agotado' : 'Marcar disponible'}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                              p.is_available
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                          >
                            {p.is_available
                              ? <ToggleRight className="w-5 h-5" />
                              : <ToggleLeft  className="w-5 h-5" />
                            }
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleDelete(p)}
                            title="Eliminar"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </div>

                      {/* Barra de estado */}
                      <div className={`h-1 w-full ${
                        p.is_available
                          ? 'bg-linear-to-r from-violet-500 to-purple-600'
                          : 'bg-linear-to-r from-red-400 to-rose-500'
                      }`} />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            </div>
          );
        })}

      </PageTransition>

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          storeId={store.id}
          product={editProduct}
          onClose={() => { setModalOpen(false); setEdit(null); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}

    </StoreLayout>
  );
}
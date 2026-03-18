import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { useState } from 'react';
import { Plus, Package, TrendingUp, ShoppingBag, ToggleLeft, ToggleRight } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';

const initialProducts = [
  { id: 'p1', name: 'Arroz Diana 1kg',    category: 'Granos',   price: 4500,  inStock: true,  image: '🌾' },
  { id: 'p2', name: 'Aceite Girasol 1L',  category: 'Aceites',  price: 8900,  inStock: true,  image: '🫙' },
  { id: 'p3', name: 'Leche Entera 1L',    category: 'Lácteos',  price: 3800,  inStock: true,  image: '🥛' },
  { id: 'p4', name: 'Huevos x12',         category: 'Básicos',  price: 7200,  inStock: true,  image: '🥚' },
  { id: 'p5', name: 'Azúcar 1kg',         category: 'Básicos',  price: 3200,  inStock: false, image: '🧂' },
  { id: 'p6', name: 'Café Sello Rojo 500g',category: 'Bebidas', price: 12500, inStock: true,  image: '☕' },
  { id: 'p7', name: 'Pasta x500g',        category: 'Granos',   price: 2800,  inStock: true,  image: '🍝' },
  { id: 'p8', name: 'Atún en lata',       category: 'Enlatados',price: 4100,  inStock: false, image: '🐟' },
];

const categoryColors: Record<string, string> = {
  'Granos':    'from-amber-500 to-orange-500',
  'Aceites':   'from-yellow-500 to-amber-500',
  'Lácteos':   'from-blue-400 to-cyan-500',
  'Básicos':   'from-violet-500 to-purple-600',
  'Bebidas':   'from-emerald-500 to-teal-600',
  'Enlatados': 'from-slate-500 to-slate-600',
};

export default function StoreProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');

  const toggleStock = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const inStock  = products.filter((p) => p.inStock).length;
  const outStock = products.filter((p) => !p.inStock).length;
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Catálogo</h1>
            <p className="text-muted-foreground text-sm">{products.length} productos registrados</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30">
            <Plus className="w-4 h-4" /> Agregar producto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total productos', value: products.length, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40', icon: Package     },
            { label: 'En stock',        value: inStock,         gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40',icon: TrendingUp  },
            { label: 'Agotados',        value: outStock,        gradient: 'from-red-500 to-rose-600',      shadow: 'shadow-red-500/40',    icon: ShoppingBag },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 bg-linear-to-br ${s.gradient} text-white shadow-xl ${s.shadow}`}>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-white/75 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm">
          <Package className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto o categoría..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        {/* Products by category */}
        {categories.map((cat) => {
          const catProducts = filtered.filter((p) => p.category === cat);
          if (catProducts.length === 0) return null;
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-6 rounded-full bg-linear-to-b ${categoryColors[cat] ?? 'from-slate-400 to-slate-500'}`} />
                <h2 className="font-bold">{cat}</h2>
                <span className="text-xs text-muted-foreground">({catProducts.length})</span>
              </div>
              <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {catProducts.map((p) => (
                  <StaggerItem key={p.id}>
                    <div className={`rounded-2xl border overflow-hidden transition-all ${p.inStock ? 'border-border bg-card' : 'border-red-500/20 bg-red-500/5'}`}>
                      <div className="p-4 flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${categoryColors[cat] ?? 'from-slate-400 to-slate-500'} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                          {p.image}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.category}</p>
                          <p className="text-base font-bold text-violet-600 mt-1">${p.price.toLocaleString()}</p>
                        </div>

                        {/* Toggle stock */}
                        <button
                          onClick={() => toggleStock(p.id)}
                          className="flex flex-col items-center gap-1"
                        >
                          {p.inStock ? (
                            <ToggleRight className="w-8 h-8 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-red-400" />
                          )}
                          <span className={`text-xs font-semibold ${p.inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                            {p.inStock ? 'En stock' : 'Agotado'}
                          </span>
                        </button>
                      </div>

                      {/* Bottom bar */}
                      <div className={`h-1 w-full bg-linear-to-r ${p.inStock ? (categoryColors[cat] ?? 'from-slate-400 to-slate-500') : 'from-red-400 to-rose-500'}`} />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center">
              <Package className="w-10 h-10 text-violet-500" />
            </div>
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        )}

      </PageTransition>
    </StoreLayout>
  );
}
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { MapPin, Star, TrendingUp, Search, Filter } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useState } from 'react';

const stores = [
  { id: '1', name: 'Tienda Central',   category: 'Abarrotes',  address: 'Calle 1 #2-3',   rating: 4.8, isOpen: true,  orders: 142 },
  { id: '2', name: 'Farmacia Salud',   category: 'Farmacia',   address: 'Calle 5 #6-7',   rating: 4.5, isOpen: true,  orders: 98  },
  { id: '3', name: 'Pan y Café',       category: 'Panadería',  address: 'Calle 9 #10-11', rating: 4.2, isOpen: false, orders: 76  },
  { id: '4', name: 'Carnes del Sur',   category: 'Carnicería', address: 'Calle 12 #3-4',  rating: 4.6, isOpen: true,  orders: 115 },
  { id: '5', name: 'Verduras Frescas', category: 'Verdulería', address: 'Calle 15 #8-9',  rating: 4.3, isOpen: false, orders: 63  },
];

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-600',
];

type FilterType = 'all' | 'open' | 'closed';

export default function AdminStores() {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<FilterType>('all');

  const open   = stores.filter(s => s.isOpen).length;
  const closed = stores.filter(s => !s.isOpen).length;

  const filtered = stores.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
                     || s.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all'
                     || (filter === 'open'   &&  s.isOpen)
                     || (filter === 'closed' && !s.isOpen);
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tiendas</h1>
            <p className="text-muted-foreground text-sm">{stores.length} tiendas en el sistema</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              {open} abiertas
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white shadow-lg shadow-red-500/30">
              {closed} cerradas
            </span>
          </div>
        </div>

        {/* Buscador + Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(['all', 'open', 'closed'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  filter === f
                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/30'
                    : 'bg-card text-muted-foreground border-border hover:border-violet-400'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'open' ? 'Abiertas' : 'Cerradas'}
              </button>
            ))}
          </div>
        </div>

        {/* Contador de resultados */}
        {filtered.length !== stores.length && (
          <p className="text-xs text-muted-foreground">
            Mostrando <strong>{filtered.length}</strong> de {stores.length} tiendas
          </p>
        )}

        {/* Mosaico */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Search className="w-7 h-7 text-violet-400" />
            </div>
            <p className="font-medium">Sin resultados</p>
            <p className="text-xs">Intenta con otro nombre o categoría</p>
          </div>
        ) : (
          <StaggerList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {filtered.map((store, i) => (
              <StaggerItem key={store.id}>
                <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">

                  {/* Banner + Avatar */}
                  <div className={`h-14 bg-gradient-to-r ${gradients[i % gradients.length]} relative`}>
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                    {/* Badge estado */}
                    <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      store.isOpen
                        ? 'bg-white/25 text-white'
                        : 'bg-black/25 text-white/80'
                    }`}>
                      {store.isOpen ? '● Abierta' : '● Cerrada'}
                    </span>
                    {/* Avatar */}
                    <div className={`absolute -bottom-4 left-3 w-8 h-8 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-card group-hover:scale-110 transition-transform`}>
                      {store.name.charAt(0)}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="pt-6 px-3 pb-3">
                    <h3 className="font-semibold text-sm leading-tight truncate">{store.name}</h3>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{store.category}</p>

                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {store.rating}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        {store.orders}
                      </span>
                    </div>
                  </div>

                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        )}

      </PageTransition>
    </AdminLayout>
  );
}
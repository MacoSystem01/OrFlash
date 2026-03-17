import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Store, MapPin, Star, TrendingUp } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

const stores = [
  { id: '1', name: 'Tienda Central',  category: 'Abarrotes', address: 'Calle 1 #2-3',  rating: 4.8, isOpen: true,  orders: 142 },
  { id: '2', name: 'Farmacia Salud',  category: 'Farmacia',  address: 'Calle 5 #6-7',  rating: 4.5, isOpen: true,  orders: 98  },
  { id: '3', name: 'Pan y Café',      category: 'Panadería', address: 'Calle 9 #10-11', rating: 4.2, isOpen: false, orders: 76  },
  { id: '4', name: 'Carnes del Sur',  category: 'Carnicería',address: 'Calle 12 #3-4',  rating: 4.6, isOpen: true,  orders: 115 },
  { id: '5', name: 'Verduras Frescas',category: 'Verdulería',address: 'Calle 15 #8-9',  rating: 4.3, isOpen: false, orders: 63  },
];

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-600',
];

export default function AdminStores() {
  const open  = stores.filter((s) => s.isOpen).length;
  const closed = stores.filter((s) => !s.isOpen).length;

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

        {/* Cards */}
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stores.map((store, i) => (
            <StaggerItem key={store.id}>
              <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                {/* Banner */}
                <div className={`h-16 bg-gradient-to-r ${gradients[i % gradients.length]} relative`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className={`absolute -bottom-5 left-5 w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-card`}>
                    {store.name.charAt(0)}
                  </div>
                </div>

                <div className="pt-8 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{store.name}</h3>
                      <p className="text-xs text-muted-foreground">{store.category}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${store.isOpen ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-600'}`}>
                      {store.isOpen ? 'Abierta' : 'Cerrada'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{store.address}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500" /> {store.rating}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" /> {store.orders} pedidos
                    </span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </PageTransition>
    </AdminLayout>
  );
}
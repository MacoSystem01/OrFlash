import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Link, usePage } from '@inertiajs/react';
import { Plus, Store, Star, MapPin, Clock, TrendingUp, ChevronRight } from 'lucide-react';

const gradients = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-cyan-600',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-600',
];

export default function StoreIndex() {
  const { stores, auth } = usePage().props as any;

  const totalRevenue = 0;
  const totalOrders  = 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold">OrFlash</span>
              <span className="text-muted-foreground text-sm ml-2">— Mis tiendas</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{auth?.user?.name}</span>
            <Link
              href="/store/create"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4" /> Nueva tienda
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <PageTransition className="space-y-8">

          {/* Bienvenida */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-500/30 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10">
              <h1 className="text-2xl font-bold">Hola, {auth?.user?.name} 👋</h1>
              <p className="text-emerald-100 mt-1">Gestiona todos tus comercios desde aquí</p>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-3xl font-bold">{stores?.length ?? 0}</p>
                  <p className="text-emerald-200 text-sm">Tiendas activas</p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-3xl font-bold">{totalOrders}</p>
                  <p className="text-emerald-200 text-sm">Pedidos totales</p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
                  <p className="text-emerald-200 text-sm">Ingresos totales</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de tiendas */}
          {stores?.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-5">
              <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                <Store className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">Aún no tienes tiendas</h2>
                <p className="text-muted-foreground text-sm mt-1">Crea tu primera tienda para empezar a vender</p>
              </div>
              <Link
                href="/store/create"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30"
              >
                <Plus className="w-5 h-5" /> Crear mi primera tienda
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Mis tiendas ({stores.length})</h2>
              </div>
              <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store: any, i: number) => (
                  <StaggerItem key={store.id}>
                    <Link href={`/store/${store.id}/dashboard`}>
                      <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                        {/* Banner */}
                        <div className={`h-20 bg-gradient-to-r ${gradients[i % gradients.length]} relative flex items-center justify-center`}>
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                          <Store className="w-10 h-10 text-white/80 relative z-10 group-hover:scale-110 transition-transform" />
                          <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${store.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {store.status === 'active' ? 'Activa' : 'Pendiente'}
                          </span>
                        </div>

                        <div className="p-4">
                          <h3 className="font-bold text-base">{store.business_name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{store.category}</p>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{store.zone}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{store.opening_time} - {store.closing_time}</span>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                <Star className="w-3 h-3 fill-amber-500" /> {store.rating || '—'}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-600">
                                <TrendingUp className="w-3 h-3" /> $0
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}

                {/* Card agregar tienda */}
                <StaggerItem>
                  <Link href="/store/create">
                    <div className="rounded-2xl border-2 border-dashed border-border bg-card hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer h-full min-h-[200px] flex flex-col items-center justify-center gap-3 p-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                        <Plus className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="font-semibold text-sm text-muted-foreground group-hover:text-emerald-600 transition-colors">Agregar otra tienda</p>
                    </div>
                  </Link>
                </StaggerItem>
              </StaggerList>
            </>
          )}
        </PageTransition>
      </div>
    </div>
  );
}
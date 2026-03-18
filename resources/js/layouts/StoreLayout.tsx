import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, ShoppingBag, Clock, ToggleLeft, User, Store, ChevronDown, Plus, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '@/app/layouts/DashboardLayout';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const { store, stores } = usePage().props as any;
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  // Si no hay tienda activa, usar layout simple
  if (!store) {
    return <>{children}</>;
  }

  const storeId = store.id;

  const navItems = [
    { label: 'Dashboard',  path: `/store/${storeId}/dashboard`,       icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Productos',  path: `/store/${storeId}/products`,        icon: <ShoppingBag className="w-4 h-4" />    },
    { label: 'Pedidos',    path: `/store/${storeId}/orders`,          icon: <Package className="w-4 h-4" />        },
    { label: 'Historial',  path: `/store/${storeId}/history`,         icon: <Clock className="w-4 h-4" />          },
    { label: 'Estado',     path: `/store/${storeId}/business-status`, icon: <ToggleLeft className="w-4 h-4" />     },
    { label: 'Perfil',     path: `/store/${storeId}/profile`,         icon: <User className="w-4 h-4" />           },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card fixed h-full z-30">

        {/* Selector de tienda */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => setShowStoreMenu(!showStoreMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors relative"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold truncate">{store.business_name}</p>
              <p className="text-xs text-muted-foreground">{store.category} · {store.zone}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showStoreMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown tiendas */}
          {showStoreMenu && (
            <div className="mt-2 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
              <div className="p-2 space-y-1">
                {stores?.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/store/${s.id}/dashboard`}
                    onClick={() => setShowStoreMenu(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      s.id === store.id ? 'bg-emerald-500/10 text-emerald-600 font-medium' : 'hover:bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span className="truncate">{s.business_name}</span>
                  </Link>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <Link
                  href="/store/create"
                  onClick={() => setShowStoreMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-600 hover:bg-emerald-500/10 transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar tienda
                </Link>
                <Link
                  href="/store"
                  onClick={() => setShowStoreMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Ver todas mis tiendas
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                currentPath === item.path
                  ? 'bg-emerald-500/15 text-emerald-600 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/store"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-2 py-1.5"
          >
            <Store className="w-4 h-4" /> Todas mis tiendas
          </Link>
          <button
            onClick={() => router.post('/logout')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-2 py-1.5"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-emerald-600 font-medium">{store.business_name}</span>
            <span>/</span>
            <span className="text-foreground font-medium capitalize">
              {currentPath.split('/').pop()?.replace('-', ' ')}
            </span>
          </div>
          <div className="ml-auto">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${store.is_open ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-500/15 text-slate-500'}`}>
              {store.is_open ? '● Abierta' : '○ Cerrada'}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
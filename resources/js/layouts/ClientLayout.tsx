import { Link, router, usePage } from '@inertiajs/react';
import { Home, Package, ShoppingCart, User, LogOut } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const navItems = [
    { label: 'Inicio',  path: '/client/home',    icon: Home },
    { label: 'Pedidos', path: '/client/orders',  icon: Package },
    { label: 'Carrito', path: '/client/cart',    icon: ShoppingCart },
    { label: 'Perfil',  path: '/client/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
        <img src="/logo-png.png" alt="OrFlash" className="h-8 w-auto" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <button onClick={() => router.post('/logout')} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/90 backdrop-blur-xl">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link key={path} href={path}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${currentPath === path ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
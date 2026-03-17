import { ReactNode, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  accentColor?: string;
}

const DashboardLayout = ({ children, navItems, title, accentColor = 'bg-primary' }: DashboardLayoutProps) => {
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const breadcrumb = currentPath.split('/').filter(Boolean);

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card fixed h-full z-30">
        <div className="p-6 border-b border-border">
          <h2 className="font-bold text-lg">OrFlash</h2>
          <p className="text-xs text-muted-foreground mt-1">{title}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                currentPath === item.path
                  ? `${accentColor} text-foreground font-medium`
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => router.post('/logout')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">OrFlash</h2>
                  <p className="text-xs text-muted-foreground">{title}</p>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      currentPath === item.path
                        ? `${accentColor} text-foreground font-medium`
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => router.post('/logout')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-foreground font-medium capitalize' : 'capitalize'}>
                  {crumb.replace('-', ' ')}
                </span>
              </span>
            ))}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
import { LayoutDashboard, Users, Store, Truck, Package, BarChart3, Settings } from 'lucide-react';
import DashboardLayout from '@/app/layouts/DashboardLayout';

const navItems = [
  { label: 'Dashboard',     path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Usuarios',      path: '/admin/users',     icon: <Users className="w-4 h-4" /> },
  { label: 'Tiendas',       path: '/admin/stores',    icon: <Store className="w-4 h-4" /> },
  { label: 'Domiciliarios', path: '/admin/drivers',   icon: <Truck className="w-4 h-4" /> },
  { label: 'Pedidos',       path: '/admin/orders',    icon: <Package className="w-4 h-4" /> },
  { label: 'Analíticas',    path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Configuración', path: '/admin/settings',  icon: <Settings className="w-4 h-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Panel Administrativo" accentColor="bg-primary/20">
      {children}
    </DashboardLayout>
  );
}
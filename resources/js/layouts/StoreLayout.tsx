import { LayoutDashboard, Package, ShoppingBag, Clock, ToggleLeft, User } from 'lucide-react';
import DashboardLayout from '@/app/layouts/DashboardLayout';

const navItems = [
  { label: 'Dashboard', path: '/store/dashboard',       icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Productos',  path: '/store/products',        icon: <ShoppingBag className="w-4 h-4" /> },
  { label: 'Pedidos',    path: '/store/orders',          icon: <Package className="w-4 h-4" /> },
  { label: 'Historial',  path: '/store/history',         icon: <Clock className="w-4 h-4" /> },
  { label: 'Estado',     path: '/store/business-status', icon: <ToggleLeft className="w-4 h-4" /> },
  { label: 'Perfil',     path: '/store/profile',         icon: <User className="w-4 h-4" /> },
];

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Terminal de Tienda" accentColor="bg-accent/20">
      {children}
    </DashboardLayout>
  );
}
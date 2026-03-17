import { LayoutDashboard, Package, MapPin, Clock, User } from 'lucide-react';
import DashboardLayout from '@/app/layouts/DashboardLayout';

const navItems = [
  { label: 'Dashboard',     path: '/driver/dashboard',        icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Disponibles',   path: '/driver/available-orders', icon: <Package className="w-4 h-4" /> },
  { label: 'Pedido actual', path: '/driver/current-order',    icon: <MapPin className="w-4 h-4" /> },
  { label: 'Historial',     path: '/driver/history',          icon: <Clock className="w-4 h-4" /> },
  { label: 'Perfil',        path: '/driver/profile',          icon: <User className="w-4 h-4" /> },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Panel Domiciliario" accentColor="bg-warning/20">
      {children}
    </DashboardLayout>
  );
}
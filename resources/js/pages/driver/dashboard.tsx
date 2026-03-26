import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Power, DollarSign, Package, Clock, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import DriverLayout from '@/layouts/DriverLayout';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DriverStats {
  earnings_today: number;
  deliveries_today: number;
  active_minutes: number;
}

interface PageProps {
  driverStats?: DriverStats;
  [key: string]: unknown;
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DriverDashboard() {
  useAutoRefresh();
  const { driverStats } = usePage<PageProps>().props;
  const [isOnline, setIsOnline] = useState(false);

  const metrics = [
    {
      label: 'Ganancias hoy',
      value: `$${(driverStats?.earnings_today ?? 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/40',
    },
    {
      label: 'Entregas hoy',
      value: driverStats?.deliveries_today ?? 0,
      icon: Package,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/40',
    },
    {
      label: 'Tiempo activo',
      value: driverStats?.active_minutes
        ? `${Math.floor(driverStats.active_minutes / 60)}h`
        : '0h',
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/40',
    },
  ];

  return (
    <DriverLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Panel del domiciliario</p>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
              isOnline
                ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                : 'bg-secondary text-muted-foreground shadow-none'
            }`}
          >
            <Power className="w-4 h-4" />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Banner estado */}
        {isOnline && (
          <div className="rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 p-4 text-white shadow-xl shadow-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Estás disponible</p>
              <p className="text-emerald-100 text-xs">Buscando pedidos cercanos...</p>
            </div>
            <div className="ml-auto w-3 h-3 rounded-full bg-white animate-pulse" />
          </div>
        )}

        {/* Métricas */}
        <StaggerList className="grid grid-cols-3 gap-4">
          {metrics.map((m) => (
            <StaggerItem key={m.label}>
              <div className={`rounded-2xl p-4 bg-linear-to-br ${m.gradient} text-white shadow-xl ${m.shadow}`}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                  <m.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold">{m.value}</p>
                <p className="text-xs text-white/75 mt-0.5">{m.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Mapa */}
        <div className="rounded-2xl border border-border overflow-hidden h-52 relative bg-secondary/30">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
          {isOnline && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500/30" />
            </>
          )}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
          <div className="absolute bottom-3 left-3 bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-violet-500" />
            {isOnline ? 'Buscando pedidos...' : 'Estás offline'}
          </div>
        </div>

      </PageTransition>
    </DriverLayout>
  );
}
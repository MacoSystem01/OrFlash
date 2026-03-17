import { PageTransition } from '@/components/shared/Animations';
import { Check, Package, Truck, MapPin } from 'lucide-react';
import DriverLayout from '@/layouts/DriverLayout';

const steps = [
  { label: 'Recogido en tienda', icon: Package },
  { label: 'En tránsito',        icon: Truck   },
  { label: 'Entregado',          icon: MapPin  },
];

export default function DriverCurrentOrder() {
  const hasOrder = false; // Luego vendrá de Laravel

  if (!hasOrder) {
    return (
      <DriverLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Truck className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">Sin pedido activo</h2>
            <p className="text-muted-foreground text-sm mt-1">Acepta un pedido para comenzar</p>
          </div>
        </PageTransition>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <PageTransition className="space-y-6 p-4">
        <h1 className="text-2xl font-bold">Pedido actual</h1>

        {/* Mapa simulado */}
        <div className="rounded-2xl border border-border overflow-hidden h-48 relative bg-secondary/30">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
          <div className="absolute bottom-3 left-3 bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-500" /> En camino...
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${i === 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40' : 'bg-secondary'}`}>
                  <step.icon className={`w-4 h-4 ${i === 0 ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                {i < steps.length - 1 && <div className={`w-0.5 h-6 mt-1 ${i === 0 ? 'bg-emerald-500' : 'bg-border'}`} />}
              </div>
              <div className="pt-2">
                <p className={`text-sm font-medium ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                {i === 0 && <p className="text-xs text-emerald-600 font-medium">Paso actual</p>}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2">
          <Check className="w-5 h-5" /> Confirmar siguiente paso
        </button>
      </PageTransition>
    </DriverLayout>
  );
}
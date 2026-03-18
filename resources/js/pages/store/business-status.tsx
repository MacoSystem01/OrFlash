import { PageTransition } from '@/components/shared/Animations';
import { useState } from 'react';
import { Power, Clock, ShoppingBag, TrendingUp, CheckCircle } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';

export default function StoreBusinessStatus() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Estado del negocio</h1>
          <p className="text-muted-foreground text-sm">Controla la disponibilidad de tu tienda</p>
        </div>

        {/* Estado principal */}
        <div className={`rounded-2xl p-8 text-center transition-all duration-500 ${
          isOpen
            ? 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30'
            : 'bg-linear-to-br from-slate-500 to-slate-600 shadow-xl shadow-slate-500/30'
        }`}>
          <div className="text-6xl mb-4">{isOpen ? '🟢' : '🔴'}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isOpen ? 'Tienda Abierta' : 'Tienda Cerrada'}
          </h2>
          <p className="text-white/75 text-sm mb-6">
            {isOpen ? 'Estás recibiendo pedidos activamente' : 'No recibirás nuevos pedidos'}
          </p>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 mx-auto ${
              isOpen
                ? 'bg-white text-red-600 hover:bg-red-50 shadow-white/30'
                : 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-white/30'
            }`}
          >
            <Power className="w-4 h-4" />
            {isOpen ? 'Cerrar tienda' : 'Abrir tienda'}
          </button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Horario de apertura', value: '8:00 AM',  icon: Clock,       gradient: 'from-blue-500 to-cyan-600',     shadow: 'shadow-blue-500/40'   },
            { label: 'Pedidos de hoy',      value: '0',        icon: ShoppingBag, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40' },
            { label: 'Tiempo promedio',     value: '— min',    icon: TrendingUp,  gradient: 'from-amber-500 to-orange-500',  shadow: 'shadow-amber-500/40'  },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl p-5 bg-linear-to-br ${card.gradient} text-white shadow-xl ${card.shadow}`}>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-white/75 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4">Lista de verificación</h3>
          <div className="space-y-3">
            {[
              { label: 'Productos actualizados',    done: true  },
              { label: 'Horarios configurados',     done: true  },
              { label: 'Método de pago activo',     done: false },
              { label: 'Zona de entrega definida',  done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500/15' : 'bg-secondary'}`}>
                  <CheckCircle className={`w-4 h-4 ${item.done ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </PageTransition>
    </StoreLayout>
  );
}
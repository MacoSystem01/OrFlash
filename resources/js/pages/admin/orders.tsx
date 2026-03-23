import { PageTransition, CardHover } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
type FilterType  = OrderStatus | 'all';

const statuses: FilterType[] = [
  'all', 'pending', 'confirmed', 'preparing', 'ready',
  'picked_up', 'in_transit', 'delivered', 'cancelled',
];

const statusLabels: Record<FilterType, string> = {
  all:         'Todos',
  pending:     'Pendiente',
  confirmed:   'Confirmado',
  preparing:   'Preparando',
  ready:       'Listo',
  picked_up:   'Recogido',
  in_transit:  'En camino',
  delivered:   'Entregado',
  cancelled:   'Cancelado',
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const { orders } = usePage().props as any;
  const [filter, setFilter] = useState<FilterType>('all');

  const orderList: any[] = orders?.data ?? (Array.isArray(orders) ? orders : []);
  const filtered = filter === 'all'
    ? orderList
    : orderList.filter(o => o.status === filter);

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground text-sm">{orderList.length} pedidos en el sistema</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === s
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <CardHover className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">ID</th>
                <th className="pb-3 font-medium text-muted-foreground">Cliente</th>
                <th className="pb-3 font-medium text-muted-foreground">Tienda</th>
                <th className="pb-3 font-medium text-muted-foreground">Items</th>
                <th className="pb-3 font-medium text-muted-foreground">Total</th>
                <th className="pb-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    No hay pedidos aún
                  </td>
                </tr>
              ) : (
                filtered.map((o: any) => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 text-xs font-mono">#{String(o.id).padStart(8, '0')}</td>
                    <td className="py-3">{o.client?.name ?? o.user?.name ?? '—'}</td>
                    <td className="py-3 text-muted-foreground">{o.store?.business_name ?? o.store?.name ?? '—'}</td>
                    <td className="py-3">{o.items?.length ?? 0}</td>
                    <td className="py-3 font-semibold">${o.total?.toLocaleString() ?? 0}</td>
                    <td className="py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardHover>

      </PageTransition>
    </AdminLayout>
  );
}
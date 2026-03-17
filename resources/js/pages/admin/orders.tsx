import { PageTransition, CardHover } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useState } from 'react';
import type { OrderStatus } from '@/mock/data';
import AdminLayout from '@/layouts/AdminLayout';

const statuses: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const orders: any[] = []; // Luego vendrán de Laravel

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">No hay pedidos aún</td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 text-xs">{o.id}</td>
                  <td className="py-3">{o.clientName}</td>
                  <td className="py-3 text-muted-foreground">{o.storeName}</td>
                  <td className="py-3">{o.items.length}</td>
                  <td className="py-3">${o.total.toLocaleString()}</td>
                  <td className="py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardHover>
      </PageTransition>
    </AdminLayout>
  );
}
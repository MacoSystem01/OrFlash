import { useState } from 'react';
import { PageTransition } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FileText, Search, X, TrendingUp, ShoppingBag } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import { router, usePage } from '@inertiajs/react';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string;
  quantity: number;
  subtotal: number;
  product?: { category: string };
}

interface Order {
  id: number;
  status: string;
  payment_method: string | null;
  total: number;
  store_earnings: number;
  created_at: string;
  client?: { name: string };
  items: OrderItem[];
}

interface Summary {
  total_orders: number;
  total_revenue: number;
}

interface Filters {
  order_id?: string;
  date_from?: string;
  date_to?: string;
  client_name?: string;
  product_category?: string;
}

interface Store { id: number; business_name: string; }

interface PageProps {
  store: Store;
  stores: Store[];
  orders: Order[];
  categories: string[];
  summary: Summary;
  filters: Filters;
  [key: string]: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const paymentLabel: Record<string, string> = {
  contra_entrega: 'Contra Entrega',
  cash:           'Efectivo',
  nequi:          'Nequi',
  daviplata:      'Daviplata',
  pse:            'PSE',
  CARD:           'Tarjeta',
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function StoreReport() {
  const { store, orders = [], categories = [], summary, filters = {} } = usePage<PageProps>().props;

  const [form, setForm] = useState<Filters>({
    order_id:         filters.order_id         ?? '',
    date_from:        filters.date_from        ?? '',
    date_to:          filters.date_to          ?? '',
    client_name:      filters.client_name      ?? '',
    product_category: filters.product_category ?? '',
  });

  const hasFilters = Object.values(form).some(v => v !== '');

  const handleSearch = () => {
    const params: Record<string, string> = {};
    Object.entries(form).forEach(([k, v]) => { if (v) params[k] = v; });
    router.get(`/store/${store.id}/report`, params, { preserveScroll: true });
  };

  const handleClear = () => {
    setForm({ order_id: '', date_from: '', date_to: '', client_name: '', product_category: '' });
    router.get(`/store/${store.id}/report`, {}, { preserveScroll: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reporte de pedidos</h1>
            <p className="text-muted-foreground text-sm">Filtra y analiza el historial de tu tienda</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold">Filtros</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">

            {/* ID de pedido */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">ID de pedido</label>
              <input
                type="number"
                min="1"
                placeholder="Ej: 12"
                value={form.order_id}
                onChange={e => setForm(f => ({ ...f, order_id: e.target.value }))}
                onKeyDown={handleKeyDown}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            {/* Fecha desde */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Fecha desde</label>
              <input
                type="date"
                value={form.date_from}
                onChange={e => setForm(f => ({ ...f, date_from: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            {/* Fecha hasta */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Fecha hasta</label>
              <input
                type="date"
                value={form.date_to}
                onChange={e => setForm(f => ({ ...f, date_to: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            {/* Cliente */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Cliente</label>
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={form.client_name}
                onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                onKeyDown={handleKeyDown}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            {/* Tipo de producto */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Tipo de producto</label>
              <select
                value={form.product_category}
                onChange={e => setForm(f => ({ ...f, product_category: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/30"
            >
              <Search className="w-4 h-4" /> Buscar
            </button>
            {hasFilters && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.total_orders}</p>
              <p className="text-xs text-muted-foreground">Pedidos encontrados</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPrice(summary.total_revenue)}</p>
              <p className="text-xs text-muted-foreground">Ingresos (entregados)</p>
            </div>
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-violet-500" />
              </div>
              <p className="text-sm font-medium">Sin resultados</p>
              <p className="text-xs opacity-60">Ajusta los filtros para encontrar pedidos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/30">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Productos</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Pago</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('es-CO', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        #{String(order.id).padStart(8, '0')}
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {order.client?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-48">
                        <div className="space-y-0.5">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span>{item.product_name} ×{item.quantity}</span>
                              {item.product?.category && (
                                <span className="px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 text-[10px] font-medium">
                                  {item.product.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {order.payment_method ? (paymentLabel[order.payment_method] ?? order.payment_method) : '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-violet-600 whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </PageTransition>
    </StoreLayout>
  );
}

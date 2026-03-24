import { PageTransition } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Clock, Package, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import { usePage } from '@inertiajs/react';
import { formatPrice } from '@/lib/format';

interface OrderItem {
  product_name: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  total: number;
  store_earnings: number;
  client?: { name: string };
  items: OrderItem[];
  created_at: string;
}

interface PageProps {
  store: { id: number; business_name: string };
  stores: { id: number; business_name: string }[];
  orders: Order[];
  totalRevenue: number;
  [key: string]: unknown;
}

export default function StoreHistory() {
  const { orders = [], totalRevenue = 0 } = usePage<PageProps>().props;

  const delivered = orders.filter(o => o.status === 'delivered').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Historial</h1>
          <p className="text-muted-foreground text-sm">Pedidos completados y cancelados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Entregados', value: delivered,                gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40', icon: CheckCircle },
            { label: 'Cancelados', value: cancelled,                gradient: 'from-red-500 to-rose-600',      shadow: 'shadow-red-500/40',    icon: XCircle     },
            { label: 'Ingresos',   value: formatPrice(totalRevenue), gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40', icon: DollarSign  },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 bg-linear-to-br ${s.gradient} text-white shadow-xl ${s.shadow}`}>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-white/75 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lista */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">Sin historial aún</h2>
            <p className="text-sm text-muted-foreground">Los pedidos completados aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">
                    #{String(o.id).padStart(8, '0')}
                  </span>
                  <p className="font-semibold text-sm mt-0.5">{o.client?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Package className="w-3 h-3" />
                    {o.items?.length ?? 0} items ·
                    <span className="font-semibold text-violet-600">{formatPrice(o.total)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(o.created_at).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <StatusBadge status={o.status as any} />
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    </StoreLayout>
  );
}

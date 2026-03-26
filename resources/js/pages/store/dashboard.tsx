import { useState } from 'react';
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Package, DollarSign, Clock, TrendingUp, CheckCircle, Plus, ArrowRight, AlertTriangle, X, XCircle } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { formatPrice } from '@/lib/format';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  payment_method: string | null;
  payment_status: string | null;
  total: number;
  client?: { name: string };
  items: OrderItem[];
}

interface Store {
  id: number;
  business_name: string;
  is_open: boolean;
  opening_time: string;
  closing_time: string;
}

interface PageProps {
  store: Store;
  stores: Store[];
  activeOrders: Order[];
  todayRevenue: number;
  todayDelivered: number;
  [key: string]: unknown;
}

// ─── Modal Contra Entrega ─────────────────────────────────────────────────────

const ONLINE_METHODS = ['nequi', 'daviplata', 'pse'];

const paymentMethodLabel: Record<string, string> = {
  contra_entrega: 'Contra Entrega',
  cash:           'Efectivo',
  nequi:          'Nequi',
  daviplata:      'Daviplata',
  pse:            'PSE',
  NEQUI:          'Nequi',
  DAVIPLATA:      'Daviplata',
  PSE:            'PSE',
  CARD:           'Tarjeta',
};

function CodModal({
  order,
  storeId,
  onClose,
}: {
  order:   Order;
  storeId: number;
  onClose: () => void;
}) {
  const [accepted,  setAccepted]  = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const handleAccept = () => {
    setAdvancing(true);
    router.patch(`/store/${storeId}/orders/${order.id}/advance`, {}, {
      preserveScroll: true,
      onFinish: () => { setAdvancing(false); onClose(); },
    });
  };

  const handleReject = () => {
    setRejecting(true);
    router.post(`/store/${storeId}/orders/${order.id}/reject-cod`, {}, {
      preserveScroll: true,
      onFinish: () => { setRejecting(false); onClose(); },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-bold text-base">Pago Contra Entrega</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-1.5">
            <p className="font-bold text-amber-700 text-base">
              ¿Estás de acuerdo con el Pago Contra Entrega?
            </p>
            <p className="text-sm text-amber-600/80">
              El cliente pagará al momento de recibir el pedido.
              Pedido <span className="font-mono font-semibold">#{String(order.id).padStart(8, '0')}</span> —{' '}
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">Términos y Condiciones</p>
            <p>Al aceptar este pedido bajo la modalidad <strong>Contra Entrega</strong>, declaras conocer y aceptar las siguientes condiciones:</p>
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li><strong>OrFlash no actúa como intermediario de pago</strong> en esta transacción. El cobro es realizado directamente por el repartidor al cliente en el momento de la entrega.</li>
              <li><strong>OrFlash no se hace responsable</strong> por falta de pago, disputas, billetes falsos, ni por cualquier inconveniente derivado del cobro en efectivo o contra entrega.</li>
              <li>La tienda asume la responsabilidad de coordinar con el repartidor el cobro y la entrega del dinero correspondiente al pedido.</li>
              <li>En caso de que el cliente no realice el pago al momento de la entrega, <strong>la tienda y el repartidor deberán resolver la situación directamente</strong>. OrFlash no intervendrá en dicha disputa.</li>
              <li>Las ganancias del repartidor y de la tienda por este pedido quedarán pendientes hasta que se confirme la entrega exitosa en la plataforma.</li>
              <li>Si rechazas el pedido, el stock de los productos será restaurado y el cliente será notificado de la cancelación.</li>
            </ol>
            <p className="font-semibold text-foreground">Al presionar "Aceptar y confirmar" das fe de haber leído y aceptado estos términos.</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div
              onClick={() => setAccepted(v => !v)}
              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                accepted ? 'bg-violet-600 border-violet-600' : 'border-muted-foreground'
              }`}
            >
              {accepted && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <span className="text-sm leading-snug">
              He leído y acepto los términos y condiciones. Entiendo que OrFlash no se hace responsable por el cobro contra entrega.
            </span>
          </label>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleReject}
              disabled={rejecting || advancing}
              className="flex-1 py-3 rounded-xl border border-red-500/40 bg-red-500/5 text-red-600 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {rejecting ? 'Rechazando…' : 'Rechazar pedido'}
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted || advancing || rejecting}
              className="flex-1 py-3 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/30 disabled:opacity-40 transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              {advancing ? 'Confirmando…' : 'Aceptar y confirmar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function StoreDashboard() {
  useAutoRefresh();
  const { store, activeOrders = [], todayRevenue = 0, todayDelivered = 0 } = usePage<PageProps>().props;
  const [codOrder, setCodOrder] = useState<Order | null>(null);

  const handleAdvance = (order: Order) => {
    const isCodPending = order.payment_method === 'contra_entrega' && order.status === 'pending';
    if (isCodPending) {
      setCodOrder(order);
    } else {
      router.patch(`/store/${store.id}/orders/${order.id}/advance`, {}, { preserveScroll: true });
    }
  };

  const metrics = [
    {
      label: 'Pedidos activos',
      value: activeOrders.length,
      icon: Package,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/40',
    },
    {
      label: 'Ingresos hoy',
      value: formatPrice(todayRevenue),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/40',
    },
    {
      label: 'Horario',
      value: store ? `${store.opening_time} - ${store.closing_time}` : '—',
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/40',
    },
    {
      label: 'Completados hoy',
      value: todayDelivered,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/40',
    },
  ];

  return (
    <StoreLayout>
      <PageTransition className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inicio Tienda</h1>
            <p className="text-muted-foreground text-sm">Panel de control de tu negocio</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Crear tienda
            </Link>
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg ${
              store?.is_open
                ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                : 'bg-slate-500 text-white shadow-slate-500/40'
            }`}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {store?.is_open ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
        </div>

        {/* Métricas */}
        <StaggerList className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <StaggerItem key={m.label}>
              <div className={`rounded-2xl p-5 bg-linear-to-br ${m.gradient} text-white shadow-xl ${m.shadow}`}>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <m.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-white/75 mt-1">{m.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Pedidos entrantes */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Pedidos entrantes</h2>
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3 text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-violet-500" />
              </div>
              <p className="text-sm">No hay pedidos activos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const isCodPending    = order.payment_method === 'contra_entrega' && order.status === 'pending';
                const isOnlinePending = ONLINE_METHODS.includes(order.payment_method ?? '')
                                      && order.payment_status === 'pending'
                                      && order.status === 'pending';
                const methodLabel = order.payment_method
                  ? (paymentMethodLabel[order.payment_method] ?? order.payment_method)
                  : null;

                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border bg-card p-4 space-y-3 ${
                      isCodPending    ? 'border-amber-500/40 bg-amber-500/5' :
                      isOnlinePending ? 'border-blue-500/40 bg-blue-500/5'  :
                                        'border-l-4 border-violet-500 bg-violet-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{String(order.id).padStart(8, '0')}
                      </span>
                      <div className="flex items-center gap-2">
                        {isCodPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 text-xs font-semibold">
                            🏠 Contra Entrega
                          </span>
                        )}
                        {isOnlinePending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-700 text-xs font-semibold">
                            💳 {methodLabel} — verificar pago
                          </span>
                        )}
                        <StatusBadge status={order.status as any} />
                      </div>
                    </div>

                    <p className="text-sm">
                      <span className="text-muted-foreground">Cliente:</span>{' '}
                      <span className="font-medium">{order.client?.name ?? '—'}</span>
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {order.items?.map(i => `${i.product_name} x${i.quantity}`).join(' · ')}
                    </p>

                    {isCodPending && (
                      <p className="text-xs text-amber-600 font-medium">
                        ⚠️ Este pedido requiere tu aceptación antes de procesarse.
                      </p>
                    )}
                    {isOnlinePending && (
                      <p className="text-xs text-blue-600 font-medium">
                        💬 Verifica que el cliente realizó el pago por {methodLabel} antes de confirmar.
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-bold text-violet-600">{formatPrice(order.total)}</span>
                      {order.status === 'ready' ? (
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                          🛵 Esperando repartidor
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAdvance(order)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg hover:opacity-90 transition-opacity ${
                            isCodPending
                              ? 'bg-linear-to-r from-amber-500 to-orange-500 shadow-amber-500/30'
                              : 'bg-linear-to-r from-violet-600 to-purple-600 shadow-violet-500/30'
                          }`}
                        >
                          {isCodPending ? 'Revisar y aceptar' : 'Avanzar estado'}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </PageTransition>

      {/* Modal contra entrega */}
      {codOrder && (
        <CodModal
          order={codOrder}
          storeId={store.id}
          onClose={() => setCodOrder(null)}
        />
      )}
    </StoreLayout>
  );
}

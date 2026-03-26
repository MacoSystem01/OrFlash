import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/shared/Animations';
import { router, usePage } from '@inertiajs/react';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import {
  ArrowLeft, Package, CheckCircle, ChefHat, Truck, MapPin,
  Phone, Clock, CreditCard, AlertCircle, Loader2, XCircle,
} from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface OrderItem { id: number; product_name: string; quantity: number; unit_price: number; subtotal: number; }
interface Store     { id: number; business_name: string; address: string; }
interface Driver    { id: number; name: string; phone: string | null; }

interface Order {
  id:                     number;
  store:                  Store;
  driver:                 Driver | null;
  items:                  OrderItem[];
  subtotal:               number;
  delivery_fee:           number;
  total:                  number;
  status:                 string;
  payment_status:         string;
  delivery_address:       string;
  delivery_neighborhood:  string | null;
  delivery_references:    string | null;
  confirmed_at:           string | null;
  preparing_at:           string | null;
  ready_at:               string | null;
  picked_up_at:           string | null;
  delivered_at:           string | null;
  created_at:             string;
}

interface PageProps { order: Order; [key: string]: unknown; }

// ─── Pasos del timeline ───────────────────────────────────────────────────────

const steps = [
  { status: 'pending',    label: 'Pedido recibido',          desc: 'Tu pedido fue confirmado y pagado', icon: Package,     color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40'  },
  { status: 'confirmed',  label: 'Confirmado por la tienda', desc: 'La tienda recibió tu pedido',       icon: CheckCircle, color: 'from-blue-500 to-cyan-600',     shadow: 'shadow-blue-500/40'    },
  { status: 'preparing',  label: 'Preparando',               desc: 'Están alistando tu pedido',         icon: ChefHat,     color: 'from-amber-500 to-orange-500',  shadow: 'shadow-amber-500/40'   },
  { status: 'ready',      label: 'Listo para recoger',       desc: 'Esperando repartidor',              icon: CheckCircle, color: 'from-teal-500 to-emerald-600',  shadow: 'shadow-teal-500/40'    },
  { status: 'picked_up',  label: 'Recogido',                 desc: 'El repartidor ya lo tiene',         icon: Truck,       color: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40' },
  { status: 'in_transit', label: 'En camino',                desc: 'Tu pedido va hacia ti',             icon: Truck,       color: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40' },
  { status: 'delivered',  label: '¡Entregado!',              desc: 'Disfruta tu pedido',                icon: MapPin,      color: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40' },
];

const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered'];

// ─── Card del repartidor ──────────────────────────────────────────────────────

function DriverCard({ driver }: { driver: Driver }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold mb-3">Tu repartidor</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {driver.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{driver.name}</p>
          {driver.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" /> {driver.phone}
            </p>
          )}
        </div>
        {driver.phone && (
          <a
            href={`tel:${driver.phone}`}
            className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            Llamar
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Vista: Pago pendiente ────────────────────────────────────────────────────

function PendingPaymentView({ order }: { order: Order }) {
  const [loading,    setLoading]    = useState(false);
  const [switching,  setSwitching]  = useState(false);
  const [canceling,  setCanceling]  = useState(false);
  const [error,      setError]      = useState('');
  const [wompiError, setWompiError] = useState(false);
  const [confirm,    setConfirm]    = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setError('');
    setWompiError(false);
    try {
      const xsrfToken = decodeURIComponent(
        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
      );

      const res  = await fetch(`/client/payments/generate/${order.id}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN':     xsrfToken,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'No se pudo generar el pago.');
        if (data.wompi_error) setWompiError(true);
        setLoading(false);
        return;
      }
      const wompi = data;

      // Construir y enviar form de Wompi
      const form = document.createElement('form');
      form.action = 'https://checkout.wompi.co/p/';
      form.method = 'GET';

      const fields: Record<string, string> = {
        'public-key':          wompi.public_key,
        'currency':            wompi.currency,
        'amount-in-cents':     String(wompi.amount_in_cents),
        'reference':           wompi.reference,
        'signature:integrity': wompi.signature,
        'redirect-url':        wompi.redirect_url,
      };

      Object.entries(fields).forEach(([name, value]) => {
        const input   = document.createElement('input');
        input.type    = 'hidden';
        input.name    = name;
        input.value   = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (e: any) {
      setError(e.message ?? 'Error al iniciar el pago.');
      setLoading(false);
    }
  };

  const handleSwitchToCod = () => {
    setSwitching(true);
    router.post(`/client/orders/${order.id}/switch-to-cod`, {}, {
      onFinish: () => setSwitching(false),
    });
  };

  const handleCancel = () => {
    setCanceling(true);
    router.delete(`/client/orders/${order.id}/cancel`, {
      onFinish: () => setCanceling(false),
    });
  };

  return (
    <div className="space-y-4">
      {/* Banner pago pendiente */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-amber-700">Pago pendiente</h2>
            <p className="text-sm text-amber-600/80 mt-0.5">
              Tu pedido fue creado pero el pago aún no se ha completado.
              Completa el pago para que la tienda pueda procesarlo.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Cuando Wompi no está disponible, ofrecer contra entrega */}
        {wompiError ? (
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              ¿Deseas continuar con pago contra entrega?
            </p>
            <button
              onClick={handleSwitchToCod}
              disabled={switching}
              className="w-full py-3.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all"
            >
              {switching
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
                : <>🏠 Confirmar pedido — Contra Entrega</>
              }
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo a Wompi…</>
                : <><CreditCard className="w-4 h-4" /> Completar pago — {formatPrice(order.total)}</>
              }
            </button>
            <p className="text-center text-xs text-muted-foreground">
              🔒 Pago seguro procesado por Wompi
            </p>
          </>
        )}
      </div>

      {/* Resumen del pedido */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-sm">Resumen del pedido</h3>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{order.store.business_name}</p>
        </div>
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.product_name} x{item.quantity}</span>
            <span className="font-medium">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Domicilio</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1">
            <span>Total</span>
            <span className="text-violet-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Cancelar pedido */}
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
        >
          <XCircle className="w-4 h-4" /> Cancelar pedido
        </button>
      ) : (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
          <p className="text-sm font-semibold text-red-600 text-center">
            ¿Confirmas la cancelación?
          </p>
          <p className="text-xs text-muted-foreground text-center">
            El stock de los productos será restaurado. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
            >
              No, mantener
            </button>
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 hover:bg-red-600 transition-colors"
            >
              {canceling
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelando…</>
                : 'Sí, cancelar'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ClientOrderTracking() {
  useAutoRefresh();
  const { order }  = usePage<PageProps>().props;
  const isPending   = order.status === 'pending_payment';
  const isCancelled = order.status === 'cancelled';
  const currentIdx  = statusOrder.indexOf(order.status);

  const [showCancelModal, setShowCancelModal] = useState(isCancelled);
  useEffect(() => {
    if (order.status === 'cancelled') setShowCancelModal(true);
  }, [order.status]);

  return (
    <ClientLayout>
      <PageTransition className="p-4 space-y-5 pb-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.visit('/client/orders')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {isPending ? 'Completar pago' : 'Seguimiento'}
            </h1>
            <p className="text-muted-foreground text-xs font-mono">
              #{String(order.id).padStart(8, '0')} · {order.store.business_name}
            </p>
          </div>
        </div>

        {/* Vista especial: pago pendiente */}
        {isPending && <PendingPaymentView order={order} />}

        {/* Modal emergente: cancelado */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-card border border-red-500/30 shadow-2xl p-7 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-red-600">Pedido cancelado</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tu pedido <span className="font-mono font-semibold">#{String(order.id).padStart(8, '0')}</span> fue cancelado.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Si realizaste algún pago será reembolsado automáticamente.
                  El stock de los productos ha sido restaurado.
                </p>
              </div>
              <button
                onClick={() => router.visit('/client/orders')}
                className="w-full py-3.5 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 active:scale-95 transition-all"
              >
                Ver mis pedidos
              </button>
            </div>
          </div>
        )}

        {/* Vista normal: timeline */}
        {!isPending && !isCancelled && (
          <>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
              <h3 className="font-semibold mb-4">Estado del pedido</h3>
              {steps.map((step, i) => {
                const isDone    = statusOrder.indexOf(step.status) <= currentIdx;
                const isCurrent = step.status === order.status;
                return (
                  <div key={step.status} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={[
                        'w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all',
                        isDone    ? 'bg-linear-to-br ' + step.color + ' ' + step.shadow : 'bg-secondary',
                        isCurrent ? 'ring-2 ring-violet-400 ring-offset-2' : '',
                      ].join(' ')}>
                        <step.icon className={['w-4 h-4', isDone ? 'text-white' : 'text-muted-foreground'].join(' ')} />
                      </div>
                      {i < steps.length - 1 && (
                        <div className={['w-0.5 h-6 mt-1 transition-all', isDone ? 'bg-linear-to-b from-violet-500 to-violet-300' : 'bg-border'].join(' ')} />
                      )}
                    </div>
                    <div className="pt-1.5 flex-1">
                      <p className={['text-sm font-semibold', isDone ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-violet-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse inline-block" />
                          En progreso
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.driver && <DriverCard driver={order.driver} />}

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-500" />
                Dirección de entrega
              </h3>
              <p className="text-sm">{order.delivery_address}</p>
              {order.delivery_neighborhood && (
                <p className="text-xs text-muted-foreground mt-0.5">{order.delivery_neighborhood}</p>
              )}
              {order.delivery_references && (
                <p className="text-xs text-muted-foreground mt-1">📍 {order.delivery_references}</p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-semibold">Detalle del pedido</h3>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.product_name} x{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Domicilio</span>
                  <span>{formatPrice(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Total pagado</span>
                  <span className="text-violet-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Historial de tiempos
              </h3>
              {[
                { label: 'Pedido realizado', time: order.created_at   },
                { label: 'Confirmado',       time: order.confirmed_at },
                { label: 'En preparación',   time: order.preparing_at },
                { label: 'Listo',            time: order.ready_at     },
                { label: 'Recogido',         time: order.picked_up_at },
                { label: 'Entregado',        time: order.delivered_at },
              ]
                .filter(t => t.time)
                .map(t => (
                  <div key={t.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t.label}</span>
                    <span className="font-medium">
                      {new Date(t.time!).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              }
            </div>
          </>
        )}

      </PageTransition>
    </ClientLayout>
  );
}

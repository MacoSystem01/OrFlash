import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useCartStore } from '@/app/store/cartStore';
import { PageTransition } from '@/components/shared/Animations';
import {
  MapPin, CreditCard, ArrowLeft, ArrowRight,
  Loader2, CheckCircle, AlertCircle, ShoppingBag,
} from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ClientProfile {
  address:       string | null;
  neighborhood:  string | null;
  city:          string | null;
  references:    string | null;
}

interface PaymentMethod {
  type:        string;
  is_default:  boolean;
  nequi_phone?: string;
  pse_bank?:    string;
}

interface PageProps {
  profile?:        ClientProfile;
  paymentMethods?: PaymentMethod[];
  [key: string]: unknown;
}

const DELIVERY_FEE = 2500;

const paymentLabels: Record<string, string> = {
  cash:       'Efectivo contra entrega',
  nequi:      'Nequi',
  pse:        'PSE',
  daviplata:  'Daviplata',
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ClientCheckout() {
  const { profile, paymentMethods = [] } = usePage<PageProps>().props;
  const { items, total, clearCart }      = useCartStore();

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [orderId,  setOrderId]  = useState<number | null>(null);
  const [step,     setStep]     = useState<'review' | 'payment' | 'success'>('review');
  const [wompiData, setWompiData] = useState<any>(null);

  const grandTotal = total() + DELIVERY_FEE;

  // Si no hay items redirigir al home
  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      router.visit('/client/home');
    }
  }, [items]);

  // ── Paso 1: crear la orden en el backend ──────────────────────────────────
  const handleCreateOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const storeId = items[0].product.storeId;

      const xsrfToken = decodeURIComponent(
        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
      );

      const res = await fetch('/client/orders', {
        method:  'POST',
        headers: {
          'Content-Type':     'application/json',
          'X-XSRF-TOKEN':     xsrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          store_id:     Number(storeId),
          delivery_fee: DELIVERY_FEE,
          items: items.map(i => ({
            product_id: Number(i.product.id),
            quantity:   i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Error al crear el pedido.');
        setLoading(false);
        return;
      }

      setOrderId(data.order_id);

      // Obtener datos de Wompi para el pago
      const wompiRes = await fetch(`/client/payments/generate/${data.order_id}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const wompi = await wompiRes.json();
      setWompiData(wompi);
      setStep('payment');

    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    }

    setLoading(false);
  };

  // ── Paso 2: abrir widget de Wompi ─────────────────────────────────────────
  useEffect(() => {
    if (step !== 'payment' || !wompiData) return;

    // Cargar el script de Wompi si no está cargado
    if (!document.getElementById('wompi-script')) {
      const script    = document.createElement('script');
      script.id       = 'wompi-script';
      script.src      = 'https://checkout.wompi.co/widget.js';
      script.async    = true;
      script.onload   = () => initWompiWidget();
      document.body.appendChild(script);
    } else {
      initWompiWidget();
    }
  }, [step, wompiData]);

  const initWompiWidget = () => {
    if (!wompiData) return;

    const form = document.createElement('form');
    form.action = 'https://checkout.wompi.co/p/';
    form.method = 'GET';

    const fields: Record<string, string> = {
      'public-key':         wompiData.public_key,
      'currency':           wompiData.currency,
      'amount-in-cents':    String(wompiData.amount_in_cents),
      'reference':          wompiData.reference,
      'signature:integrity':wompiData.signature,
      'redirect-url':       wompiData.redirect_url,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type  = 'hidden';
      input.name  = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    // Limpiar carrito
    clearCart();
  };

  // ── Vista de éxito ────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <ClientLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-[70vh] gap-5 p-6">
          <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">¡Pedido confirmado!</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Tu pedido está siendo procesado por la tienda
            </p>
          </div>
          <button
            onClick={() => router.visit('/client/orders')}
            className="px-6 py-3 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center gap-2"
          >
            Ver mis pedidos <ArrowRight className="w-4 h-4" />
          </button>
        </PageTransition>
      </ClientLayout>
    );
  }

  // ── Carrito vacío ─────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <ClientLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-[70vh] gap-5 p-6">
          <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-violet-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">Carrito vacío</h2>
            <p className="text-muted-foreground text-sm mt-1">Agrega productos antes de continuar</p>
          </div>
          <button
            onClick={() => router.visit('/client/home')}
            className="px-6 py-3 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30"
          >
            Explorar tiendas
          </button>
        </PageTransition>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <PageTransition className="p-4 space-y-5 pb-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.visit('/client/cart')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Dirección de entrega */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Dirección de entrega</p>
              <p className="text-xs text-muted-foreground">
                {profile?.address
                  ? `${profile.address}${profile.neighborhood ? ', ' + profile.neighborhood : ''}${profile.city ? ', ' + profile.city : ''}`
                  : 'Sin dirección configurada'
                }
              </p>
            </div>
          </div>
          {profile?.references && (
            <p className="text-xs text-muted-foreground pl-12">
              📍 {profile.references}
            </p>
          )}
          {!profile?.address && (
            <button
              onClick={() => router.visit('/client/profile')}
              className="mt-2 text-xs text-violet-600 font-semibold pl-12 hover:underline"
            >
              Configurar dirección →
            </button>
          )}
        </div>

        {/* Método de pago */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Método de pago</p>
              <p className="text-xs text-muted-foreground">
                {paymentMethods.find(m => m.is_default)
                  ? paymentLabels[paymentMethods.find(m => m.is_default)!.type] ?? 'Método predeterminado'
                  : 'Pago digital con Wompi'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">Resumen del pedido</h3>

          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate mr-2">
                {product.name} x{quantity}
              </span>
              <span className="font-medium shrink-0">
                {formatPrice(product.price * quantity)}
              </span>
            </div>
          ))}

          <div className="flex justify-between text-sm pt-1 border-t border-border">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(total())}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Domicilio</span>
            <span className="font-medium">{formatPrice(DELIVERY_FEE)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Comisión plataforma</span>
            <span className="font-medium text-violet-600">Incluida</span>
          </div>

          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-violet-600">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Desglose de distribución */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Distribución del pago
          </p>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tienda recibe (90%)</span>
            <span className="font-medium">{formatPrice(Math.round(total() * 0.9))}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Repartidor recibe (90%)</span>
            <span className="font-medium">{formatPrice(Math.round(DELIVERY_FEE * 0.9))}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>OrFlash (10% c/u)</span>
            <span className="font-medium">
              {formatPrice(Math.round(total() * 0.1) + Math.round(DELIVERY_FEE * 0.1))}
            </span>
          </div>
        </div>

        {/* Botón confirmar */}
        <button
          onClick={handleCreateOrder}
          disabled={loading || items.length === 0 || !profile?.address}
          className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
            : <><CreditCard className="w-4 h-4" /> Ir a pagar {formatPrice(grandTotal)}</>
          }
        </button>

        {!profile?.address && (
          <p className="text-center text-xs text-amber-600 font-medium">
            ⚠️ Debes configurar tu dirección de entrega antes de continuar
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground">
          🔒 Pago seguro procesado por Wompi
        </p>

      </PageTransition>
    </ClientLayout>
  );
}
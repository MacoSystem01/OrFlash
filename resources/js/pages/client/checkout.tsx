import { router } from '@inertiajs/react';
import { useCartStore } from '@/app/store/cartStore';
import { useOrderStore } from '@/app/store/orderStore';
import { PageTransition } from '@/components/shared/Animations';
import { MapPin, CreditCard, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import ClientLayout from '@/layouts/ClientLayout';
import { formatPrice } from '@/lib/format';

export default function ClientCheckout() {
  const { items, total, clearCart } = useCartStore();
  const addOrder = useOrderStore((s) => s.addOrder);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const delivery = 2500;

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const orderId = `ORD-${String(Date.now()).slice(-6)}`;
    addOrder({
      id: orderId,
      clientId: 'client-1',
      clientName: 'Cliente',
      storeId: items[0]?.product.storeId ?? 'store-1',
      storeName: 'Tienda',
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total: total() + delivery,
      status: 'pending',
      createdAt: new Date().toISOString(),
      address: 'Calle 45 #12-30, Apto 502',
      estimatedDelivery: '30-45 min',
    });
    clearCart();
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.visit('/client/orders'), 1800);
  };

  if (success) {
    return (
      <ClientLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-[70vh] gap-5 p-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">¡Pedido confirmado!</h2>
            <p className="text-muted-foreground text-sm mt-1">Tu pedido está siendo procesado</p>
          </div>
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

        {/* Dirección */}
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Dirección de entrega</p>
            <p className="text-xs text-muted-foreground">Calle 45 #12-30, Apto 502</p>
          </div>
        </div>

        {/* Método de pago */}
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Método de pago</p>
            <p className="text-xs text-muted-foreground">Efectivo contra entrega</p>
          </div>
        </div>

        {/* Resumen */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-sm mb-3">Resumen del pedido</h3>
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate mr-2">{product.name} x{quantity}</span>
              <span className="font-medium shrink-0">{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm pt-1">
            <span className="text-muted-foreground">Envío</span>
            <span className="font-medium">{formatPrice(delivery)}</span>
          </div>
          <div className="border-t border-border pt-3 mt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-violet-600">{formatPrice(total() + delivery)}</span>
          </div>
        </div>

        {/* Confirmar */}
        <button
          onClick={handleOrder}
          disabled={loading || items.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Procesando...' : 'Confirmar pedido'}
        </button>

      </PageTransition>
    </ClientLayout>
  );
}
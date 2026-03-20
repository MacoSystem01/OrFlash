import { router } from '@inertiajs/react';
import { PageTransition } from '@/components/shared/Animations';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';
import { useCartStore } from '@/app/store/cartStore';
import { formatPrice } from '@/lib/format';

export default function ClientCart() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const delivery = 2500;

  if (items.length === 0) {
    return (
      <ClientLayout>
        <PageTransition className="flex flex-col items-center justify-center min-h-[70vh] gap-5 p-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-violet-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">Carrito vacío</h2>
            <p className="text-muted-foreground text-sm mt-1">Agrega productos para comenzar</p>
          </div>
          <button
            onClick={() => router.visit('/client/home')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 flex items-center gap-2"
          >
            Explorar tiendas <ArrowRight className="w-4 h-4" />
          </button>
        </PageTransition>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <PageTransition className="p-4 space-y-4 pb-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Tu carrito</h1>
          <span className="ml-auto text-sm text-muted-foreground">
            {items.reduce((a, b) => a + b.quantity, 0)} items
          </span>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl shrink-0">
                🛍️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(product.price)} c/u</p>
                <p className="text-sm text-violet-600 font-bold">
                  {formatPrice(product.price * quantity)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => removeItem(product.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 ml-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">Resumen del pedido</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(total())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span className="font-medium">{formatPrice(delivery)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-violet-600">{formatPrice(total() + delivery)}</span>
          </div>
        </div>

        {/* Ir a pagar */}
        <button
          onClick={() => router.visit('/client/checkout')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
        >
          Ir a pagar <ArrowRight className="w-4 h-4" />
        </button>

      </PageTransition>
    </ClientLayout>
  );
}
import { router } from '@inertiajs/react';
import { PageTransition } from '@/components/shared/Animations';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import ClientLayout from '@/layouts/ClientLayout';

export default function ClientCart() {
  // Carrito vacío por ahora — luego se conecta con Laravel
  const items: any[] = [];
  const subtotal = 0;
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
      <PageTransition className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Tu carrito</h1>
        <div className="space-y-3">
          {items.map(({ product, quantity }: any) => (
            <div key={product.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl">
                {product.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-sm text-violet-600 font-semibold">${product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button className="text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span className="font-medium">${delivery.toLocaleString()}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-violet-600">${(subtotal + delivery).toLocaleString()}</span>
          </div>
        </div>

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
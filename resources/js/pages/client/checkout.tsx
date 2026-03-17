import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/app/store/cartStore';
import { useOrderStore } from '@/app/store/orderStore';
import { useAuthStore } from '@/app/store/authStore';
import { PageTransition } from '@/components/shared/Animations';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ClientCheckout = () => {
  const { items, total, clearCart } = useCartStore();
  const addOrder = useOrderStore((s) => s.addOrder);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const orderId = `ORD-${String(Date.now()).slice(-3)}`;
    addOrder({
      id: orderId,
      clientId: user?.id || 'client-1',
      clientName: user?.name || 'Cliente',
      storeId: items[0]?.product.storeId || 'store-1',
      storeName: 'Tienda',
      items: items.map((i) => ({ productId: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
      total: total() + 2500,
      status: 'pending',
      createdAt: new Date().toISOString(),
      address: 'Calle 45 #12-30, Apto 502',
      estimatedDelivery: '30-45 min',
    });
    clearCart();
    setLoading(false);
    toast.success('¡Pedido realizado con éxito!');
    navigate('/client/order-tracking');
  };

  return (
    <PageTransition className="p-4 space-y-5">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="surface p-4 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm font-medium">Dirección de entrega</p>
          <p className="text-xs text-muted-foreground">Calle 45 #12-30, Apto 502</p>
        </div>
      </div>

      <div className="surface p-4 flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm font-medium">Método de pago</p>
          <p className="text-xs text-muted-foreground">Efectivo contra entrega</p>
        </div>
      </div>

      <div className="surface p-4 space-y-2">
        <h3 className="font-semibold text-sm mb-3">Resumen del pedido</h3>
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{product.name} x{quantity}</span>
            <span className="text-mono">${(product.price * quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-mono">${(total() + 2500).toLocaleString()}</span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleOrder}
        disabled={loading || items.length === 0}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Procesando...' : 'Confirmar pedido'}
      </motion.button>
    </PageTransition>
  );
};

export default ClientCheckout;

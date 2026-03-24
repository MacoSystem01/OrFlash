import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Clock, MapPin, Package,
  ShoppingBag, Zap, LogIn, Search,
} from 'lucide-react';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  store_id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string | null;
  images: string[] | null;
}

interface Store {
  id: number;
  business_name: string;
  category: string;
  zone: string;
  description: string | null;
  rating: number;
  opening_time: string;
  closing_time: string;
  is_open: boolean;
  images: string[] | null;
  address: string;
}

interface PageProps {
  store: Store;
  products: Product[];
  auth: { user: { id: number; role: string } | null };
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryEmoji: Record<string, string> = {
  Abarrotes:  '🛒',
  Farmacia:   '💊',
  Panadería:  '🥐',
  Carnicería: '🥩',
  Verdulería: '🥦',
  Bebidas:    '🥤',
  Electrónica:'📱',
};

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PublicStoreDetail() {
  const { store, products, auth } = usePage<PageProps>().props;

  const [search,        setSearch]      = useState('');
  const [showAuthModal, setAuthModal]   = useState(false);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
  const [selectedCat, setSelectedCat] = useState('Todos');

  const filtered = products.filter(p =>
    (selectedCat === 'Todos' || p.category === selectedCat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (auth?.user?.role === 'client') {
      // Redirigir al detalle autenticado donde está el carrito real
      router.visit(`/client/store/${store.id}`);
    } else {
      setAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Head title={`${store.business_name} — OrFlash`} />

      {/* ── Hero imagen de la tienda ── */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {store.images?.[0] ? (
          <img
            src={`/storage/${store.images[0]}`}
            alt={store.business_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-linear-to-br ${gradients[store.id % gradients.length]} flex items-center justify-center`}>
            <span className="text-8xl">{categoryEmoji[store.category] ?? '🛍️'}</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/20" />

        {/* Nav */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.visit('/')}
            className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {!auth?.user && (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Iniciar sesión
            </Link>
          )}
          {auth?.user?.role === 'client' && (
            <button
              onClick={() => router.visit(`/client/store/${store.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Ir al carrito
            </button>
          )}
        </div>

        {/* Info tienda en la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">{store.business_name}</h1>
              <p className="text-white/80 text-sm mt-0.5">{store.category}</p>
              {store.description && (
                <p className="text-white/70 text-xs mt-1 line-clamp-2">{store.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {store.zone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {store.opening_time} - {store.closing_time}
                </span>
                {store.rating > 0 && (
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Star className="w-3 h-3 fill-amber-300" /> {store.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
              store.is_open ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-200'
            }`}>
              {store.is_open ? '🟢 Abierta' : '🔴 Cerrada'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Aviso si no está logueado */}
        {!auth?.user && (
          <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-violet-500 shrink-0" />
            <p className="text-sm text-foreground flex-1">
              <Link href="/login" className="font-semibold text-violet-600 hover:underline">Inicia sesión</Link>
              {' '}o{' '}
              <Link href="/register" className="font-semibold text-violet-600 hover:underline">crea una cuenta</Link>
              {' '}para agregar productos al carrito y realizar tu pedido.
            </p>
          </div>
        )}

        {/* Buscador */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-all shrink-0 ${
                selectedCat === cat
                  ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Contador */}
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'} disponibles
        </p>

        {/* ── Productos ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4 text-muted-foreground">
            <Package className="w-10 h-10" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Imagen producto */}
                <div className="relative h-36 overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={`/storage/${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-linear-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                      <span className="text-4xl">
                        {categoryEmoji[store.category] ?? '📦'}
                      </span>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-black/30 text-white backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="font-bold text-sm leading-tight">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-violet-600">{formatPrice(product.price)}</span>
                    <button
                      onClick={handleAddToCart}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {auth?.user?.role === 'client' ? 'Pedir' : 'Añadir'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: autenticación requerida ── */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModal(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-card rounded-3xl border border-border p-8 max-w-sm w-full shadow-2xl text-center space-y-5 pointer-events-auto">
                <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-violet-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">¡Inicia sesión para pedir! 🎉</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Necesitas una cuenta de cliente para agregar productos al carrito y realizar pedidos.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="w-full py-3 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="w-full py-3 rounded-xl border border-border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
                  >
                    Crear cuenta gratis
                  </Link>
                </div>
                <button
                  onClick={() => setAuthModal(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Seguir explorando
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

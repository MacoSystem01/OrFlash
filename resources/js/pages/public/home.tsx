import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, Clock, Zap, MapPin,
  ShoppingBag, ArrowRight, LogIn, Store, Package,
  ChevronLeft, ChevronRight, ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/format';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface StoreItem {
  id: number;
  business_name: string;
  category: string;
  zone: string;
  rating: number;
  opening_time: string;
  closing_time: string;
  is_open: boolean;
  images: string[] | null;
  address: string;
  products_count?: number;
}

interface ProductItem {
  id: number;
  store_id: number;
  name: string;
  category: string;
  price: number;
  images: string[] | null;
  description: string | null;
  store: { id: number; business_name: string; category: string; images: string[] | null };
}

interface CarouselItem {
  id: number;
  image: string;
  redirect_url: string | null;
}

interface FooterItem {
  id: number;
  title: string;
  icon: string | null;
  redirect_url: string | null;
}

interface PageProps {
  stores: StoreItem[];
  products: ProductItem[];
  carousels: CarouselItem[];
  footerItems: FooterItem[];
  auth: { user: { id: number; role: string } | null };
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryEmoji: Record<string, string> = {
  Abarrotes:   '🛒',
  Farmacia:    '💊',
  Panadería:   '🥐',
  Carnicería:  '🥩',
  Verdulería:  '🥦',
  Bebidas:     '🥤',
  Electrónica: '📱',
};

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
  'from-slate-500 to-slate-700',
];

// ─── Hero Carousel ────────────────────────────────────────────────────────────

function HeroCarousel({
  slides,
  search,
  setSearch,
  openStores,
}: {
  slides: CarouselItem[];
  search: string;
  setSearch: (v: string) => void;
  openStores: number;
}) {
  const [current, setCurrent] = useState(0);
  const hasSlides = slides.length > 0;

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!hasSlides || slides.length < 2) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [hasSlides, next, slides.length]);

  const handleSlideClick = (slide: CarouselItem) => {
    if (slide.redirect_url) {
      window.location.href = slide.redirect_url;
    }
  };

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '320px' }}>
      {/* Background — carousel image OR gradient fallback */}
      <AnimatePresence initial={false} mode="wait">
        {hasSlides ? (
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={`/storage/${slides[current].image}`}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text legibility */}
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-violet-600 via-purple-600 to-blue-700">
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Clickable overlay for redirect */}
      {hasSlides && slides[current].redirect_url && (
        <button
          onClick={() => handleSlideClick(slides[current])}
          className="absolute inset-0 z-0 cursor-pointer"
          aria-label="Ver oferta"
        />
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="text-center text-white space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {openStores} tiendas abiertas ahora
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold">
            Todo lo que necesitas,<br />
            <span className="text-violet-200">entregado rápido ⚡</span>
          </h1>
          <p className="text-violet-200 text-lg">
            Explora tiendas y productos. Inicia sesión para hacer tu pedido.
          </p>
          <div className="flex items-center gap-3 bg-white rounded-2xl p-2 shadow-2xl mt-6">
            <Search className="w-5 h-5 text-muted-foreground ml-2 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar tiendas o productos..."
              className="flex-1 outline-none text-foreground text-sm bg-transparent py-2"
            />
          </div>
        </div>
      </div>

      {/* Carousel controls — only if multiple slides */}
      {hasSlides && slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Footer Mosaic ────────────────────────────────────────────────────────────

function FooterMosaic({ items }: { items: FooterItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-border bg-secondary/30 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-xl font-bold mb-8 text-foreground/80">¿Por qué elegir OrFlash?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {items.map(item => {
            const inner = (
              <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-violet-300 transition-all cursor-pointer group">
                {item.icon ? (
                  <img
                    src={`/storage/${item.icon}`}
                    alt={item.title}
                    className="w-16 h-16 object-contain rounded-2xl group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-violet-500" />
                  </div>
                )}
                <p className="text-sm font-semibold text-center leading-snug">{item.title}</p>
                {item.redirect_url && (
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            );

            return item.redirect_url ? (
              <a key={item.id} href={item.redirect_url} target="_blank" rel="noopener noreferrer" className="block">
                {inner}
              </a>
            ) : (
              <div key={item.id}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function PublicHome() {
  const { stores, products, carousels, footerItems, auth } = usePage<PageProps>().props;

  const [search,        setSearch]      = useState('');
  const [selectedCat,   setSelectedCat] = useState('Todas');
  const [activeTab,     setActiveTab]   = useState<'stores' | 'products'>('stores');
  const [showAuthModal, setAuthModal]   = useState(false);

  const categories = ['Todas', ...Array.from(new Set(stores.map(s => s.category)))];

  const filteredStores = stores.filter(s => {
    const matchSearch = s.business_name.toLowerCase().includes(search.toLowerCase()) ||
      s.zone.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'Todas' || s.category === selectedCat;
    return matchSearch && matchCat;
  });

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.store?.business_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'Todas' || p.store?.category === selectedCat;
    return matchSearch && matchCat;
  });

  const handleStoreClick = (storeId: number) => {
    if (auth?.user?.role === 'client') {
      router.visit(`/client/store/${storeId}`);
    } else {
      router.visit(`/stores/${storeId}`);
    }
  };

  const handleAddToCart = () => {
    if (!auth?.user || auth.user.role !== 'client') {
      setAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Head title="OrFlash — Entregas rápidas" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-50 h-50 flex items-start justify-center overflow-visible">
              <img
                src="/logo-png.png"
                alt="OrFlash"
                className="w-full h-full object-contain translate-y-5 drop-shadow-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {auth?.user ? (
              <button
                onClick={() => router.visit('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
              >
                Mi cuenta
              </button>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Registrarse
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
                >
                  <LogIn className="w-4 h-4" /> Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <HeroCarousel
        slides={carousels ?? []}
        search={search}
        setSearch={setSearch}
        openStores={stores.filter(s => s.is_open).length}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Filtros de categoría */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap font-medium transition-all shrink-0 ${
                selectedCat === cat
                  ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {categoryEmoji[cat] ?? '🛍️'} {cat}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
          {(['stores', 'products'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'stores'
                ? `🏪 Tiendas (${filteredStores.length})`
                : `🛍️ Productos (${filteredProducts.length})`}
            </button>
          ))}
        </div>

        {/* ── Grid Tiendas ── */}
        {activeTab === 'stores' && (
          <>
            {filteredStores.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-4 text-muted-foreground">
                <Store className="w-12 h-12" />
                <p>No se encontraron tiendas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStores.map((store, i) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleStoreClick(store.id)}
                    className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="relative h-40 overflow-hidden">
                      {store.images?.[0] ? (
                        <img
                          src={`/storage/${store.images[0]}`}
                          alt={store.business_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-linear-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                          />
                          <span className="text-6xl group-hover:scale-110 transition-transform relative z-10">
                            {categoryEmoji[store.category] ?? '🛍️'}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        store.is_open ? 'bg-emerald-500 text-white' : 'bg-slate-700/90 text-slate-300'
                      }`}>
                        {store.is_open ? 'Abierta' : 'Cerrada'}
                      </span>
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1">
                        <MapPin className="w-3 h-3" /> {store.zone}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base leading-tight">{store.business_name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{store.category}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-500" />
                          {store.rating > 0 ? store.rating.toFixed(1) : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {store.opening_time} - {store.closing_time}
                        </span>
                        {store.products_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {store.products_count} productos
                          </span>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Ver productos</span>
                        <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Grid Productos ── */}
        {activeTab === 'products' && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-4 text-muted-foreground">
                <ShoppingBag className="w-12 h-12" />
                <p>No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleStoreClick(product.store_id)}
                    className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="relative h-32 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={`/storage/${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-linear-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                          <span className="text-4xl group-hover:scale-110 transition-transform">
                            {categoryEmoji[product.store?.category ?? ''] ?? '📦'}
                          </span>
                        </div>
                      )}
                      {product.store?.images?.[0] && (
                        <div className="absolute bottom-2 left-2 w-7 h-7 rounded-lg border-2 border-white overflow-hidden shadow-md">
                          <img
                            src={`/storage/${product.store.images[0]}`}
                            alt={product.store.business_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm leading-tight">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.store?.business_name}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-violet-600">{formatPrice(product.price)}</span>
                        <button
                          onClick={e => { e.stopPropagation(); handleAddToCart(); }}
                          className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
                          title="Agregar al carrito"
                        >
                          <ShoppingBag className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Mosaic */}
      <FooterMosaic items={footerItems ?? []} />

      {/* Footer bottom */}
      <footer className="border-t border-border bg-background py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OrFlash — Todos los derechos reservados
        </p>
      </footer>

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
                    Crea una cuenta o inicia sesión como cliente para agregar productos al carrito y realizar tu pedido.
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

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, Clock, Bike, Zap, MapPin,
  ShoppingBag, ArrowRight, LogIn
} from 'lucide-react';

const stores = [
  { id: '1', name: 'Tienda Central', category: 'Abarrotes', rating: 4.8, deliveryTime: '20-30 min', deliveryFee: 2500, isOpen: true, gradient: 'from-violet-500 to-purple-600', emoji: '🛒', zone: 'Centro' },
  { id: '2', name: 'Farmacia Salud', category: 'Farmacia', rating: 4.5, deliveryTime: '15-25 min', deliveryFee: 2000, isOpen: true, gradient: 'from-blue-500 to-cyan-600', emoji: '💊', zone: 'Norte' },
  { id: '3', name: 'Pan y Café', category: 'Panadería', rating: 4.2, deliveryTime: '25-35 min', deliveryFee: 1500, isOpen: false, gradient: 'from-amber-500 to-orange-500', emoji: '🥐', zone: 'Sur' },
  { id: '4', name: 'Carnes del Sur', category: 'Carnicería', rating: 4.6, deliveryTime: '30-40 min', deliveryFee: 3000, isOpen: true, gradient: 'from-emerald-500 to-teal-600', emoji: '🥩', zone: 'Sur' },
  { id: '5', name: 'Verduras Frescas', category: 'Verdulería', rating: 4.3, deliveryTime: '20-30 min', deliveryFee: 2000, isOpen: true, gradient: 'from-pink-500 to-rose-600', emoji: '🥦', zone: 'Oriente' },
  { id: '6', name: 'Electro Hogar', category: 'Electrónica', rating: 4.7, deliveryTime: '40-60 min', deliveryFee: 5000, isOpen: true, gradient: 'from-slate-500 to-slate-700', emoji: '📱', zone: 'Centro' },
];

const products = [
  { id: 'p1', storeId: '1', storeName: 'Tienda Central', name: 'Arroz Diana 1kg', category: 'Granos', price: 4500, emoji: '🌾', gradient: 'from-amber-400 to-orange-500' },
  { id: 'p2', storeId: '1', storeName: 'Tienda Central', name: 'Aceite Girasol 1L', category: 'Aceites', price: 8900, emoji: '🫙', gradient: 'from-yellow-400 to-amber-500' },
  { id: 'p3', storeId: '2', storeName: 'Farmacia Salud', name: 'Ibuprofeno 400mg', category: 'Medicamentos', price: 5900, emoji: '💊', gradient: 'from-blue-400 to-cyan-500' },
  { id: 'p4', storeId: '2', storeName: 'Farmacia Salud', name: 'Vitamina C 1000mg', category: 'Vitaminas', price: 12000, emoji: '🍊', gradient: 'from-orange-400 to-amber-500' },
  { id: 'p5', storeId: '3', storeName: 'Pan y Café', name: 'Pan Francés x6', category: 'Panes', price: 3000, emoji: '🥖', gradient: 'from-amber-500 to-orange-600' },
  { id: 'p6', storeId: '4', storeName: 'Carnes del Sur', name: 'Pollo entero x kg', category: 'Carnes', price: 14000, emoji: '🍗', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'p7', storeId: '5', storeName: 'Verduras Frescas', name: 'Tomate chonto x kg', category: 'Verduras', price: 3200, emoji: '🍅', gradient: 'from-red-400 to-rose-500' },
  { id: 'p8', storeId: '5', storeName: 'Verduras Frescas', name: 'Aguacate x3', category: 'Frutas', price: 5500, emoji: '🥑', gradient: 'from-green-400 to-emerald-500' },
  { id: 'p9', storeId: '6', storeName: 'Electro Hogar', name: 'Audífonos Bluetooth', category: 'Audio', price: 45000, emoji: '🎧', gradient: 'from-slate-400 to-slate-600' },
];

const categories = ['Todas', 'Abarrotes', 'Farmacia', 'Panadería', 'Carnicería', 'Verdulería', 'Electrónica'];
const zones = ['Todas las zonas', 'Centro', 'Norte', 'Sur', 'Oriente'];

export default function PublicHome() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');
  const [selectedZone, setSelectedZone] = useState('Todas las zonas');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');

  const filteredStores = stores.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'Todas' || s.category === selectedCat;
    const matchZone = selectedZone === 'Todas las zonas' || s.zone === selectedZone;
    return matchSearch && matchCat && matchZone;
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.storeName.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'Todas' ||
      stores.find((s) => s.id === p.storeId)?.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Head title="OrFlash — Entregas rápidas" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-50 h-50 flex items-start justify-center overflow-visible bg-linear-to-br from-wife-600 to-wife-700">
              <img
                src="/logo-png.png"
                alt="Logo"
                className="w-full h-full object-contain translate-y-5  drop-shadow-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/register" className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
              Registrarse
            </Link>
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity">
              <LogIn className="w-4 h-4" /> Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-linear-to-br from-violet-600 via-purple-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center text-white space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {stores.filter((s) => s.isOpen).length} tiendas abiertas ahora
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tiendas o productos..."
                className="flex-1 outline-none text-foreground text-sm bg-transparent py-2"
              />
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 shrink-0"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap font-medium transition-all shrink-0 ${selectedCat === cat
                  ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium outline-none cursor-pointer"
          >
            {zones.map((z) => <option key={z}>{z}</option>)}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
          {(['stores', 'products'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
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

        {/* Grid Tiendas */}
        {activeTab === 'stores' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((store, i) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setShowModal(true)}
                className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className={`h-24 bg-linear-to-r ${store.gradient} relative flex items-center justify-center`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform">{store.emoji}</span>
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${store.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {store.isOpen ? 'Abierta' : 'Cerrada'}
                  </span>
                  <div className="absolute bottom-3 left-3 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {store.zone}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{store.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{store.category}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3 h-3 fill-amber-500" />{store.rating}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{store.deliveryTime}</span>
                    <span className="flex items-center gap-1"><Bike className="w-3 h-3" />${store.deliveryFee.toLocaleString()}</span>
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

        {/* Grid Productos */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setShowModal(true)}
                className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className={`h-28 bg-linear-to-br ${product.gradient} flex items-center justify-center`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{product.emoji}</span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.storeName}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-violet-600">${product.price.toLocaleString()}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                      className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal login requerido */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                  <h3 className="text-xl font-bold">¡Casi listo! 🎉</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Inicia sesión o crea una cuenta para realizar tu pedido y disfrutar de entregas rápidas.
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
                  onClick={() => setShowModal(false)}
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
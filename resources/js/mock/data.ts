// ============ TYPES ============
export type UserRole = 'admin' | 'client' | 'store' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  isOpen: boolean;
  address: string;
  description: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  storeId: string;
  storeName: string;
  driverId?: string;
  driverName?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  address: string;
  estimatedDelivery: string;
}

// ============ MOCK DATA ============
export const mockUsers: User[] = [
  { id: 'admin-1', name: 'Carlos Admin', email: 'admin@vecino.app', role: 'admin', avatar: '👨‍💼', phone: '+57 300 111 2233' },
  { id: 'client-1', name: 'María López', email: 'maria@email.com', role: 'client', avatar: '👩', phone: '+57 311 222 3344' },
  { id: 'client-2', name: 'Andrés García', email: 'andres@email.com', role: 'client', avatar: '👨', phone: '+57 312 333 4455' },
  { id: 'store-1', name: 'Don Pedro', email: 'pedro@tienda.com', role: 'store', avatar: '🏪', phone: '+57 320 444 5566' },
  { id: 'store-2', name: 'Sra. Rosa', email: 'rosa@farmacia.com', role: 'store', avatar: '💊', phone: '+57 321 555 6677' },
  { id: 'driver-1', name: 'Juan Repartidor', email: 'juan@driver.com', role: 'driver', avatar: '🛵', phone: '+57 315 666 7788' },
  { id: 'driver-2', name: 'Pedro Veloz', email: 'pedro@driver.com', role: 'driver', avatar: '🏍️', phone: '+57 316 777 8899' },
];

export const mockStores: Store[] = [
  { id: 'store-1', name: 'Tienda Don Pedro', category: 'Abarrotes', rating: 4.8, deliveryTime: '15-25 min', deliveryFee: 2500, image: '🏪', isOpen: true, address: 'Cra 15 #45-12', description: 'Tu tienda de barrio de confianza con todo lo que necesitas.' },
  { id: 'store-2', name: 'Farmacia Salud+', category: 'Farmacia', rating: 4.9, deliveryTime: '10-20 min', deliveryFee: 3000, image: '💊', isOpen: true, address: 'Calle 72 #10-34', description: 'Medicamentos y productos de cuidado personal.' },
  { id: 'store-3', name: 'Panadería El Trigal', category: 'Panadería', rating: 4.7, deliveryTime: '20-30 min', deliveryFee: 2000, image: '🥖', isOpen: true, address: 'Av 68 #22-15', description: 'Pan artesanal recién horneado cada día.' },
  { id: 'store-4', name: 'Frutería Tropical', category: 'Frutas', rating: 4.6, deliveryTime: '15-25 min', deliveryFee: 2500, image: '🍎', isOpen: false, address: 'Cra 7 #55-20', description: 'Las frutas más frescas del barrio.' },
  { id: 'store-5', name: 'Carnicería La Res', category: 'Carnicería', rating: 4.5, deliveryTime: '20-35 min', deliveryFee: 3500, image: '🥩', isOpen: true, address: 'Calle 80 #30-10', description: 'Cortes premium y embutidos artesanales.' },
  { id: 'store-6', name: 'Mini Mercado Express', category: 'Abarrotes', rating: 4.4, deliveryTime: '10-15 min', deliveryFee: 1500, image: '🛒', isOpen: true, address: 'Cra 13 #60-45', description: 'Todo lo esencial a un paso de tu puerta.' },
];

export const mockProducts: Product[] = [
  // Store 1 - Abarrotes
  { id: 'p1', storeId: 'store-1', name: 'Arroz Diana 1kg', description: 'Arroz blanco premium', price: 4500, image: '🍚', category: 'Granos', inStock: true },
  { id: 'p2', storeId: 'store-1', name: 'Aceite Girasol 1L', description: 'Aceite vegetal', price: 8900, image: '🫗', category: 'Aceites', inStock: true },
  { id: 'p3', storeId: 'store-1', name: 'Leche Entera 1L', description: 'Leche pasteurizada', price: 3800, image: '🥛', category: 'Lácteos', inStock: true },
  { id: 'p4', storeId: 'store-1', name: 'Huevos x12', description: 'Huevos AA frescos', price: 7200, image: '🥚', category: 'Básicos', inStock: true },
  { id: 'p5', storeId: 'store-1', name: 'Azúcar 1kg', description: 'Azúcar refinada', price: 3200, image: '🧂', category: 'Básicos', inStock: false },
  { id: 'p6', storeId: 'store-1', name: 'Café Sello Rojo 500g', description: 'Café molido', price: 12500, image: '☕', category: 'Bebidas', inStock: true },
  // Store 2 - Farmacia
  { id: 'p7', storeId: 'store-2', name: 'Acetaminofén x10', description: 'Tabletas 500mg', price: 3500, image: '💊', category: 'Medicamentos', inStock: true },
  { id: 'p8', storeId: 'store-2', name: 'Ibuprofeno x10', description: 'Tabletas 400mg', price: 5200, image: '💊', category: 'Medicamentos', inStock: true },
  { id: 'p9', storeId: 'store-2', name: 'Crema Dental', description: 'Colgate Triple Acción', price: 6800, image: '🪥', category: 'Higiene', inStock: true },
  { id: 'p10', storeId: 'store-2', name: 'Jabón Antibacterial', description: 'Protex 3 pack', price: 9500, image: '🧼', category: 'Higiene', inStock: true },
  // Store 3 - Panadería
  { id: 'p11', storeId: 'store-3', name: 'Pan Francés x6', description: 'Recién horneado', price: 3000, image: '🥖', category: 'Panes', inStock: true },
  { id: 'p12', storeId: 'store-3', name: 'Croissant x4', description: 'Mantequilla francesa', price: 8500, image: '🥐', category: 'Panes', inStock: true },
  { id: 'p13', storeId: 'store-3', name: 'Torta de Chocolate', description: 'Porción individual', price: 6000, image: '🍰', category: 'Postres', inStock: true },
  // Store 5 - Carnicería
  { id: 'p14', storeId: 'store-5', name: 'Pechuga de Pollo 1kg', description: 'Sin hueso', price: 14500, image: '🍗', category: 'Aves', inStock: true },
  { id: 'p15', storeId: 'store-5', name: 'Lomo de Res 1kg', description: 'Corte premium', price: 32000, image: '🥩', category: 'Res', inStock: true },
  { id: 'p16', storeId: 'store-5', name: 'Chorizo x5', description: 'Artesanal', price: 11000, image: '🌭', category: 'Embutidos', inStock: true },
  // Store 6
  { id: 'p17', storeId: 'store-6', name: 'Coca-Cola 1.5L', description: 'Bebida gaseosa', price: 4200, image: '🥤', category: 'Bebidas', inStock: true },
  { id: 'p18', storeId: 'store-6', name: 'Papas Margarita', description: 'Paquete grande', price: 5500, image: '🍟', category: 'Snacks', inStock: true },
];

export const mockOrders: Order[] = [
  { id: 'ORD-001', clientId: 'client-1', clientName: 'María López', storeId: 'store-1', storeName: 'Tienda Don Pedro', driverId: 'driver-1', driverName: 'Juan Repartidor', items: [{ productId: 'p1', name: 'Arroz Diana 1kg', quantity: 2, price: 4500 }, { productId: 'p3', name: 'Leche Entera 1L', quantity: 3, price: 3800 }], total: 22900, status: 'in_transit', createdAt: '2026-03-16T10:30:00', address: 'Calle 45 #12-30, Apto 502', estimatedDelivery: '11:05 AM' },
  { id: 'ORD-002', clientId: 'client-2', clientName: 'Andrés García', storeId: 'store-3', storeName: 'Panadería El Trigal', driverId: 'driver-2', driverName: 'Pedro Veloz', items: [{ productId: 'p11', name: 'Pan Francés x6', quantity: 1, price: 3000 }, { productId: 'p12', name: 'Croissant x4', quantity: 2, price: 8500 }], total: 22000, status: 'preparing', createdAt: '2026-03-16T10:45:00', address: 'Cra 20 #68-15', estimatedDelivery: '11:25 AM' },
  { id: 'ORD-003', clientId: 'client-1', clientName: 'María López', storeId: 'store-2', storeName: 'Farmacia Salud+', items: [{ productId: 'p7', name: 'Acetaminofén x10', quantity: 1, price: 3500 }], total: 6500, status: 'pending', createdAt: '2026-03-16T11:00:00', address: 'Calle 45 #12-30, Apto 502', estimatedDelivery: '11:30 AM' },
  { id: 'ORD-004', clientId: 'client-2', clientName: 'Andrés García', storeId: 'store-5', storeName: 'Carnicería La Res', driverId: 'driver-1', driverName: 'Juan Repartidor', items: [{ productId: 'p14', name: 'Pechuga de Pollo 1kg', quantity: 2, price: 14500 }, { productId: 'p16', name: 'Chorizo x5', quantity: 1, price: 11000 }], total: 43500, status: 'delivered', createdAt: '2026-03-16T08:15:00', address: 'Cra 20 #68-15', estimatedDelivery: '9:00 AM' },
  { id: 'ORD-005', clientId: 'client-1', clientName: 'María López', storeId: 'store-6', storeName: 'Mini Mercado Express', driverId: 'driver-2', driverName: 'Pedro Veloz', items: [{ productId: 'p17', name: 'Coca-Cola 1.5L', quantity: 3, price: 4200 }, { productId: 'p18', name: 'Papas Margarita', quantity: 2, price: 5500 }], total: 24100, status: 'delivered', createdAt: '2026-03-15T14:20:00', address: 'Calle 45 #12-30, Apto 502', estimatedDelivery: '3:00 PM' },
  { id: 'ORD-006', clientId: 'client-2', clientName: 'Andrés García', storeId: 'store-1', storeName: 'Tienda Don Pedro', items: [{ productId: 'p6', name: 'Café Sello Rojo 500g', quantity: 1, price: 12500 }], total: 15000, status: 'confirmed', createdAt: '2026-03-16T11:15:00', address: 'Cra 20 #68-15', estimatedDelivery: '11:50 AM' },
];

export const categories = [
  { id: 'abarrotes', name: 'Abarrotes', icon: '🛒' },
  { id: 'farmacia', name: 'Farmacia', icon: '💊' },
  { id: 'panaderia', name: 'Panadería', icon: '🥖' },
  { id: 'frutas', name: 'Frutas', icon: '🍎' },
  { id: 'carniceria', name: 'Carnicería', icon: '🥩' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
];

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  picked_up: 'Recogido',
  in_transit: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const statusColors: Record<OrderStatus, string> = {
  pending: 'text-warning',
  confirmed: 'text-info',
  preparing: 'text-primary',
  ready: 'text-accent',
  picked_up: 'text-info',
  in_transit: 'text-primary',
  delivered: 'text-success',
  cancelled: 'text-destructive',
};

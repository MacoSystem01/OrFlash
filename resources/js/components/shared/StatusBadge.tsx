// ─── Tipos ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

const statusLabels: Record<OrderStatus, string> = {
  pending:    'Pendiente',
  confirmed:  'Confirmado',
  preparing:  'Preparando',
  ready:      'Listo',
  picked_up:  'Recogido',
  in_transit: 'En camino',
  delivered:  'Entregado',
  cancelled:  'Cancelado',
};

const statusColors: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100  text-yellow-700  dark:bg-yellow-900/40  dark:text-yellow-300',
  confirmed:  'bg-blue-100    text-blue-700    dark:bg-blue-900/40    dark:text-blue-300',
  preparing:  'bg-violet-100  text-violet-700  dark:bg-violet-900/40  dark:text-violet-300',
  ready:      'bg-teal-100    text-teal-700    dark:bg-teal-900/40    dark:text-teal-300',
  picked_up:  'bg-cyan-100    text-cyan-700    dark:bg-cyan-900/40    dark:text-cyan-300',
  in_transit: 'bg-blue-100    text-blue-700    dark:bg-blue-900/40    dark:text-blue-300',
  delivered:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled:  'bg-red-100     text-red-700     dark:bg-red-900/40     dark:text-red-300',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const label = statusLabels[status as OrderStatus] ?? status;
  const color = statusColors[status as OrderStatus] ?? 'bg-slate-100 text-slate-700';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
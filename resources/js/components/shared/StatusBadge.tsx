import { type OrderStatus, statusLabels, statusColors } from '@/mock/data';

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary ${statusColors[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse-glow`} />
      {statusLabels[status]}
    </span>
  );
};

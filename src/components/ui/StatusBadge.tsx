import { statusClasses, statusLabels } from '@/lib/status';
import type { ZoneStatus } from '@/types/domain';

export function StatusBadge({ status }: { status: ZoneStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusClasses[status]}`}>{statusLabels[status]}</span>;
}

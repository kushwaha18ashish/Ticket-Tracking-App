import type { OverallStatus, TicketStatusValue } from '@/types';
import { STATUS_LABELS } from '@/lib/constants';

type StatusType = TicketStatusValue | OverallStatus;

const styles: Record<StatusType, string> = {
  PASS: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  FAIL: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  BLOCKED:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  IN_PROGRESS:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  TBD: 'bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50',
};

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${styles[status]}`}
    >
      {STATUS_LABELS[status as TicketStatusValue] ?? status.replace('_', ' ')}
    </span>
  );
}

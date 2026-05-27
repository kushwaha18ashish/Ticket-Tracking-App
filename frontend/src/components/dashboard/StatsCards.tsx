import type { TicketStats } from '@/types';
import { Card } from '@/components/ui/Card';

interface StatsCardsProps {
  stats?: TicketStats;
  loading?: boolean;
}

const items = [
  { key: 'total', label: 'Total Tickets', color: 'text-slate-700 dark:text-slate-200' },
  { key: 'passed', label: 'Passed', color: 'text-green-600' },
  { key: 'failed', label: 'Failed', color: 'text-red-600' },
  { key: 'inProgress', label: 'In Progress', color: 'text-blue-600' },
  { key: 'blocked', label: 'Blocked', color: 'text-yellow-600' },
] as const;

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ key, label, color }) => (
        <Card key={key} className="!p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>
            {loading ? '—' : (stats?.[key] ?? 0)}
          </p>
        </Card>
      ))}
    </div>
  );
}

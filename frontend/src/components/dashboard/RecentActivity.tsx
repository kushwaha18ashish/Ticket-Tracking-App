import { Link } from 'react-router-dom';
import type { RecentActivity as Activity } from '@/types';
import { ScrollPanel } from '@/components/ui/ScrollPanel';
import { ENVIRONMENT_LABELS, STATUS_LABELS } from '@/lib/constants';

interface RecentActivityProps {
  items?: Activity[];
  loading?: boolean;
  /** Match height with sibling panels on dashboard */
  heightClass?: string;
  className?: string;
}

function formatAction(item: Activity): string {
  switch (item.action) {
    case 'STATUS_CHANGE':
      return `${ENVIRONMENT_LABELS[item.environment!]}: ${STATUS_LABELS[item.previousStatus!]} → ${STATUS_LABELS[item.newStatus!]}`;
    case 'PROMOTION':
      return `Promoted ${ENVIRONMENT_LABELS[item.fromEnvironment!]} → ${ENVIRONMENT_LABELS[item.toEnvironment!]}`;
    case 'CREATED':
      return 'Ticket created';
    case 'COMMENT':
      return 'Added comment';
    case 'ISSUE_LOGGED':
    case 'ISSUE_UPDATED':
    case 'ISSUE_REMOVED':
      return item.message || 'Issue update';
    default:
      return item.message || item.action;
  }
}

export function RecentActivityList({
  items,
  loading,
  heightClass = 'h-[min(420px,42vh)] min-h-[260px]',
  className = '',
}: RecentActivityProps) {
  const count = items?.length ?? 0;

  return (
    <ScrollPanel
      title="Recent Activity"
      heightClass={heightClass}
      className={`w-full ${className}`}
      footer={
        !loading && count > 0
          ? `${count} recent ${count === 1 ? 'entry' : 'entries'} · scroll for more`
          : undefined
      }
    >
      {loading && (
        <p className="text-sm text-slate-500">Loading activity...</p>
      )}
      {!loading && count === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          No recent activity.
        </p>
      )}
      <ul className="space-y-3">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                to={`/tickets/${item.ticket.id}`}
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {item.ticket.ticketId}
              </Link>
              <span className="text-slate-500 dark:text-slate-400">
                {formatAction(item)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {item.user.name} · {new Date(item.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </ScrollPanel>
  );
}

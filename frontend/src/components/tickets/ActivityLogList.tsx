import type { ActivityLog } from '@/types';
import { ENVIRONMENT_LABELS, STATUS_LABELS } from '@/lib/constants';
import { Card } from '@/components/ui/Card';

interface ActivityLogListProps {
  logs?: ActivityLog[];
}

function describe(log: ActivityLog): string {
  switch (log.action) {
    case 'STATUS_CHANGE':
      return `${ENVIRONMENT_LABELS[log.environment!]}: ${STATUS_LABELS[log.previousStatus!]} → ${STATUS_LABELS[log.newStatus!]}`;
    case 'PROMOTION':
      return `Promoted from ${ENVIRONMENT_LABELS[log.fromEnvironment!]} to ${ENVIRONMENT_LABELS[log.toEnvironment!]}`;
    case 'CREATED':
      return 'Ticket created';
    case 'COMMENT':
      return `Comment: ${log.message?.slice(0, 80)}`;
    case 'UPDATED':
      return log.message
        ? `Details updated (${log.message.replace('Updated: ', '')})`
        : 'Ticket details updated';
    case 'ISSUE_LOGGED':
    case 'ISSUE_UPDATED':
    case 'ISSUE_REMOVED':
      return log.message || log.action.replace(/_/g, ' ').toLowerCase();
    default:
      return log.message || log.action;
  }
}

export function ActivityLogList({ logs }: ActivityLogListProps) {
  return (
    <Card title="Activity Log">
      {!logs?.length && (
        <p className="text-sm text-slate-500">No activity yet.</p>
      )}
      <ul className="max-h-96 space-y-3 overflow-y-auto">
        {logs?.map((log) => (
          <li
            key={log.id}
            className="rounded-lg border border-slate-100 p-3 dark:border-slate-700"
          >
            <p className="text-sm text-slate-800 dark:text-slate-200">
              {describe(log)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {log.user.name} · {new Date(log.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

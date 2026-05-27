import type { Environment, Ticket, TicketStatusValue } from '@/types';
import { ENVIRONMENT_LABELS, ENVIRONMENTS } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface EnvironmentTimelineProps {
  ticket: Ticket;
}

function stepState(
  env: Environment,
  current: Environment,
  status: TicketStatusValue
): 'completed' | 'current' | 'upcoming' {
  const order = ENVIRONMENTS.indexOf(env);
  const currentIdx = ENVIRONMENTS.indexOf(current);
  if (order < currentIdx) return status === 'PASS' ? 'completed' : 'current';
  if (order === currentIdx) return 'current';
  return 'upcoming';
}

export function EnvironmentTimeline({ ticket }: EnvironmentTimelineProps) {
  return (
    <ol className="relative border-l border-slate-200 dark:border-slate-600">
      {ENVIRONMENTS.map((env) => {
        const status = ticket.statuses[env];
        const state = stepState(env, ticket.currentEnvironment, status);
        const dotColor =
          state === 'completed'
            ? 'bg-green-500'
            : state === 'current'
              ? 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900'
              : 'bg-slate-300 dark:bg-slate-600';

        return (
          <li key={env} className="mb-8 ml-6 last:mb-0">
            <span
              className={`absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full ${dotColor}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                {ENVIRONMENT_LABELS[env]}
              </h4>
              <StatusBadge status={status} />
              {ticket.currentEnvironment === env && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Current
                </span>
              )}
            </div>
            {status === 'PASS' && state === 'completed' && (
              <p className="mt-1 text-xs text-green-600">Validated</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

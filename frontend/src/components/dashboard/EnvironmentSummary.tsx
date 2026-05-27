import { useMemo } from 'react';
import type { Environment, Ticket } from '@/types';
import { ENVIRONMENT_LABELS, ENVIRONMENTS } from '@/lib/constants';
import {
  countTicketsByEnvironment,
  getTotalFromEnvironmentCounts,
} from '@/lib/environmentCounts';
import { Card } from '@/components/ui/Card';

interface EnvironmentSummaryProps {
  tickets?: Ticket[];
  loading?: boolean;
}

const ENV_STYLES: Record<
  Environment,
  { icon: string; bar: string; card: string; accent: string }
> = {
  THOR: {
    icon: '⚡',
    bar: 'bg-blue-500',
    card: 'hover:border-blue-300 hover:shadow-md dark:hover:border-blue-600',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  QA: {
    icon: '🧪',
    bar: 'bg-indigo-500',
    card: 'hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-600',
    accent: 'text-indigo-600 dark:text-indigo-400',
  },
  RELEASE: {
    icon: '🚀',
    bar: 'bg-violet-500',
    card: 'hover:border-violet-300 hover:shadow-md dark:hover:border-violet-600',
    accent: 'text-violet-600 dark:text-violet-400',
  },
  PRODUCTION: {
    icon: '✓',
    bar: 'bg-emerald-500',
    card: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:shadow-lg dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:border-emerald-600',
    accent: 'text-emerald-700 dark:text-emerald-400',
  },
};

function CountDisplay({ value, loading }: { value: number; loading?: boolean }) {
  if (loading) {
    return <span className="text-2xl font-bold text-slate-300">—</span>;
  }
  return (
    <span
      key={value}
      className="tabular-nums text-2xl font-bold text-slate-900 transition-all duration-300 dark:text-white"
    >
      {value}
    </span>
  );
}

export function EnvironmentSummary({
  tickets = [],
  loading,
}: EnvironmentSummaryProps) {
  const counts = useMemo(
    () => countTicketsByEnvironment(tickets),
    [tickets]
  );
  const total = useMemo(() => getTotalFromEnvironmentCounts(counts), [counts]);

  return (
    <Card
      title="Environment Summary"
      className="w-full shadow-sm"
      bodyClassName="p-4 sm:p-5"
    >
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Live count of tickets in each environment (by current stage)
      </p>

      <ul className="space-y-3">
        {ENVIRONMENTS.map((env) => {
          const count = counts[env];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const style = ENV_STYLES[env];
          const isProduction = env === 'PRODUCTION';

          return (
            <li
              key={env}
              className={`rounded-xl border border-slate-200 p-4 transition-all duration-200 dark:border-slate-700 ${style.card}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
                      isProduction
                        ? 'bg-emerald-100 dark:bg-emerald-900/50'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                    aria-hidden
                  >
                    {style.icon}
                  </span>
                  <div>
                    <p
                      className={`font-semibold ${style.accent} ${
                        isProduction ? 'text-emerald-800 dark:text-emerald-300' : ''
                      }`}
                    >
                      {ENVIRONMENT_LABELS[env]}
                    </p>
                    {total > 0 && (
                      <p className="text-xs text-slate-400">{pct}% of tickets</p>
                    )}
                  </div>
                </div>
                <CountDisplay value={count} loading={loading} />
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${style.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
        <span className="text-slate-500">Total tickets</span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {loading ? '—' : total}
        </span>
      </div>
    </Card>
  );
}

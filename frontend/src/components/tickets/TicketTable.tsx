import { Link } from 'react-router-dom';
import type { Ticket } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ENVIRONMENT_LABELS } from '@/lib/constants';
import { BasecampLink } from './BasecampLink';

interface TicketTableProps {
  tickets: Ticket[];
}

export function TicketTable({ tickets }: TicketTableProps) {
  return (
    <div className="-m-4 sm:-m-5">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
        <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm dark:bg-slate-900/95">
          <tr>
            {[
              'Ticket ID',
              'Title',
              'Basecamp',
              'Current Env',
              'Thor',
              'QA',
              'Release',
              'Production',
              'Overall',
              'Last Updated',
              'Actions',
            ].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap bg-slate-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/95"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-800">
          {tickets.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="px-4 py-12 text-center text-slate-500"
              >
                No tickets found. Create one to get started.
              </td>
            </tr>
          )}
          {tickets.map((t) => (
            <tr
              key={t.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td className="whitespace-nowrap px-3 py-3 font-medium">
                <Link
                  to={`/tickets/${t.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {t.ticketId}
                </Link>
              </td>
              <td className="max-w-[200px] truncate px-3 py-3">{t.title}</td>
              <td className="px-3 py-3">
                <BasecampLink url={t.basecampLink} compact />
              </td>
              <td className="px-3 py-3">
                {ENVIRONMENT_LABELS[t.currentEnvironment]}
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={t.thorStatus} />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={t.qaStatus} />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={t.releaseStatus} />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={t.productionStatus} />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={t.overallStatus} />
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                {new Date(t.updatedAt).toLocaleString()}
              </td>
              <td className="px-3 py-3">
                <Link
                  to={`/tickets/${t.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

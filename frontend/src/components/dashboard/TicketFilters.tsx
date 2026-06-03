import type { TicketFilters as Filters } from '@/types';
import { ENVIRONMENT_LABELS, ENVIRONMENTS, STATUS_LABELS, FILTER_STATUS_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

interface TicketFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onExport: () => void;
  onCreate: () => void;
}

export function TicketFiltersBar({
  filters,
  onChange,
  onExport,
  onCreate,
}: TicketFiltersProps) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Search
          </label>
          <input
            type="text"
            placeholder="Ticket ID, title, notes..."
            value={filters.search || ''}
            onChange={(e) => update({ search: e.target.value || undefined })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Ticket ID
          </label>
          <input
            type="text"
            value={filters.ticketId || ''}
            onChange={(e) => update({ ticketId: e.target.value || undefined })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Environment
          </label>
          <select
            value={filters.environment || ''}
            onChange={(e) =>
              update({
                environment: (e.target.value || undefined) as Filters['environment'],
              })
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="">All</option>
            {ENVIRONMENTS.map((e) => (
              <option key={e} value={e}>
                {ENVIRONMENT_LABELS[e]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) =>
              update({
                status: (e.target.value || undefined) as Filters['status'],
              })
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="">All</option>
            {FILTER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            From
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => update({ dateFrom: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            To
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => update({ dateTo: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Sort
          </label>
          <select
            value={`${filters.sortBy || 'updatedAt'}-${filters.sortOrder || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [
                Filters['sortBy'],
                Filters['sortOrder'],
              ];
              update({ sortBy, sortOrder });
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="updatedAt-desc">Last Updated ↓</option>
            <option value="updatedAt-asc">Last Updated ↑</option>
            <option value="createdAt-desc">Created ↓</option>
            <option value="createdAt-asc">Created ↑</option>
            <option value="ticketId-asc">Ticket ID A-Z</option>
            <option value="ticketId-desc">Ticket ID Z-A</option>
            <option value="title-asc">Title A-Z</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onCreate}>+ New Ticket</Button>
        <Button variant="secondary" onClick={onExport}>
          Export CSV
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            onChange({
              sortBy: 'updatedAt',
              sortOrder: 'desc',
            })
          }
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

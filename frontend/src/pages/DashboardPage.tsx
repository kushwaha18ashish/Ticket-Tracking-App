import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import type { TicketFilters } from '@/types';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentActivityList } from '@/components/dashboard/RecentActivity';
import { EnvironmentSummary } from '@/components/dashboard/EnvironmentSummary';
import { TicketFiltersBar } from '@/components/dashboard/TicketFilters';
import { ScrollPanel } from '@/components/ui/ScrollPanel';
import { TicketTable } from '@/components/tickets/TicketTable';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import {
  useTickets,
  useTicketStats,
  useRecentActivity,
  useTicketMutations,
} from '@/hooks/useTickets';
import { exportTicketsToCsv } from '@/lib/exportCsv';

const defaultFilters: TicketFilters = {
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

/** Unfiltered ticket list for environment summary counts */
const summaryListFilters: TicketFilters = {
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

export function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<TicketFilters>(defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const debouncedFilters = useMemo(() => filters, [filters]);

  const { data: tickets, isLoading } = useTickets(debouncedFilters);
  const { data: allTickets, isLoading: summaryLoading } =
    useTickets(summaryListFilters);
  const { data: stats, isLoading: statsLoading } = useTicketStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { createTicket } = useTicketMutations();

  const handleCreate = async (data: {
    ticketId: string;
    title: string;
    basecampLink?: string;
    notes?: string;
  }) => {
    try {
      await createTicket.mutateAsync(data);
      toast.success('Ticket created');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create ticket');
      throw e;
    }
  };

  const handleExport = () => {
    if (!tickets?.length) {
      toast.error('No tickets to export');
      return;
    }
    exportTicketsToCsv(tickets);
    toast.success('CSV exported');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          {user?.name
            ? `${user.name}'s workspace — only your tickets are shown here`
            : 'Track validation across Thor, QA, Release, and Production'}
        </p>
      </div>

      <StatsCards stats={stats} loading={statsLoading} />

      <div className="space-y-4">
        <TicketFiltersBar
          filters={filters}
          onChange={setFilters}
          onExport={handleExport}
          onCreate={() => setModalOpen(true)}
        />
        <ScrollPanel
          title="All Tickets"
          heightClass="h-[min(500px,50vh)] min-h-[280px] sm:min-h-[320px]"
          headerRight={
            !isLoading && tickets ? (
              <span className="text-xs font-normal text-slate-500">
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
              </span>
            ) : null
          }
          footer={
            !isLoading && tickets && tickets.length > 0
              ? 'Scroll vertically to see more tickets · table header stays fixed'
              : undefined
          }
        >
          {isLoading ? (
            <p className="py-12 text-center text-slate-500">Loading tickets...</p>
          ) : (
            <TicketTable tickets={tickets ?? []} />
          )}
        </ScrollPanel>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          <div className="relative flex min-h-0 lg:col-span-2">
            <RecentActivityList
              items={activity}
              loading={activityLoading}
              className="lg:absolute lg:inset-0"
              heightClass="h-[min(420px,42vh)] min-h-[260px] lg:h-auto lg:flex-1 lg:min-h-0"
            />
          </div>
          <div className="flex min-h-0 min-w-0">
            <EnvironmentSummary
              tickets={allTickets}
              loading={summaryLoading}
            />
          </div>
        </div>
      </div>

      <CreateTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        loading={createTicket.isPending}
      />
    </div>
  );
}

import type { Ticket } from '@/types';
import { ENVIRONMENT_LABELS } from './constants';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTicketsToCsv(tickets: Ticket[]): void {
  const headers = [
    'Ticket ID',
    'Title',
    'Basecamp Link',
    'Current Environment',
    'Thor Status',
    'QA Status',
    'Release Status',
    'Production Status',
    'Overall Status',
    'Created',
    'Last Updated',
  ];

  const rows = tickets.map((t) =>
    [
      t.ticketId,
      t.title,
      t.basecampLink || '',
      ENVIRONMENT_LABELS[t.currentEnvironment],
      t.thorStatus,
      t.qaStatus,
      t.releaseStatus,
      t.productionStatus,
      t.overallStatus,
      new Date(t.createdAt).toISOString(),
      new Date(t.updatedAt).toISOString(),
    ].map(escapeCsv).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

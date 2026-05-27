import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTicket } from '@/hooks/useTickets';
import { TicketDetailPanel } from '@/components/tickets/TicketDetailPanel';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, error } = useTicket(id!);

  if (isLoading) {
    return <p className="text-slate-500">Loading ticket...</p>;
  }

  if (error || !ticket) {
    return (
      <div>
        <p className="text-red-600">Ticket not found.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to dashboard
      </Link>
      <TicketDetailPanel
        ticket={ticket}
        onDeleted={() => navigate('/')}
      />
    </div>
  );
}

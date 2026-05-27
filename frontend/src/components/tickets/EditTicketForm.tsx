import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import type { Ticket } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTicketMutations } from '@/hooks/useTickets';

interface EditTicketFormProps {
  ticket: Ticket;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white';

export function EditTicketForm({ ticket }: EditTicketFormProps) {
  const { updateTicket } = useTicketMutations();
  const [editing, setEditing] = useState(false);
  const [ticketId, setTicketId] = useState(ticket.ticketId);
  const [title, setTitle] = useState(ticket.title);
  const [basecampLink, setBasecampLink] = useState(ticket.basecampLink ?? '');
  const [notes, setNotes] = useState(ticket.notes ?? '');

  useEffect(() => {
    if (!editing) {
      setTicketId(ticket.ticketId);
      setTitle(ticket.title);
      setBasecampLink(ticket.basecampLink ?? '');
      setNotes(ticket.notes ?? '');
    }
  }, [ticket, editing]);

  const resetForm = () => {
    setTicketId(ticket.ticketId);
    setTitle(ticket.title);
    setBasecampLink(ticket.basecampLink ?? '');
    setNotes(ticket.notes ?? '');
    setEditing(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim() || !title.trim()) {
      toast.error('Ticket ID and title are required');
      return;
    }

    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        data: {
          ticketId: ticketId.trim(),
          title: title.trim(),
          basecampLink: basecampLink.trim() || null,
          notes: notes.trim() || null,
        },
      });
      toast.success('Ticket details saved');
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  if (!editing) {
    return (
      <Card title="Ticket Details">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">Ticket ID</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {ticket.ticketId}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Title</dt>
            <dd className="text-slate-900 dark:text-white">{ticket.title}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Basecamp Link</dt>
            <dd className="break-all text-slate-700 dark:text-slate-300">
              {ticket.basecampLink || '—'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Notes</dt>
            <dd className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {ticket.notes || '—'}
            </dd>
          </div>
        </dl>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => setEditing(true)}
        >
          Edit Details
        </Button>
      </Card>
    );
  }

  return (
    <Card title="Edit Ticket Details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500">Ticket ID *</label>
          <input
            required
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className={inputClass}
            placeholder="TKT-1006"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">
            Basecamp Link
          </label>
          <input
            type="url"
            value={basecampLink}
            onChange={(e) => setBasecampLink(e.target.value)}
            className={inputClass}
            placeholder="https://3.basecamp.com/..."
          />
          <p className="mt-1 text-xs text-slate-500">Leave empty to remove the link</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Validation notes, corrections, etc."
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={updateTicket.isPending}>
            Save Changes
          </Button>
          <Button type="button" variant="ghost" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

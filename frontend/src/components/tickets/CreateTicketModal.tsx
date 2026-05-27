import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    ticketId: string;
    title: string;
    basecampLink?: string;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function CreateTicketModal({
  open,
  onClose,
  onSubmit,
  loading,
}: CreateTicketModalProps) {
  const [ticketId, setTicketId] = useState('');
  const [title, setTitle] = useState('');
  const [basecampLink, setBasecampLink] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ticketId,
      title,
      basecampLink: basecampLink || undefined,
      notes: notes || undefined,
    });
    setTicketId('');
    setTitle('');
    setBasecampLink('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Create Ticket
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">
              Ticket ID *
            </label>
            <input
              required
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              placeholder="TKT-1006"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">
              Title *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              placeholder="https://3.basecamp.com/..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

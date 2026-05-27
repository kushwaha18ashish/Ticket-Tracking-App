import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import type { Ticket, TicketStatusValue } from '@/types';
import {
  ENVIRONMENT_LABELS,
  PROMOTE_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EnvironmentTimeline } from './EnvironmentTimeline';
import { ActivityLogList } from './ActivityLogList';
import { EditTicketForm } from './EditTicketForm';
import { TicketIssuesSection } from './TicketIssuesSection';
import { useTicketMutations } from '@/hooks/useTickets';

interface TicketDetailPanelProps {
  ticket: Ticket;
  onDeleted?: () => void;
}

export function TicketDetailPanel({ ticket, onDeleted }: TicketDetailPanelProps) {
  const { updateStatus, promote, addComment, deleteTicket } = useTicketMutations();
  const [comment, setComment] = useState('');
  const env = ticket.currentEnvironment;
  const currentStatus = ticket.statuses[env];

  const handleStatus = async (status: TicketStatusValue) => {
    try {
      await updateStatus.mutateAsync({ id: ticket.id, environment: env, status });
      toast.success(`${ENVIRONMENT_LABELS[env]} set to ${STATUS_LABELS[status]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const handlePromote = async () => {
    try {
      await promote.mutateAsync(ticket.id);
      toast.success('Ticket promoted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Promotion failed');
    }
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await addComment.mutateAsync({ id: ticket.id, content: comment });
      setComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ticket ${ticket.ticketId}?\n\nThis permanently removes the ticket, its comments, and activity history.`
    );
    if (!confirmed) return;
    try {
      await deleteTicket.mutateAsync(ticket.id);
      toast.success('Ticket deleted');
      onDeleted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete ticket');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{ticket.ticketId}</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {ticket.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.overallStatus} size="md" />
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleteTicket.isPending}
              >
                Delete Ticket
              </Button>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">
                Current Environment
              </dt>
              <dd className="font-medium">
                {ENVIRONMENT_LABELS[ticket.currentEnvironment]}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">
                Current Env Status
              </dt>
              <dd>
                <StatusBadge status={currentStatus} size="md" />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Created</dt>
              <dd>{new Date(ticket.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">
                Last Updated
              </dt>
              <dd>{new Date(ticket.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </Card>

        <EditTicketForm ticket={ticket} />

        <Card title={`Update ${ENVIRONMENT_LABELS[env]} Status`}>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={
                  s === 'PASS'
                    ? 'success'
                    : s === 'FAIL'
                      ? 'danger'
                      : 'secondary'
                }
                onClick={() => handleStatus(s)}
                loading={updateStatus.isPending}
                disabled={currentStatus === s}
              >
                {STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
          {ticket.canPromote && (
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <Button
                variant="primary"
                onClick={handlePromote}
                loading={promote.isPending}
              >
                {PROMOTE_LABELS[env]}
              </Button>
              <p className="mt-2 text-xs text-slate-500">
                Promotion is manual. Current environment must be Pass.
              </p>
            </div>
          )}
        </Card>

        <TicketIssuesSection ticket={ticket} />

        <Card title="Comments">
          <form onSubmit={handleComment} className="space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Add a comment..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
            <Button type="submit" loading={addComment.isPending}>
              Add Comment
            </Button>
          </form>
          <ul className="mt-4 space-y-3">
            {ticket.comments?.map((c) => (
              <li
                key={c.id}
                className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50"
              >
                <p className="text-sm">{c.content}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {c.user.name} · {new Date(c.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Environment Progression">
          <EnvironmentTimeline ticket={ticket} />
        </Card>
        <ActivityLogList logs={ticket.activityLogs} />
      </div>
    </div>
  );
}

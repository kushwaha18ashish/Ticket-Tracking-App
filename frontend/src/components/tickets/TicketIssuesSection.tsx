import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import type { IssueStatus, Ticket, TicketIssue } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ISSUE_STATUS_LABELS,
  ISSUE_STATUS_OPTIONS,
  ISSUE_STATUS_STYLES,
} from '@/lib/issueConstants';
import { useTicketMutations } from '@/hooks/useTickets';

interface TicketIssuesSectionProps {
  ticket: Ticket;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white';

function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ISSUE_STATUS_STYLES[status]}`}
    >
      {ISSUE_STATUS_LABELS[status]}
    </span>
  );
}

function IssueRow({
  issue,
  ticketId,
}: {
  issue: TicketIssue;
  ticketId: string;
}) {
  const { updateIssue, deleteIssue } = useTicketMutations();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [githubUrl, setGithubUrl] = useState(issue.githubUrl);
  const [notes, setNotes] = useState(issue.notes ?? '');
  const [status, setStatus] = useState(issue.status);

  const copyLink = async () => {
    await navigator.clipboard.writeText(issue.githubUrl);
    toast.success('GitHub link copied');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateIssue.mutateAsync({
        ticketId,
        issueId: issue.id,
        data: { title, githubUrl, notes: notes || null, status },
      });
      toast.success('Issue updated');
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove issue "${issue.title}" from this ticket?`)) return;
    try {
      await deleteIssue.mutateAsync({ ticketId, issueId: issue.id });
      toast.success('Issue removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (editing) {
    return (
      <li className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
        <form onSubmit={handleSave} className="space-y-3">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Issue title"
          />
          <input
            required
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className={inputClass}
            placeholder="https://github.com/org/repo/issues/123"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as IssueStatus)}
            className={inputClass}
          >
            {ISSUE_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ISSUE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Notes (optional)"
          />
          <div className="flex gap-2">
            <Button type="submit" loading={updateIssue.isPending}>
              Save
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-slate-900 dark:text-white">
              {issue.title}
            </h4>
            <IssueStatusBadge status={issue.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <a
              href={issue.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Open on GitHub
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Copy link
            </button>
          </div>
          {issue.notes && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {issue.notes}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            Logged by {issue.user.name} ·{' '}
            {new Date(issue.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteIssue.isPending}
          >
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}

export function TicketIssuesSection({ ticket }: TicketIssuesSectionProps) {
  const { createIssue } = useTicketMutations();
  const [title, setTitle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<IssueStatus>('OPEN');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !githubUrl.trim()) {
      toast.error('Title and GitHub URL are required');
      return;
    }
    try {
      await createIssue.mutateAsync({
        ticketId: ticket.id,
        data: {
          title: title.trim(),
          githubUrl: githubUrl.trim(),
          notes: notes.trim() || undefined,
          status,
        },
      });
      setTitle('');
      setGithubUrl('');
      setNotes('');
      setStatus('OPEN');
      setShowForm(false);
      toast.success('GitHub issue linked to ticket');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add issue');
    }
  };

  const issues = ticket.issues ?? [];

  return (
    <Card title="GitHub bugs found during validation">
      <p className="mb-4 text-sm text-slate-500">
        Log bugs you filed on GitHub while validating this ticket. They stay
        linked to {ticket.ticketId} so you can track fixes against the original
        QA work.
      </p>

      {!showForm ? (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          + Link GitHub issue
        </Button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-600">
          <div>
            <label className="text-xs font-medium text-slate-500">
              Issue title *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Login button broken on mobile"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">
              GitHub issue URL *
            </label>
            <input
              required
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className={inputClass}
              placeholder="https://github.com/your-org/your-repo/issues/42"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
              className={inputClass}
            >
              {ISSUE_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {ISSUE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Found in Thor while retesting fix..."
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={createIssue.isPending}>
              Add issue
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {issues.length > 0 && (
        <ul className="mt-4 space-y-3">
          {issues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} ticketId={ticket.id} />
          ))}
        </ul>
      )}

      {issues.length === 0 && !showForm && (
        <p className="mt-3 text-sm text-slate-400">
          No linked GitHub issues yet.
        </p>
      )}
    </Card>
  );
}

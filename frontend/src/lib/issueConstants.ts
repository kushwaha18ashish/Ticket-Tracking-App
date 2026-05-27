import type { IssueStatus } from '@/types';

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const ISSUE_STATUS_OPTIONS: IssueStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

export const ISSUE_STATUS_STYLES: Record<IssueStatus, string> = {
  OPEN: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  IN_PROGRESS:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  RESOLVED:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  CLOSED:
    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

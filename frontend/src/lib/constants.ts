import type { Environment, TicketStatusValue } from '@/types';

export const ENVIRONMENTS: Environment[] = ['THOR', 'QA', 'RELEASE', 'PRODUCTION'];

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
  THOR: 'Thor',
  QA: 'QA',
  RELEASE: 'Release',
  PRODUCTION: 'Production',
};

export const STATUS_LABELS: Record<TicketStatusValue, string> = {
  IN_PROGRESS: 'In Progress',
  PASS: 'Pass',
  FAIL: 'Fail',
  BLOCKED: 'Blocked',
  TBD: 'TBD',
};

export const PROMOTE_LABELS: Partial<Record<Environment, string>> = {
  THOR: 'Promote to QA',
  QA: 'Promote to Release',
  RELEASE: 'Promote to Production',
};

export const STATUS_OPTIONS: TicketStatusValue[] = [
  'IN_PROGRESS',
  'PASS',
  'FAIL',
  'BLOCKED',
];

export const FILTER_STATUS_OPTIONS: (TicketStatusValue | 'TBD')[] = [
  'IN_PROGRESS',
  'PASS',
  'FAIL',
  'BLOCKED',
  'TBD',
];

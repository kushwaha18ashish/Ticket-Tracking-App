import { Environment, OverallStatus, TicketStatusValue } from '@prisma/client';

export const ENVIRONMENT_ORDER: Environment[] = [
  Environment.THOR,
  Environment.QA,
  Environment.RELEASE,
  Environment.PRODUCTION,
];

export const NEXT_ENVIRONMENT: Partial<Record<Environment, Environment>> = {
  [Environment.THOR]: Environment.QA,
  [Environment.QA]: Environment.RELEASE,
  [Environment.RELEASE]: Environment.PRODUCTION,
};

export const PROMOTE_LABELS: Partial<Record<Environment, string>> = {
  [Environment.THOR]: 'Promote to QA',
  [Environment.QA]: 'Promote to Release',
  [Environment.RELEASE]: 'Promote to Production',
};

export function computeOverallStatus(
  statuses: { environment: Environment; status: TicketStatusValue }[]
): OverallStatus {
  const statusMap = new Map(statuses.map((s) => [s.environment, s.status]));

  if (ENVIRONMENT_ORDER.some((env) => statusMap.get(env) === TicketStatusValue.FAIL)) {
    return OverallStatus.FAIL;
  }

  if (ENVIRONMENT_ORDER.some((env) => statusMap.get(env) === TicketStatusValue.BLOCKED)) {
    return OverallStatus.BLOCKED;
  }

  if (statusMap.get(Environment.PRODUCTION) === TicketStatusValue.PASS) {
    return OverallStatus.PASS;
  }

  return OverallStatus.IN_PROGRESS;
}

export function formatEnvironment(env: Environment): string {
  const labels: Record<Environment, string> = {
    [Environment.THOR]: 'Thor',
    [Environment.QA]: 'QA',
    [Environment.RELEASE]: 'Release',
    [Environment.PRODUCTION]: 'Production',
  };
  return labels[env];
}

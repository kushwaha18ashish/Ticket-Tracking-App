import type { Environment, Ticket } from '@/types';
import { ENVIRONMENTS } from '@/lib/constants';

export type EnvironmentCountMap = Record<Environment, number>;

export function countTicketsByEnvironment(
  tickets: Ticket[]
): EnvironmentCountMap {
  const counts = Object.fromEntries(
    ENVIRONMENTS.map((env) => [env, 0])
  ) as EnvironmentCountMap;

  for (const ticket of tickets) {
    counts[ticket.currentEnvironment]++;
  }

  return counts;
}

export function getTotalFromEnvironmentCounts(
  counts: EnvironmentCountMap
): number {
  return ENVIRONMENTS.reduce((sum, env) => sum + counts[env], 0);
}

import {
  ActivityAction,
  Environment,
  OverallStatus,
  Prisma,
  TicketStatusValue,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import {
  computeOverallStatus,
  ENVIRONMENT_ORDER,
  NEXT_ENVIRONMENT,
} from '../utils/overallStatus';

const ticketInclude = {
  statuses: { orderBy: { environment: 'asc' as const } },
  createdBy: { select: { id: true, name: true, email: true } },
  comments: {
    orderBy: { createdAt: 'desc' as const },
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  activityLogs: {
    orderBy: { createdAt: 'desc' as const },
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  issues: {
    orderBy: { createdAt: 'desc' as const },
    include: { user: { select: { id: true, name: true, email: true } } },
  },
} satisfies Prisma.TicketInclude;

export type TicketWithRelations = Prisma.TicketGetPayload<{
  include: typeof ticketInclude;
}>;

export interface TicketFilters {
  environment?: Environment;
  status?: TicketStatusValue;
  overallStatus?: OverallStatus;
  ticketId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'ticketId' | 'title' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TicketStats {
  total: number;
  passed: number;
  failed: number;
  inProgress: number;
  blocked: number;
  byEnvironment: Record<
    Environment,
    { inProgress: number; pass: number; fail: number; blocked: number }
  >;
}

async function syncOverallStatus(ticketId: string): Promise<OverallStatus> {
  const statuses = await prisma.ticketStatus.findMany({ where: { ticketId } });
  const overall = computeOverallStatus(statuses);
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { overallStatus: overall },
  });
  return overall;
}

function getStatusForEnv(
  ticket: TicketWithRelations,
  env: Environment
): TicketStatusValue {
  return (
    ticket.statuses.find((s) => s.environment === env)?.status ??
    TicketStatusValue.IN_PROGRESS
  );
}

export async function getTicketById(
  id: string,
  userId: string
): Promise<TicketWithRelations> {
  const ticket = await prisma.ticket.findFirst({
    where: { id, createdById: userId },
    include: ticketInclude,
  });
  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }
  return ticket;
}

export async function createTicket(
  userId: string,
  data: {
    ticketId: string;
    title: string;
    basecampLink?: string;
    notes?: string;
  }
): Promise<TicketWithRelations> {
  const existing = await prisma.ticket.findUnique({
    where: {
      createdById_ticketId: { createdById: userId, ticketId: data.ticketId },
    },
  });
  if (existing) {
    throw new AppError(
      409,
      `You already have a ticket with ID "${data.ticketId}"`
    );
  }

  const ticket = await prisma.ticket.create({
    data: {
      ticketId: data.ticketId,
      title: data.title,
      basecampLink: data.basecampLink,
      notes: data.notes,
      currentEnvironment: Environment.THOR,
      overallStatus: OverallStatus.IN_PROGRESS,
      createdById: userId,
      statuses: {
        create: ENVIRONMENT_ORDER.map((environment) => ({
          environment,
          status:
            environment === Environment.THOR
              ? TicketStatusValue.IN_PROGRESS
              : TicketStatusValue.IN_PROGRESS,
        })),
      },
      activityLogs: {
        create: {
          userId,
          action: ActivityAction.CREATED,
          environment: Environment.THOR,
          newStatus: TicketStatusValue.IN_PROGRESS,
          message: `Ticket created in Thor with status In Progress`,
        },
      },
    },
    include: ticketInclude,
  });

  return ticket;
}

export async function getTickets(
  userId: string,
  filters: TicketFilters
): Promise<TicketWithRelations[]> {
  const where: Prisma.TicketWhereInput = { createdById: userId };

  if (filters.ticketId) {
    where.ticketId = { contains: filters.ticketId, mode: 'insensitive' };
  }

  if (filters.environment) {
    where.currentEnvironment = filters.environment;
  }

  if (filters.overallStatus) {
    where.overallStatus = filters.overallStatus;
  }

  if (filters.status && filters.environment) {
    where.statuses = {
      some: {
        environment: filters.environment,
        status: filters.status,
      },
    };
  } else if (filters.status) {
    where.statuses = { some: { status: filters.status } };
  }

  if (filters.search) {
    where.OR = [
      { ticketId: { contains: filters.search, mode: 'insensitive' } },
      { title: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.updatedAt = {};
    if (filters.dateFrom) {
      where.updatedAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.updatedAt.lte = end;
    }
  }

  const sortBy = filters.sortBy ?? 'updatedAt';
  const sortOrder = filters.sortOrder ?? 'desc';

  return prisma.ticket.findMany({
    where,
    include: ticketInclude,
    orderBy: { [sortBy]: sortOrder },
  });
}

export async function getTicketStats(userId: string): Promise<TicketStats> {
  const tickets = await prisma.ticket.findMany({
    where: { createdById: userId },
    include: { statuses: true },
  });

  const stats: TicketStats = {
    total: tickets.length,
    passed: 0,
    failed: 0,
    inProgress: 0,
    blocked: 0,
    byEnvironment: {
      [Environment.THOR]: { inProgress: 0, pass: 0, fail: 0, blocked: 0 },
      [Environment.QA]: { inProgress: 0, pass: 0, fail: 0, blocked: 0 },
      [Environment.RELEASE]: { inProgress: 0, pass: 0, fail: 0, blocked: 0 },
      [Environment.PRODUCTION]: { inProgress: 0, pass: 0, fail: 0, blocked: 0 },
    },
  };

  for (const ticket of tickets) {
    switch (ticket.overallStatus) {
      case OverallStatus.PASS:
        stats.passed++;
        break;
      case OverallStatus.FAIL:
        stats.failed++;
        break;
      case OverallStatus.BLOCKED:
        stats.blocked++;
        break;
      default:
        stats.inProgress++;
    }

    for (const s of ticket.statuses) {
      const bucket = stats.byEnvironment[s.environment];
      switch (s.status) {
        case TicketStatusValue.PASS:
          bucket.pass++;
          break;
        case TicketStatusValue.FAIL:
          bucket.fail++;
          break;
        case TicketStatusValue.BLOCKED:
          bucket.blocked++;
          break;
        default:
          bucket.inProgress++;
      }
    }
  }

  return stats;
}

export async function updateTicketStatus(
  ticketId: string,
  userId: string,
  environment: Environment,
  newStatus: TicketStatusValue
): Promise<TicketWithRelations> {
  const ticket = await getTicketById(ticketId, userId);
  const current = ticket.statuses.find((s) => s.environment === environment);
  const previousStatus = current?.status ?? TicketStatusValue.IN_PROGRESS;

  if (previousStatus === newStatus) {
    return ticket;
  }

  await prisma.ticketStatus.upsert({
    where: {
      ticketId_environment: { ticketId, environment },
    },
    create: { ticketId, environment, status: newStatus },
    update: { status: newStatus },
  });

  await prisma.activityLog.create({
    data: {
      ticketId,
      userId,
      action: ActivityAction.STATUS_CHANGE,
      environment,
      previousStatus,
      newStatus,
      message: `${environment} status changed from ${previousStatus} to ${newStatus}`,
    },
  });

  await syncOverallStatus(ticketId);
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  return getTicketById(ticketId, userId);
}

export async function promoteTicket(
  ticketId: string,
  userId: string
): Promise<TicketWithRelations> {
  const ticket = await getTicketById(ticketId, userId);
  const currentEnv = ticket.currentEnvironment;
  const currentStatus = getStatusForEnv(ticket, currentEnv);

  if (currentStatus !== TicketStatusValue.PASS) {
    throw new AppError(
      400,
      `Cannot promote: current environment (${currentEnv}) must have Pass status`
    );
  }

  const nextEnv = NEXT_ENVIRONMENT[currentEnv];
  if (!nextEnv) {
    throw new AppError(400, 'Ticket is already in Production; no further promotion');
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { currentEnvironment: nextEnv },
  });

  await prisma.ticketStatus.upsert({
    where: {
      ticketId_environment: { ticketId, environment: nextEnv },
    },
    create: {
      ticketId,
      environment: nextEnv,
      status: TicketStatusValue.IN_PROGRESS,
    },
    update: { status: TicketStatusValue.IN_PROGRESS },
  });

  await prisma.activityLog.create({
    data: {
      ticketId,
      userId,
      action: ActivityAction.PROMOTION,
      fromEnvironment: currentEnv,
      toEnvironment: nextEnv,
      environment: nextEnv,
      previousStatus: getStatusForEnv(ticket, nextEnv),
      newStatus: TicketStatusValue.IN_PROGRESS,
      message: `Promoted from ${currentEnv} to ${nextEnv}`,
    },
  });

  await syncOverallStatus(ticketId);

  return getTicketById(ticketId, userId);
}

export async function updateTicket(
  id: string,
  userId: string,
  data: {
    ticketId?: string;
    title?: string;
    basecampLink?: string | null;
    notes?: string | null;
  }
): Promise<TicketWithRelations> {
  const ticket = await getTicketById(id, userId);
  const updates: {
    ticketId?: string;
    title?: string;
    basecampLink?: string | null;
    notes?: string | null;
  } = {};

  if (data.ticketId !== undefined && data.ticketId !== ticket.ticketId) {
    const duplicate = await prisma.ticket.findUnique({
      where: {
        createdById_ticketId: { createdById: userId, ticketId: data.ticketId },
      },
    });
    if (duplicate && duplicate.id !== id) {
      throw new AppError(
        409,
        `You already have a ticket with ID "${data.ticketId}"`
      );
    }
    updates.ticketId = data.ticketId;
  }

  if (data.title !== undefined && data.title !== ticket.title) {
    updates.title = data.title;
  }

  if (data.basecampLink !== undefined) {
    const normalized =
      data.basecampLink === '' || data.basecampLink === null
        ? null
        : data.basecampLink;
    if (normalized !== ticket.basecampLink) {
      updates.basecampLink = normalized;
    }
  }

  if (data.notes !== undefined) {
    const normalized =
      data.notes === '' || data.notes === null ? null : data.notes;
    if (normalized !== ticket.notes) {
      updates.notes = normalized;
    }
  }

  if (Object.keys(updates).length === 0) {
    return ticket;
  }

  await prisma.ticket.update({
    where: { id },
    data: updates,
  });

  const changes = Object.keys(updates).join(', ');
  await prisma.activityLog.create({
    data: {
      ticketId: id,
      userId,
      action: ActivityAction.UPDATED,
      message: `Updated: ${changes}`,
    },
  });

  return getTicketById(id, userId);
}

export async function addComment(
  ticketId: string,
  userId: string,
  content: string
): Promise<TicketWithRelations> {
  await getTicketById(ticketId, userId);

  await prisma.comment.create({
    data: { ticketId, userId, content },
  });

  await prisma.activityLog.create({
    data: {
      ticketId,
      userId,
      action: ActivityAction.COMMENT,
      message: content.slice(0, 200),
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  return getTicketById(ticketId, userId);
}

export async function deleteTicket(id: string, userId: string): Promise<void> {
  await getTicketById(id, userId);
  await prisma.ticket.delete({ where: { id } });
}

export async function getRecentActivity(userId: string, limit = 20) {
  return prisma.activityLog.findMany({
    where: { ticket: { createdById: userId } },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      ticket: { select: { id: true, ticketId: true, title: true } },
    },
  });
}

export function canPromote(ticket: TicketWithRelations): boolean {
  const currentStatus = getStatusForEnv(ticket, ticket.currentEnvironment);
  return (
    currentStatus === TicketStatusValue.PASS &&
    NEXT_ENVIRONMENT[ticket.currentEnvironment] !== undefined
  );
}

export { ticketInclude, getStatusForEnv };

import { ActivityAction, IssueStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { getTicketById } from './ticket.service';

const issueInclude = {
  user: { select: { id: true, name: true, email: true } },
} as const;

export async function createTicketIssue(
  ticketId: string,
  userId: string,
  data: { title: string; githubUrl: string; notes?: string; status?: IssueStatus }
) {
  await getTicketById(ticketId, userId);

  const issue = await prisma.ticketIssue.create({
    data: {
      ticketId,
      userId,
      title: data.title,
      githubUrl: data.githubUrl,
      notes: data.notes,
      status: data.status ?? IssueStatus.OPEN,
    },
    include: issueInclude,
  });

  await prisma.activityLog.create({
    data: {
      ticketId,
      userId,
      action: ActivityAction.ISSUE_LOGGED,
      message: `GitHub issue logged: ${issue.title}`,
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  return issue;
}

export async function updateTicketIssue(
  ticketId: string,
  issueId: string,
  userId: string,
  data: {
    title?: string;
    githubUrl?: string;
    notes?: string | null;
    status?: IssueStatus;
  }
) {
  await getTicketById(ticketId, userId);

  const existing = await prisma.ticketIssue.findFirst({
    where: { id: issueId, ticketId },
  });
  if (!existing) {
    throw new AppError(404, 'Issue not found');
  }

  const issue = await prisma.ticketIssue.update({
    where: { id: issueId },
    data: {
      title: data.title,
      githubUrl: data.githubUrl,
      notes: data.notes,
      status: data.status,
    },
    include: issueInclude,
  });

  await prisma.activityLog.create({
    data: {
      ticketId,
      userId,
      action: ActivityAction.ISSUE_UPDATED,
      message: `GitHub issue updated: ${issue.title}`,
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  return issue;
}

export async function deleteTicketIssue(
  ticketId: string,
  issueId: string,
  userId: string
): Promise<void> {
  await getTicketById(ticketId, userId);

  const existing = await prisma.ticketIssue.findFirst({
    where: { id: issueId, ticketId },
  });
  if (!existing) {
    throw new AppError(404, 'Issue not found');
  }

  await prisma.ticketIssue.delete({ where: { id: issueId } });

  await prisma.activityLog.create({
    data: {
      ticketId,
      userId,
      action: ActivityAction.ISSUE_REMOVED,
      message: `GitHub issue removed: ${existing.title}`,
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });
}

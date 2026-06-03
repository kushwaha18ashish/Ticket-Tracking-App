import { Request, Response, NextFunction } from 'express';
import {
  Environment,
  OverallStatus,
  TicketStatusValue,
} from '@prisma/client';
import { z } from 'zod';
import * as ticketService from '../services/ticket.service';
import { canPromote } from '../services/ticket.service';
import { ENVIRONMENT_ORDER } from '../utils/overallStatus';

const createTicketSchema = z.object({
  ticketId: z.string().min(1),
  title: z.string().min(1),
  basecampLink: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  environment: z.nativeEnum(Environment),
  status: z.nativeEnum(TicketStatusValue),
});

const updateTicketSchema = z.object({
  ticketId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  basecampLink: z.string().url().optional().or(z.literal('')).nullable(),
  notes: z.string().optional().nullable(),
});

const commentSchema = z.object({
  content: z.string().min(1),
});

export async function createTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createTicketSchema.parse(req.body);
    const ticket = await ticketService.createTicket(req.user!.id, {
      ticketId: body.ticketId,
      title: body.title,
      basecampLink: body.basecampLink || undefined,
      notes: body.notes,
    });
    res.status(201).json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
}

export async function getTickets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = {
      environment: req.query.environment as Environment | undefined,
      status: req.query.status as TicketStatusValue | undefined,
      overallStatus: req.query.overallStatus as OverallStatus | undefined,
      ticketId: req.query.ticketId as string | undefined,
      search: req.query.search as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      sortBy: req.query.sortBy as ticketService.TicketFilters['sortBy'],
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
    };
    const tickets = await ticketService.getTickets(req.user!.id, filters);
    res.json(tickets.map(serializeTicket));
  } catch (err) {
    next(err);
  }
}

export async function getTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ticket = await ticketService.getTicketById(
      req.params.id,
      req.user!.id
    );
    res.json({
      ...serializeTicket(ticket),
      canPromote: canPromote(ticket),
    });
  } catch (err) {
    next(err);
  }
}

export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await ticketService.getTicketStats(req.user!.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { environment, status } = updateStatusSchema.parse(req.body);
    const ticket = await ticketService.updateTicketStatus(
      req.params.id,
      req.user!.id,
      environment,
      status
    );
    res.json({
      ...serializeTicket(ticket),
      canPromote: canPromote(ticket),
    });
  } catch (err) {
    next(err);
  }
}

export async function promote(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ticket = await ticketService.promoteTicket(
      req.params.id,
      req.user!.id
    );
    res.json({
      ...serializeTicket(ticket),
      canPromote: canPromote(ticket),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = updateTicketSchema.parse(req.body);
    const ticket = await ticketService.updateTicket(
      req.params.id,
      req.user!.id,
      {
        ticketId: body.ticketId,
        title: body.title,
        basecampLink: body.basecampLink,
        notes: body.notes,
      }
    );
    res.json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
}

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { content } = commentSchema.parse(req.body);
    const ticket = await ticketService.addComment(
      req.params.id,
      req.user!.id,
      content
    );
    res.json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
}

export async function getActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ticket = await ticketService.getTicketById(
      req.params.id,
      req.user!.id
    );
    res.json(ticket.activityLogs);
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activity = await ticketService.getRecentActivity(
      req.user!.id,
      limit
    );
    res.json(activity);
  } catch (err) {
    next(err);
  }
}

export async function deleteTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await ticketService.deleteTicket(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export function serializeTicket(ticket: ticketService.TicketWithRelations) {
  const currentEnvIndex = ENVIRONMENT_ORDER.indexOf(ticket.currentEnvironment);

  const statusMap = Object.fromEntries(
    ticket.statuses.map((s) => {
      const envIndex = ENVIRONMENT_ORDER.indexOf(s.environment);
      const status = envIndex > currentEnvIndex ? 'TBD' : s.status;
      return [s.environment, status];
    })
  ) as Record<Environment, TicketStatusValue | 'TBD'>;

  return {
    id: ticket.id,
    ticketId: ticket.ticketId,
    title: ticket.title,
    basecampLink: ticket.basecampLink,
    notes: ticket.notes,
    currentEnvironment: ticket.currentEnvironment,
    overallStatus: ticket.overallStatus,
    statuses: statusMap,
    thorStatus: statusMap[Environment.THOR],
    qaStatus: statusMap[Environment.QA],
    releaseStatus: statusMap[Environment.RELEASE],
    productionStatus: statusMap[Environment.PRODUCTION],
    createdBy: ticket.createdBy,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    comments: ticket.comments,
    activityLogs: ticket.activityLogs,
    issues: ticket.issues,
  };
}

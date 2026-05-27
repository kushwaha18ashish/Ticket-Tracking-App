import { Request, Response, NextFunction } from 'express';
import { IssueStatus } from '@prisma/client';
import { z } from 'zod';
import * as issueService from '../services/ticketIssue.service';
import * as ticketService from '../services/ticket.service';
import { serializeTicket } from './ticket.controller';

const createIssueSchema = z.object({
  title: z.string().min(1),
  githubUrl: z.string().url(),
  notes: z.string().optional(),
  status: z.nativeEnum(IssueStatus).optional(),
});

const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  githubUrl: z.string().url().optional(),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(IssueStatus).optional(),
});

export async function createIssue(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createIssueSchema.parse(req.body);
    await issueService.createTicketIssue(req.params.id, req.user!.id, body);
    const ticket = await ticketService.getTicketById(
      req.params.id,
      req.user!.id
    );
    res.status(201).json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
}

export async function updateIssue(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = updateIssueSchema.parse(req.body);
    await issueService.updateTicketIssue(
      req.params.id,
      req.params.issueId,
      req.user!.id,
      body
    );
    const ticket = await ticketService.getTicketById(
      req.params.id,
      req.user!.id
    );
    res.json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
}

export async function deleteIssue(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await issueService.deleteTicketIssue(
      req.params.id,
      req.params.issueId,
      req.user!.id
    );
    const ticket = await ticketService.getTicketById(
      req.params.id,
      req.user!.id
    );
    res.json(serializeTicket(ticket));
  } catch (err) {
    next(err);
  }
}

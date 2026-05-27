import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IssueStatus, TicketFilters } from '@/types';

export function useTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => api.getTickets(filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.getTicket(id),
    enabled: !!id,
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ['ticketStats'],
    queryFn: api.getStats,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => api.getRecentActivity(15),
  });
}

export function useTicketMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tickets'] });
    qc.invalidateQueries({ queryKey: ['ticketStats'] });
    qc.invalidateQueries({ queryKey: ['recentActivity'] });
  };

  const createTicket = useMutation({
    mutationFn: api.createTicket,
    onSuccess: (ticket) => {
      invalidate();
      qc.setQueryData(['ticket', ticket.id], ticket);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      environment,
      status,
    }: {
      id: string;
      environment: string;
      status: string;
    }) => api.updateStatus(id, environment, status),
    onSuccess: (ticket) => {
      invalidate();
      qc.setQueryData(['ticket', ticket.id], ticket);
    },
  });

  const promote = useMutation({
    mutationFn: (id: string) => api.promote(id),
    onSuccess: (ticket) => {
      invalidate();
      qc.setQueryData(['ticket', ticket.id], ticket);
    },
  });

  const addComment = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.addComment(id, content),
    onSuccess: (ticket) => {
      invalidate();
      qc.setQueryData(['ticket', ticket.id], ticket);
    },
  });

  const updateTicket = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        ticketId?: string;
        title?: string;
        basecampLink?: string | null;
        notes?: string | null;
      };
    }) => api.updateTicket(id, data),
    onSuccess: (ticket) => {
      invalidate();
      qc.setQueryData(['ticket', ticket.id], ticket);
    },
  });

  const deleteTicket = useMutation({
    mutationFn: (id: string) => api.deleteTicket(id),
    onSuccess: (_data, id) => {
      invalidate();
      qc.removeQueries({ queryKey: ['ticket', id] });
    },
  });

  const createIssue = useMutation({
    mutationFn: ({
      ticketId,
      data,
    }: {
      ticketId: string;
      data: {
        title: string;
        githubUrl: string;
        notes?: string;
        status?: IssueStatus;
      };
    }) => api.createIssue(ticketId, data),
    onSuccess: (ticket) => {
      invalidate();
      qc.setQueryData(['ticket', ticket.id], ticket);
    },
  });

  const updateIssue = useMutation({
    mutationFn: ({
      ticketId,
      issueId,
      data,
    }: {
      ticketId: string;
      issueId: string;
      data: {
        title?: string;
        githubUrl?: string;
        notes?: string | null;
        status?: IssueStatus;
      };
    }) => api.updateIssue(ticketId, issueId, data),
    onSuccess: (ticket) => {
      invalidate();
      qc.setQueryData(['ticket', ticket.id], ticket);
    },
  });

  const deleteIssue = useMutation({
    mutationFn: ({
      ticketId,
      issueId,
    }: {
      ticketId: string;
      issueId: string;
    }) => api.deleteIssue(ticketId, issueId),
    onSuccess: (ticket) => {
      invalidate();
      qc.setQueryData(['ticket', ticket.id], ticket);
    },
  });

  return {
    createTicket,
    updateStatus,
    promote,
    addComment,
    updateTicket,
    deleteTicket,
    createIssue,
    updateIssue,
    deleteIssue,
  };
}

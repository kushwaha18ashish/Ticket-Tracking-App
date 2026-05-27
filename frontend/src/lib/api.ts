import type {
  IssueStatus,
  RecentActivity,
  Ticket,
  TicketFilters,
  TicketStats,
  User,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  me: () => request<User>('/auth/me'),

  getTickets: (filters: TicketFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    const qs = params.toString();
    return request<Ticket[]>(`/tickets${qs ? `?${qs}` : ''}`);
  },

  getTicket: (id: string) => request<Ticket>(`/tickets/${id}`),

  getStats: () => request<TicketStats>('/tickets/stats'),

  getRecentActivity: (limit = 15) =>
    request<RecentActivity[]>(`/tickets/activity/recent?limit=${limit}`),

  createTicket: (data: {
    ticketId: string;
    title: string;
    basecampLink?: string;
    notes?: string;
  }) =>
    request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, environment: string, status: string) =>
    request<Ticket>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ environment, status }),
    }),

  promote: (id: string) =>
    request<Ticket>(`/tickets/${id}/promote`, { method: 'POST' }),

  updateTicket: (
    id: string,
    data: {
      ticketId?: string;
      title?: string;
      basecampLink?: string | null;
      notes?: string | null;
    }
  ) =>
    request<Ticket>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  addComment: (id: string, content: string) =>
    request<Ticket>(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deleteTicket: (id: string) =>
    request<void>(`/tickets/${id}`, { method: 'DELETE' }),

  createIssue: (
    ticketId: string,
    data: {
      title: string;
      githubUrl: string;
      notes?: string;
      status?: IssueStatus;
    }
  ) =>
    request<Ticket>(`/tickets/${ticketId}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateIssue: (
    ticketId: string,
    issueId: string,
    data: {
      title?: string;
      githubUrl?: string;
      notes?: string | null;
      status?: IssueStatus;
    }
  ) =>
    request<Ticket>(`/tickets/${ticketId}/issues/${issueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteIssue: (ticketId: string, issueId: string) =>
    request<Ticket>(`/tickets/${ticketId}/issues/${issueId}`, {
      method: 'DELETE',
    }),
};

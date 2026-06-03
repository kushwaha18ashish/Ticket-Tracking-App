export type Environment = 'THOR' | 'QA' | 'RELEASE' | 'PRODUCTION';
export type TicketStatusValue = 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'BLOCKED' | 'TBD';
export type OverallStatus = 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'BLOCKED';
export type ActivityAction =
  | 'CREATED'
  | 'STATUS_CHANGE'
  | 'PROMOTION'
  | 'COMMENT'
  | 'UPDATED'
  | 'ISSUE_LOGGED'
  | 'ISSUE_UPDATED'
  | 'ISSUE_REMOVED';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketIssue {
  id: string;
  title: string;
  githubUrl: string;
  notes?: string | null;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  environment?: Environment;
  previousStatus?: TicketStatusValue;
  newStatus?: TicketStatusValue;
  fromEnvironment?: Environment;
  toEnvironment?: Environment;
  message?: string;
  createdAt: string;
  user: User;
}

export interface Ticket {
  id: string;
  ticketId: string;
  title: string;
  basecampLink?: string | null;
  notes?: string | null;
  currentEnvironment: Environment;
  overallStatus: OverallStatus;
  statuses: Record<Environment, TicketStatusValue>;
  thorStatus: TicketStatusValue;
  qaStatus: TicketStatusValue;
  releaseStatus: TicketStatusValue;
  productionStatus: TicketStatusValue;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  activityLogs?: ActivityLog[];
  issues?: TicketIssue[];
  canPromote?: boolean;
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

export interface RecentActivity extends ActivityLog {
  ticket: { id: string; ticketId: string; title: string };
}

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

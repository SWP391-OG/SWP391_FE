// User roles
export type UserRole = 'student' | 'staff' | 'admin';

// Department/Room types
export interface Department {
  id: string;
  name: string;
  description: string;
  location: string;
  managerId?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  departmentId: string;
  capacity: number;
  facilities: string[];
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
}

// Issue types
export type IssueCategory = 'facility' | 'wifi' | 'equipment' | 'classroom' | 'other';

export interface IssueType {
  id: string;
  name: string;
  category: IssueCategory;
  icon: string;
  description: string;
  examples?: string[];
}

// SLA Tracking types
export interface SLATimelineEvent {
  id: string;
  timestamp: string;
  status: 'open' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed';
  actor: string;
  actorRole: UserRole;
  action: string;
  note?: string;
  duration?: number; // Duration in minutes from previous event
}

export interface SLATracking {
  createdAt: string;
  acknowledgedAt?: string;
  startedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  deadline: string;
  responseTime?: number; // Time to acknowledge in minutes
  resolutionTime?: number; // Time to resolve in minutes
  isOverdue: boolean;
  overdueBy?: number; // Minutes overdue
  timeline: SLATimelineEvent[];
}

// Ticket types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  issueType: IssueType;
  category: IssueCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed';
  location?: string;
  roomNumber?: string;
  images?: string[];
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt?: string;
  slaDeadline: string;
  slaTracking: SLATracking;
}


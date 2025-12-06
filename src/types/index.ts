// User roles
export type UserRole = 'student' | 'teacher' | 'it-staff' | 'facility-staff' | 'admin';

// User authentication
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus; // Trạng thái tài khoản: active, inactive, banned
  avatar?: string;
  createdAt?: string; // Thời gian tạo tài khoản
}

// Department types
export interface Department {
  id: string;
  name: string;
  description: string;
  location: string;
  adminId?: string; // User ID của admin quản lý department này
  staffIds: string[]; // Array các User IDs của staff trong department
  createdAt: string;
}

// Location types (thay thế Room)
export interface Location {
  id: string;
  code?: string; // Mã địa điểm (optional for backward compatibility)
  name: string;
  description?: string;
  type: 'classroom' | 'wc' | 'hall' | 'corridor' | 'other';
  floor?: string; // Tầng: "G" (Tầng Trệt), "1", "2", etc.
  status: 'active' | 'inactive';
  createdAt: string;
}

// Category types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Category {
  id: string;
  code?: string; // Mã category (optional for backward compatibility)
  name: string;
  description: string;
  icon: string;
  color: string;
  slaResolveHours: number; // SLA in hours (theo DB design)
  defaultPriority: Priority;
  departmentId: string; // Department responsible
  status: 'active' | 'inactive';
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
  status: TicketStatus;
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
export type TicketStatus = 'open' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed' | 'cancelled';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  issueType: IssueType;
  category: IssueCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: TicketStatus;
  location?: string;
  roomNumber?: string;
  images?: string[];
  createdBy: string;
  createdByName?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt?: string;
  slaDeadline: string;
  slaTracking: SLATracking;
  notes?: string; // Ghi chú tiến độ từ staff
}


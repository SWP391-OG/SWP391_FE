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

// Ticket types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  issueType: IssueType;
  category: IssueCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  location?: string;
  roomNumber?: string;
  images?: string[];
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
  slaDeadline: string;
}


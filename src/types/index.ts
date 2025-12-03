// User roles
export type UserRole = 'student' | 'staff' | 'admin';

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
  name: string;
  description?: string;
  type: 'classroom' | 'wc' | 'hall' | 'corridor' | 'other';
  status: 'active' | 'inactive';
  createdAt: string;
}

// Category types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Category {
  id: string;
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

// Ticket types (for future use)
export interface Ticket {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priority: Priority;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  slaDeadline: string;
}


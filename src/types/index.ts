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

// Ticket types (for future use)
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'facility' | 'wifi' | 'equipment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  slaDeadline: string;
}


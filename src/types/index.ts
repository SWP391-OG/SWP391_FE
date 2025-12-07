// User roles
export type UserRole = 'student' | 'teacher' | 'it-staff' | 'facility-staff' | 'admin';

// User authentication
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: string;
  username: string; // Frontend only - không có trong DB
  password: string; // Frontend only - không có trong DB
  fullName: string; // DB: full_name
  email: string; // Dùng làm tên đăng nhập (Duy nhất)
  phoneNumber?: string; // Frontend only - không có trong DB
  userCode?: string; // DB: user_code - Mã số sinh viên/nhân viên (Duy nhất)
  studentCode?: string; // Deprecated - dùng userCode thay thế (giữ để backward compatibility)
  role: UserRole; // DB: role_id (FK) - Vai trò trong hệ thống
  roleId?: string; // DB: role_id (FK) - Thêm để tương thích với DB
  departmentId?: string; // DB: department_id (FK) - Bộ phận làm việc (NULL nếu là Student hoặc Sys Admin)
  status: UserStatus; // DB: status - Trạng thái tài khoản (Active, Pending, Banned)
  isActive?: boolean; // DB: is_active (Soft Delete) - Cờ đánh dấu tài khoản còn hoạt động
  avatar?: string; // Frontend only - không có trong DB
  createdAt?: string; // DB: created_at - Thời gian tạo tài khoản
  updatedAt?: string; // DB: updated_at - Thời gian cập nhật
}

// Department types
export interface Department {
  id: string;
  name: string; // Tên Bộ phận
  description?: string; // Frontend only - không có trong DB
  location?: string; // Frontend only - không có trong DB
  adminId?: string; // DB: admin_id (FK) - Người quản lý Bộ phận (Dept Admin)
  staffIds?: string[]; // Frontend only - không có trong DB (quan hệ nhiều-nhiều thường dùng bảng trung gian)
  isActive?: boolean; // DB: is_active (Soft Delete) - Cờ đánh dấu Bộ phận còn hoạt động
  createdAt?: string; // Frontend only - không có trong DB
}

// Location types (thay thế Room)
export interface Location {
  id: string;
  code?: string; // Frontend only - không có trong DB
  name: string; // DB: name - Tên phòng/khu vực cụ thể
  description?: string; // Frontend only - không có trong DB
  type?: 'classroom' | 'wc' | 'hall' | 'corridor' | 'other'; // Frontend only - không có trong DB
  floor?: string; // DB: floor - Tầng (Tầng Trệt, Tầng 1, Tầng 2...)
  status?: 'active' | 'inactive'; // Frontend only - dùng isActive thay thế
  isActive?: boolean; // DB: is_active (Soft Delete) - Cờ đánh dấu địa điểm còn sử dụng
  createdAt?: string; // Frontend only - không có trong DB
}

// Category types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Category {
  id: string;
  code?: string; // DB: code - Mã viết tắt (WIFI, AC, ELEC, FURNI)
  name: string; // DB: name - Tên danh mục
  description?: string; // Frontend only - không có trong DB
  icon?: string; // Frontend only - không có trong DB
  color?: string; // Frontend only - không có trong DB
  slaResolveHours: number; // DB: sla_resolve_hours - Thời gian cam kết (SLA) tính bằng giờ
  defaultPriority?: Priority; // Frontend only - không có trong DB
  departmentId: string; // DB: department_id (FK) - Bộ phận chịu trách nhiệm xử lý
  status?: 'active' | 'inactive'; // Frontend only - dùng isActive thay thế
  isActive?: boolean; // DB: is_active (Soft Delete) - Cờ đánh dấu danh mục còn hiệu lực
  createdAt?: string; // Frontend only - không có trong DB
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
  ticketCode?: string; // DB: ticket_code - Mã Ticket hiển thị (TKT-0001, Duy nhất)
  title: string; // DB: title - Tiêu đề
  description: string; // DB: description - Nội dung chi tiết
  issueType?: IssueType; // Frontend only - không có trong DB
  category?: IssueCategory; // Frontend only - dùng categoryId thay thế
  categoryId?: string; // DB: category_id (FK) - Loại sự cố
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Frontend only - không có trong DB
  status: TicketStatus; // DB: status - Trạng thái Ticket (New, Assigned, In_Progress, Resolved, Closed, Cancelled)
  location?: string; // Frontend only - dùng locationId thay thế
  locationId?: string; // DB: location_id (FK) - Địa điểm xảy ra
  roomNumber?: string; // Frontend only - không có trong DB
  images?: string[]; // Frontend only - không có trong DB (thường lưu trong bảng riêng)
  createdBy?: string; // Deprecated - dùng requesterId thay thế
  requesterId?: string; // DB: requester_id (FK) - Người báo cáo
  createdByName?: string; // Frontend only - không có trong DB
  assignedTo?: string; // Deprecated - dùng assignedToId thay thế
  assignedToId?: string; // DB: assigned_to_id (FK) - Nhân viên kỹ thuật được giao việc (NULL khi mới tạo)
  assignedToName?: string; // Frontend only - không có trong DB
  createdAt: string; // DB: created_at - Thời gian tạo Ticket
  updatedAt?: string; // Frontend only - không có trong DB
  deadlineAt?: string; // DB: deadline_at - Hạn chót xử lý (Tính từ created_at + sla_resolve_hours)
  slaDeadline?: string; // Deprecated - dùng deadlineAt thay thế
  resolvedAt?: string; // DB: resolved_at - Thời gian Staff hoàn thành
  closedAt?: string; // DB: closed_at - Thời gian Ticket chính thức đóng lại (sau khi User Feedback)
  slaTracking?: SLATracking; // Frontend only - không có trong DB (thường tính toán từ các timestamp)
  notes?: string; // Frontend only - không có trong DB (thường lưu trong bảng riêng)
}


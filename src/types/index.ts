// User roles
export type UserRole = 'student' | 'teacher' | 'it-staff' | 'facility-staff' | 'admin';

// User authentication
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: number | string;           // ID định danh (int32) từ API hoặc userCode (backward compatibility)
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
  departmentName?: string; // Tên bộ phận từ API
  status: UserStatus; // DB: status - Trạng thái tài khoản (Active, Pending, Banned)
  isActive?: boolean; // DB: is_active (Soft Delete) - Cờ đánh dấu tài khoản còn hoạt động
  avatar?: string; // Frontend only - không có trong DB
  createdAt?: string; // DB: created_at - Thời gian tạo tài khoản
  updatedAt?: string; // DB: updated_at - Thời gian cập nhật
}

// User API types
export interface UserDto {
  id: number;                    // ID định danh (int32) - REQUIRED từ Swagger
  userCode: string;
  fullName: string;
  passwordHash: string;
  email: string;
  phoneNumber: string | null;
  roleId: number;
  departmentId: number | null;
  departmentName?: string; // Tên bộ phận từ API
  status: string; // "ACTIVE" | "INACTIVE" | "BANNED"
  createdAt: string | null;
}

export interface UserApiResponse {
  status: boolean;
  message: string;
  data: UserDto[]; // Backend trả về array trực tiếp
  errors: string[];
}

export interface UserSingleApiResponse {
  status: boolean;
  message: string;
  data: UserDto; // Single user
  errors: string[];
}

export interface UserRequestDto {
  userCode: string;
  fullName: string;
  passwordHash: string;
  email: string;
  phoneNumber?: string;
  roleId: number;
  departmentId?: number;
  status: string;
}

export interface UserUpdateDto {
  userCode?: string;             // Mã người dùng (có thể sửa theo Swagger)
  fullName?: string;
  email?: string;                 // Email (có thể sửa theo Swagger)
  phoneNumber?: string;
  roleId?: number;
  departmentId?: number;
  passwordHash?: string;          // Mật khẩu (optional)
  // status KHÔNG gửi trong update (dùng updateStatus riêng)
}

export interface UserStatusUpdateDto {
  userId: number;                 // ID định danh (int32) - REQUIRED
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'Active' | 'Inactive' | 'Banned';
}

export interface UserUpdateProfileDto {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

// Profile API Response - Chỉ trả về 4 fields
export interface UserProfileDto {
  userCode: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

export interface UserProfileApiResponse {
  status: boolean;
  message: string;
  data: UserProfileDto;
  errors: string[];
}

// Role mapping constants (dựa vào database thực tế)
export const ROLE_ID_MAP: Record<number, UserRole> = {
  1: 'admin',        // AD01 - Admin
  2: 'it-staff',     // ST01 - Staff (IT hoặc Facility - cần phân biệt sau)
  3: 'student',      // ST101 - Student
  4: 'teacher',      // Teacher (nếu có)
  5: 'facility-staff', // Facility staff (nếu khác với IT staff)
};

export const ROLE_TO_ID_MAP: Record<UserRole, number> = {
  'admin': 1,
  'it-staff': 2,
  'student': 3,
  'teacher': 4,
  'facility-staff': 5,
};

// Department types
export interface Department {
  id: number | string;       // ID định danh (int32) từ API hoặc deptCode (backward compatibility)
  deptCode: string;          // Mã bộ phận (IT, MAINTAIN...)
  deptName: string;          // Tên bộ phận
  status: 'ACTIVE' | 'INACTIVE'; // Trạng thái
  createdAt?: string;        // Thời gian tạo
  // Legacy fields for backward compatibility
  name?: string;             // Map từ deptName
  description?: string;       // Frontend only
  location?: string;          // Frontend only
  adminId?: string;          // Frontend only
  staffIds?: string[];       // Frontend only
  isActive?: boolean;        // Map từ status === 'ACTIVE'
}

export interface DepartmentDto {
  id: number;                // ID định danh (int32) - REQUIRED từ Swagger
  deptCode: string;          // Mã bộ phận
  deptName: string;          // Tên bộ phận
  status: 'ACTIVE' | 'INACTIVE' | 'Active' | 'Inactive'; // Trạng thái
  createdAt?: string;        // Thời gian tạo
}

export interface DepartmentApiResponse {
  status: boolean;
  message: string;
  data: DepartmentDto[] | {  // Backend có thể trả về array trực tiếp hoặc pagination object
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: DepartmentDto[];
  };
  errors: string[];
}

export interface DepartmentRequestDto {
  deptCode: string;          // Mã bộ phận (REQUIRED) - theo Swagger chỉ cần 2 fields này khi create
  deptName: string;          // Tên bộ phận (REQUIRED)
}

export interface DepartmentUpdateDto {
  deptCode?: string;         // Mã bộ phận (optional) - có thể sửa theo Swagger
  deptName?: string;         // Tên bộ phận (optional)
  status?: 'ACTIVE' | 'INACTIVE'; // Trạng thái (optional) - có thể cập nhật khi chỉnh sửa
}

export interface DepartmentStatusUpdateDto {
  departmentId: number;                // ID định danh (int32) - REQUIRED
  status: 'ACTIVE' | 'INACTIVE' | 'Active' | 'Inactive';
}

// Location types (thay thế Room)
export interface Location {
  id: string | number; // ID từ API (int32) hoặc locationCode (string) cho backward compatibility
  code?: string; // locationCode từ API
  name: string; // locationName từ API
  description?: string; // Frontend only - không có trong DB
  type?: 'classroom' | 'wc' | 'hall' | 'corridor' | 'other'; // Frontend only - không có trong DB
  floor?: string; // DB: floor - Tầng (Tầng Trệt, Tầng 1, Tầng 2...)
  status?: 'active' | 'inactive'; // Frontend only - dùng isActive thay thế
  isActive?: boolean; // DB: is_active (Soft Delete) - Cờ đánh dấu địa điểm còn sử dụng
  createdAt?: string; // Frontend only - không có trong DB
  campusId?: number; // Campus ID (int32)
  campusCode?: string; // Campus Code (for display)
  campusName?: string; // Campus Name (for display)
}

// Location API types
export interface LocationDto {
  id: number; // ID định danh (int32) - REQUIRED từ Swagger
  locationCode: string; // Mã địa điểm
  locationName: string; // Tên địa điểm
  campusName?: string; // Tên campus (từ Swagger)
  campusCode?: string; // Mã campus (từ Swagger)
  campusId?: number; // Campus ID (int32)
  status: 'ACTIVE' | 'INACTIVE' | 'Active' | 'Inactive'; // Trạng thái
}

export interface LocationApiResponse {
  status: boolean;
  message: string;
  data: LocationDto[] | {  // Backend có thể trả về array trực tiếp hoặc pagination object
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: LocationDto[];
  };
  errors: string[];
}

export interface LocationRequestDto {
  locationCode: string;
  locationName: string;
  campusId: number; // Campus ID (integer) - required by backend
}

export interface LocationStatusUpdateDto {
  locationId: number; // ID định danh (int32) - REQUIRED từ Swagger
  status: 'ACTIVE' | 'INACTIVE' | 'Active' | 'Inactive';
}

// Category types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueCategory = 'facility' | 'wifi' | 'equipment' | 'other';

export interface Category {
  id: number | string;           // ID định danh (int32) từ API hoặc categoryCode (backward compatibility)
  categoryCode: string;
  categoryName: string;
  departmentId: number;
  slaResolveHours: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CategoryDto {
  id: number;                    // ID định danh (int32) - REQUIRED từ Swagger
  categoryCode: string;
  categoryName: string;
  departmentId: number;
  slaResolveHours: number;
  status: 'ACTIVE' | 'INACTIVE' | 'Active' | 'Inactive';
}

export interface CategoryApiResponse {
  status: boolean;
  message: string;
  data: CategoryDto[];            // Backend trả về array của CategoryDto
  errors: string[];
}

export interface CategoryRequestDto {
  categoryCode: string;          // Mã category (REQUIRED)
  categoryName: string;         // Tên category (REQUIRED)
  departmentId: number;          // Bộ phận ID (REQUIRED) - SỐ NGUYÊN
  slaResolveHours: number;      // SLA (REQUIRED)
  // status KHÔNG gửi khi create (theo Swagger POST /api/Category)
}

export interface CategoryUpdateDto {
  categoryCode?: string;         // Mã category (optional) - có thể sửa theo Swagger
  categoryName?: string;         // Tên category (optional)
  departmentId?: number;          // Bộ phận ID (optional)
  slaResolveHours?: number;      // SLA (optional)
  // status KHÔNG gửi khi update (dùng updateStatus riêng)
}

export interface CategoryStatusUpdateDto {
  categoryId: number;                    // ID định danh (int32) - REQUIRED
  status: 'ACTIVE' | 'INACTIVE' | 'Active' | 'Inactive';
}

// Issue types (Frontend only - for UI flow)
export interface IssueType {
  id: string;
  name: string;
  category: IssueCategory;
  icon: string;
  description: string;
  examples: string[];
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
export type TicketStatus = 'open' | 'assigned' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed' | 'cancelled' | 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

// API Response Types for Tickets
export interface TicketFromApi {
  ticketCode: string;
  title: string;
  description: string;
  imageUrl: string;
  requesterCode: string;
  requesterName: string;
  assignedToCode: string;
  assignedToName: string;
  assignedToPhone?: string; // Số điện thoại nhân viên được giao
  managedByCode: string;
  managedByName: string;
  managedByPhone?: string; // Số điện thoại người quản lý
  locationCode: string;
  locationName: string;
  categoryCode: string;
  categoryName: string;
  status: string;
  contactPhone: string | null;
  note: string | null;
  createdAt: string;
  resolveDeadline: string;
  resolvedAt: string | null;
  closedAt: string | null;
  ratingStars: number | null;
  ratingComment: string | null;
}

export interface GetAllTicketsResponse {
  status: boolean;
  message: string;
  data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: TicketFromApi[];
  };
  errors: string[];
}

export interface Ticket {
  id: string;
  ticketCode?: string; // DB: ticket_code - Mã Ticket hiển thị (TKT-0001, Duy nhất)
  title: string; // DB: title - Tiêu đề
  description: string; // DB: description - Nội dung chi tiết
  // issueType?: IssueType; // Frontend only - không có trong DB
  // category?: IssueCategory; // Frontend only - dùng categoryId thay thế
  categoryId?: string; // DB: category_id (FK) - Loại sự cố
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Frontend only - không có trong DB
  status: TicketStatus; // DB: status - Trạng thái Ticket (New, Assigned, In_Progress, Resolved, Closed, Cancelled)
  location?: string; // Frontend only - dùng locationId thay thế
  locationId?: string; // DB: location_id (FK) - Địa điểm xảy ra
  locationName?: string; // From API: locationName - Tên địa điểm chi tiết
  campusName?: string; // From API: Tên campus (extracted from locationName or separate field)
  roomNumber?: string; // Frontend only - không có trong DB
  images?: string[]; // Frontend only - không có trong DB (thường lưu trong bảng riêng)
  createdBy?: string; // Deprecated - dùng requesterId thay thế
  requesterId?: string; // DB: requester_id (FK) - Người báo cáo
  requesterName?: string; // From API: requesterName - Tên người báo cáo
  createdByName?: string; // Frontend only - không có trong DB
  assignedTo?: string; // Deprecated - dùng assignedToId thay thế
  assignedToId?: string; // DB: assigned_to_id (FK) - Nhân viên kỹ thuật được giao việc (NULL khi mới tạo)
  assignedToName?: string; // From API: assignedToName - Tên người được giao
  assignedToPhone?: string; // From API: Số điện thoại của nhân viên được giao
  managedByCode?: string; // From API: managedByCode - Mã người quản lý
  managedByName?: string; // From API: managedByName - Tên người quản lý
  managedByPhone?: string; // From API: Số điện thoại của người quản lý
  categoryName?: string; // From API: categoryName - Tên loại sự cố
  contactPhone?: string; // From API: contactPhone - Số điện thoại liên hệ
  note?: string; // From API: note - Ghi chú từ staff/admin
  imageUrl?: string; // From API: imageUrl - URL ảnh từ backend
  createdAt: string; // DB: created_at - Thời gian tạo Ticket
  updatedAt?: string; // Frontend only - không có trong DB
  deadlineAt?: string; // DB: deadline_at - Hạn chót xử lý (Tính từ created_at + sla_resolve_hours)
  slaDeadline?: string; // Deprecated - dùng deadlineAt thay thế
  resolveDeadline?: string; // From API: resolve_deadline - Hạn giải quyết từ backend
  resolvedAt?: string; // DB: resolved_at - Thời gian Staff hoàn thành
  closedAt?: string; // DB: closed_at - Thời gian Ticket chính thức đóng lại (sau khi User Feedback)
  ratingStars?: number; // DB: rating_stars - Đánh giá sao (1-5)
  ratingComment?: string; // DB: rating_comment - Mô tả feedback
  slaTracking?: SLATracking; // Frontend only - không có trong DB (thường tính toán từ các timestamp)
  notes?: string; // Frontend only - không có trong DB (thường lưu trong bảng riêng)
  // Escalation fields (from backend)
  isEscalated?: boolean; // DB: is_escalated - Cờ đánh dấu ticket đã escalate
  escalatedAt?: string; // DB: escalated_at - Thời gian escalate
  escalationCount?: number; // DB: escalation_count - Số lần escalate
  escalationReason?: string; // DB: escalation_reason - Lý do escalate (VD: SLA miss, reassignment needed)
}

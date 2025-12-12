import type { Department, Location, Category, Ticket, SLATracking, SLATimelineEvent, UserRole } from '../types';
import { issueTypes } from './issueTypes';

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    code: 'CAT001',
    name: 'Cơ sở vật chất',
    description: 'Phản ánh về hư hỏng cơ sở vật chất: tường, sàn, trần, cửa...',
    icon: '🏢',
    color: '#3b82f6',
    slaResolveHours: 72, // 3 days
    defaultPriority: 'medium',
    departmentId: 'dept-2', // Facilities Management
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-2',
    code: 'CAT002',
    name: 'WiFi/Mạng',
    description: 'Vấn đề về kết nối WiFi, mạng chậm, mất kết nối',
    icon: '📶',
    color: '#10b981',
    slaResolveHours: 24, // 1 day
    defaultPriority: 'high',
    departmentId: 'dept-1', // IT Department
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-3',
    code: 'CAT003',
    name: 'Thiết bị',
    description: 'Hư hỏng thiết bị: máy chiếu, máy lạnh, đèn, quạt...',
    icon: '🖥️',
    color: '#f59e0b',
    slaResolveHours: 48, // 2 days
    defaultPriority: 'medium',
    departmentId: 'dept-1', // IT Department
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-4',
    code: 'CAT004',
    name: 'Điện nước',
    description: 'Vấn đề về điện, nước: mất điện, rò rỉ nước...',
    icon: '💡',
    color: '#ef4444',
    slaResolveHours: 24, // 1 day
    defaultPriority: 'high',
    departmentId: 'dept-2', // Facilities Management
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-5',
    code: 'CAT005',
    name: 'Vệ sinh',
    description: 'Vấn đề về vệ sinh: toilet, rác, làm sạch...',
    icon: '🧹',
    color: '#8b5cf6',
    slaResolveHours: 24, // 1 day
    defaultPriority: 'medium',
    departmentId: 'dept-2', // Facilities Management
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-6',
    code: 'CAT006',
    name: 'Khẩn cấp',
    description: 'Tình huống khẩn cấp cần xử lý ngay lập tức',
    icon: '🚨',
    color: '#dc2626',
    slaResolveHours: 4, // 4 hours
    defaultPriority: 'urgent',
    departmentId: 'dept-2', // Facilities Management
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
];

export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'IT Department',
    description: 'Bộ phận Công nghệ Thông tin - Quản lý hạ tầng IT và hỗ trợ kỹ thuật',
    location: 'Tầng 5, Tòa nhà Alpha',
    adminId: 'admin-001',
    staffIds: ['staff-001', 'staff-002'],
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-2',
    name: 'Facilities Management',
    description: 'Bộ phận Quản lý Cơ sở Vật chất - Bảo trì và quản lý tòa nhà',
    location: 'Tầng 1, Tòa nhà Alpha',
    adminId: 'admin-002',
    staffIds: ['staff-003', 'staff-004'],
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-3',
    name: 'Academic Affairs',
    description: 'Phòng Đào tạo - Quản lý học vụ và chương trình đào tạo',
    location: 'Tầng 2, Tòa nhà Beta',
    adminId: 'admin-003',
    staffIds: [],
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-4',
    name: 'Student Services',
    description: 'Phòng Công tác Sinh viên - Hỗ trợ và chăm sóc sinh viên',
    location: 'Tầng 1, Tòa nhà Beta',
    adminId: 'admin-004',
    staffIds: [],
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
];

export const mockLocations: Location[] = [
  {
    id: 'loc-1',
    code: 'LOC001',
    name: 'P301',
    description: 'Phòng học 301',
    type: 'classroom',
    floor: '3',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-2',
    code: 'LOC002',
    name: 'P302',
    description: 'Phòng học 302',
    type: 'classroom',
    floor: '3',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-3',
    code: 'LOC003',
    name: 'P501',
    description: 'Phòng học 501',
    type: 'classroom',
    floor: '5',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-4',
    code: 'LOC004',
    name: 'WC Tầng 2',
    description: 'Nhà vệ sinh tầng 2',
    type: 'wc',
    floor: '2',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-5',
    code: 'LOC005',
    name: 'Sảnh chính',
    description: 'Sảnh chính tòa nhà Alpha',
    type: 'hall',
    floor: 'G',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-6',
    code: 'LOC006',
    name: 'Hành lang Tầng 3',
    description: 'Hành lang tầng 3',
    type: 'corridor',
    floor: '3',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
];

// ============================================================================
// Mock Tickets Data
// ============================================================================

// Helper function to calculate SLA deadline based on priority
const calculateSLADeadline = (createdAt: string, priority: Ticket['priority']): string => {
  const created = new Date(createdAt);
  const slaHours = {
    urgent: 4,
    high: 24,
    medium: 48,
    low: 72,
  };
  
  created.setHours(created.getHours() + slaHours[priority]);
  return created.toISOString();
};

// SLA Timeline Events
export interface SLAEvent {
  id: string;
  ticketId: string;
  eventType: 'created' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'comment';
  title: string;
  description: string;
  performedBy: string;
  performedByRole: 'student' | 'staff' | 'admin' | 'system';
  timestamp: string;
}

export const mockSLAEvents: Record<string, SLAEvent[]> = {
  'TKT-001': [
    {
      id: 'evt-001-1',
      ticketId: 'TKT-001',
      eventType: 'created',
      title: 'Ticket được tạo',
      description: 'Sinh viên tạo ticket báo cáo máy chiếu hỏng',
      performedBy: 'Nguyễn Văn A',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-001-2',
      ticketId: 'TKT-001',
      eventType: 'assigned',
      title: 'Ticket được phân công',
      description: 'Hệ thống tự động phân công cho nhân viên kỹ thuật',
      performedBy: 'Hệ thống',
      performedByRole: 'system',
      timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-001-3',
      ticketId: 'TKT-001',
      eventType: 'in_progress',
      title: 'Bắt đầu xử lý',
      description: 'Nhân viên kỹ thuật đã đến hiện trường kiểm tra',
      performedBy: 'Trần Văn B',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-001-4',
      ticketId: 'TKT-001',
      eventType: 'comment',
      title: 'Cập nhật tiến độ',
      description: 'Đang chờ linh kiện thay thế, dự kiến hoàn thành trong 2 giờ',
      performedBy: 'Trần Văn B',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'TKT-002': [
    {
      id: 'evt-002-1',
      ticketId: 'TKT-002',
      eventType: 'created',
      title: 'Ticket được tạo',
      description: 'Sinh viên báo cáo WiFi không hoạt động',
      performedBy: 'Lê Thị C',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'TKT-003': [
    {
      id: 'evt-003-1',
      ticketId: 'TKT-003',
      eventType: 'created',
      title: 'Ticket được tạo',
      description: 'Sinh viên báo cáo điều hòa hỏng',
      performedBy: 'Phạm Văn D',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-003-2',
      ticketId: 'TKT-003',
      eventType: 'assigned',
      title: 'Ticket được phân công',
      description: 'Phân công cho bộ phận bảo trì cơ sở vật chất',
      performedBy: 'Hệ thống',
      performedByRole: 'system',
      timestamp: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-003-3',
      ticketId: 'TKT-003',
      eventType: 'in_progress',
      title: 'Bắt đầu xử lý',
      description: 'Kỹ thuật viên đã kiểm tra và xác định nguyên nhân',
      performedBy: 'Hoàng Văn E',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-003-4',
      ticketId: 'TKT-003',
      eventType: 'resolved',
      title: 'Đã giải quyết',
      description: 'Đã thay thế block lạnh mới, điều hòa hoạt động bình thường',
      performedBy: 'Hoàng Văn E',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'TKT-004': [
    {
      id: 'evt-004-1',
      ticketId: 'TKT-004',
      eventType: 'created',
      title: 'Ticket được tạo',
      description: 'Sinh viên báo cáo phòng học chưa được vệ sinh',
      performedBy: 'Vũ Thị F',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'TKT-005': [
    {
      id: 'evt-005-1',
      ticketId: 'TKT-005',
      eventType: 'created',
      title: 'Ticket được tạo',
      description: 'Sinh viên báo cáo thiếu bàn ghế',
      performedBy: 'Đỗ Văn G',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-005-2',
      ticketId: 'TKT-005',
      eventType: 'assigned',
      title: 'Ticket được phân công',
      description: 'Phân công cho bộ phận quản lý cơ sở vật chất',
      performedBy: 'Hệ thống',
      performedByRole: 'system',
      timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-005-3',
      ticketId: 'TKT-005',
      eventType: 'in_progress',
      title: 'Bắt đầu xử lý',
      description: 'Đã kiểm tra kho và đang chuẩn bị vận chuyển bàn ghế',
      performedBy: 'Bùi Thị H',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'TKT-006': [
    {
      id: 'evt-006-1',
      ticketId: 'TKT-006',
      eventType: 'created',
      title: 'Ticket được tạo',
      description: 'Sinh viên báo cáo mất điện',
      performedBy: 'Đinh Văn I',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-006-2',
      ticketId: 'TKT-006',
      eventType: 'assigned',
      title: 'Ticket được phân công',
      description: 'Phân công cho bộ phận điện',
      performedBy: 'Hệ thống',
      performedByRole: 'system',
      timestamp: new Date(Date.now() - 47.8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-006-3',
      ticketId: 'TKT-006',
      eventType: 'in_progress',
      title: 'Bắt đầu xử lý',
      description: 'Thợ điện đã đến kiểm tra',
      performedBy: 'Lý Văn K',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 47.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-006-4',
      ticketId: 'TKT-006',
      eventType: 'resolved',
      title: 'Đã giải quyết',
      description: 'Đã thay cầu dao bị hỏng, điện đã hoạt động trở lại',
      performedBy: 'Lý Văn K',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-006-5',
      ticketId: 'TKT-006',
      eventType: 'closed',
      title: 'Đóng ticket',
      description: 'Sinh viên xác nhận vấn đề đã được giải quyết',
      performedBy: 'Đinh Văn I',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'TKT-007': [
    {
      id: 'evt-007-1',
      ticketId: 'TKT-007',
      eventType: 'created',
      title: 'Ticket được tạo',
      description: 'Sinh viên báo cáo vòi nước hỏng',
      performedBy: 'Mai Thị L',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-007-2',
      ticketId: 'TKT-007',
      eventType: 'assigned',
      title: 'Ticket được phân công',
      description: 'Phân công cho bộ phận nước',
      performedBy: 'Hệ thống',
      performedByRole: 'system',
      timestamp: new Date(Date.now() - 95 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-007-3',
      ticketId: 'TKT-007',
      eventType: 'in_progress',
      title: 'Bắt đầu xử lý',
      description: 'Thợ sửa ống nước đã đến hiện trường',
      performedBy: 'Ngô Văn M',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 94 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-007-4',
      ticketId: 'TKT-007',
      eventType: 'resolved',
      title: 'Đã giải quyết',
      description: 'Đã thay vòi nước mới',
      performedBy: 'Ngô Văn M',
      performedByRole: 'staff',
      timestamp: new Date(Date.now() - 93 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-007-5',
      ticketId: 'TKT-007',
      eventType: 'closed',
      title: 'Đóng ticket',
      description: 'Xác nhận hoàn thành',
      performedBy: 'Mai Thị L',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 90 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'TKT-008': [
    {
      id: 'evt-008-1',
      ticketId: 'TKT-008',
      eventType: 'created',
      title: 'Ticket được tạo',
      description: 'Sinh viên báo cáo loa không có tiếng',
      performedBy: 'Phan Văn N',
      performedByRole: 'student',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Helper function to generate SLA tracking from events
const generateSLATracking = (
  ticketId: string,
  createdAt: string,
  slaDeadline: string,
  events: SLAEvent[]
): SLATracking => {
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const created = new Date(createdAt);
  
  const acknowledgedEvent = events.find(e => e.eventType === 'assigned');
  const startedEvent = events.find(e => e.eventType === 'in_progress');
  const resolvedEvent = events.find(e => e.eventType === 'resolved');
  const closedEvent = events.find(e => e.eventType === 'closed');
  
  const acknowledgedAt = acknowledgedEvent?.timestamp;
  const startedAt = startedEvent?.timestamp;
  const resolvedAt = resolvedEvent?.timestamp;
  const closedAt = closedEvent?.timestamp;
  
  const responseTime = acknowledgedAt 
    ? Math.round((new Date(acknowledgedAt).getTime() - created.getTime()) / (1000 * 60))
    : undefined;
  
  const resolutionTime = resolvedAt
    ? Math.round((new Date(resolvedAt).getTime() - created.getTime()) / (1000 * 60))
    : undefined;
  
  const isOverdue = now > deadline && !resolvedAt;
  const overdueBy = isOverdue 
    ? Math.round((now.getTime() - deadline.getTime()) / (1000 * 60))
    : undefined;
  
  // Convert SLAEvent to SLATimelineEvent
  const timeline: SLATimelineEvent[] = events.map((event, index) => {
    const prevEvent = index > 0 ? events[index - 1] : null;
    const duration = prevEvent
      ? Math.round((new Date(event.timestamp).getTime() - new Date(prevEvent.timestamp).getTime()) / (1000 * 60))
      : undefined;
    
    // Map eventType to status
    const statusMap: Record<string, SLATimelineEvent['status']> = {
      'created': 'open',
      'assigned': 'acknowledged',
      'in_progress': 'in-progress',
      'resolved': 'resolved',
      'closed': 'closed',
      'comment': 'in-progress',
    };
    
    return {
      id: event.id,
      timestamp: event.timestamp,
      status: statusMap[event.eventType] || 'open',
      actor: event.performedBy,
      actorRole: event.performedByRole as UserRole,
      action: event.title,
      note: event.description,
      duration,
    };
  });
  
  return {
    createdAt,
    acknowledgedAt,
    startedAt,
    resolvedAt,
    closedAt,
    deadline: slaDeadline,
    responseTime,
    resolutionTime,
    isOverdue,
    overdueBy,
    timeline,
  };
};

// Mock tickets data - loaded from backend or mock, NOT persisted to localStorage
export const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Máy chiếu phòng 501 không hoạt động',
    description: 'Máy chiếu trong phòng 501 không bật được, đã thử nhiều lần nhưng vẫn không có tín hiệu. Ảnh hưởng đến việc học của lớp.',
    category: 'equipment',
    priority: 'high',
    status: 'in-progress',
    location: 'Tòa nhà Alpha',
    roomNumber: '501',
    images: [],
    createdBy: 'student-001',
    createdByName: 'Nguyễn Văn A',
    assignedTo: 'staff-005',
    assignedToName: 'Trần Văn B',
    createdAt: '2025-12-11T20:46:01.175Z',
    updatedAt: '2025-12-11T23:46:01.175Z',
    ticketCode: 'TKT-001',
    categoryId: 'cat-3',
    locationId: 'loc-1',
    requesterId: 'student-001',
    assignedToId: 'staff-005',
    deadlineAt: '2025-12-12T20:46:01.175Z',
    slaDeadline: '2025-12-12T20:46:01.175Z',
    slaTracking: {
      createdAt: '2025-12-11T20:46:01.175Z',
      acknowledgedAt: '2025-12-11T21:16:01.175Z',
      startedAt: '2025-12-11T22:46:01.175Z',
      deadline: '2025-12-12T20:46:01.175Z',
      responseTime: 30,
      isOverdue: false,
      timeline: [
        {
          id: 'evt-001-1',
          timestamp: '2025-12-11T20:46:01.174Z',
          status: 'open',
          actor: 'Nguyễn Văn A',
          actorRole: 'student',
          action: 'Ticket được tạo',
          note: 'Sinh viên tạo ticket báo cáo máy chiếu hỏng'
        },
        {
          id: 'evt-001-2',
          timestamp: '2025-12-11T21:16:01.175Z',
          status: 'acknowledged',
          actor: 'Hệ thống',
          actorRole: 'system',
          action: 'Ticket được phân công',
          note: 'Hệ thống tự động phân công cho nhân viên kỹ thuật',
          duration: 30
        },
        {
          id: 'evt-001-3',
          timestamp: '2025-12-11T22:46:01.175Z',
          status: 'in-progress',
          actor: 'Trần Văn B',
          actorRole: 'staff',
          action: 'Bắt đầu xử lý',
          note: 'Nhân viên kỹ thuật đã đến hiện trường kiểm tra',
          duration: 90
        }
      ]
    }
  },
  {
    id: 'TKT-002',
    title: 'WiFi tầng 3 không kết nối được',
    description: 'Tất cả sinh viên ở tầng 3 đều không thể kết nối WiFi. Đã thử khởi động lại thiết bị nhưng vẫn không được.',
    category: 'wifi',
    priority: 'urgent',
    status: 'open',
    location: 'Tòa nhà Beta',
    roomNumber: '',
    images: [],
    createdBy: 'student-002',
    createdByName: 'Lê Thị C',
    createdAt: '2025-12-12T00:46:01.175Z',
    updatedAt: '2025-12-12T00:46:01.175Z',
    ticketCode: 'TKT-002',
    categoryId: 'cat-2',
    locationId: 'loc-2',
    requesterId: 'student-002',
    deadlineAt: '2025-12-12T04:46:01.175Z',
    slaDeadline: '2025-12-12T04:46:01.175Z',
    slaTracking: {
      createdAt: '2025-12-12T00:46:01.175Z',
      deadline: '2025-12-12T04:46:01.175Z',
      isOverdue: false,
      timeline: [
        {
          id: 'evt-002-1',
          timestamp: '2025-12-12T00:46:01.175Z',
          status: 'open',
          actor: 'Lê Thị C',
          actorRole: 'student',
          action: 'Ticket được tạo',
          note: 'Sinh viên báo cáo WiFi không hoạt động'
        }
      ]
    }
  },
  {
    id: 'TKT-003',
    title: 'Điều hòa phòng 302 hỏng',
    description: 'Điều hòa trong phòng 302 không làm lạnh, phòng rất nóng khiến sinh viên khó tập trung học.',
    category: 'facility',
    priority: 'medium',
    status: 'resolved',
    location: 'Tòa nhà Alpha',
    roomNumber: '302',
    images: [],
    createdBy: 'student-003',
    createdByName: 'Phạm Văn D',
    assignedTo: 'staff-003',
    assignedToName: 'Hoàng Văn E',
    createdAt: '2025-12-09T01:46:01.175Z',
    updatedAt: '2025-12-12T00:46:01.175Z',
    ticketCode: 'TKT-003',
    categoryId: 'cat-1',
    locationId: 'loc-1',
    requesterId: 'student-003',
    assignedToId: 'staff-003',
    deadlineAt: '2025-12-11T01:46:01.175Z',
    slaDeadline: '2025-12-11T01:46:01.175Z',
    resolvedAt: '2025-12-11T23:46:01.175Z',
    slaTracking: {
      createdAt: '2025-12-09T01:46:01.175Z',
      acknowledgedAt: '2025-12-09T03:46:01.175Z',
      startedAt: '2025-12-09T23:46:01.175Z',
      resolvedAt: '2025-12-11T23:46:01.175Z',
      deadline: '2025-12-11T01:46:01.175Z',
      responseTime: 120,
      resolutionTime: 4200,
      isOverdue: false,
      timeline: [
        {
          id: 'evt-003-1',
          timestamp: '2025-12-09T01:46:01.175Z',
          status: 'open',
          actor: 'Phạm Văn D',
          actorRole: 'student',
          action: 'Ticket được tạo',
          note: 'Sinh viên báo cáo điều hòa hỏng'
        },
        {
          id: 'evt-003-2',
          timestamp: '2025-12-09T03:46:01.175Z',
          status: 'acknowledged',
          actor: 'Hệ thống',
          actorRole: 'system',
          action: 'Ticket được phân công',
          note: 'Phân công cho bộ phận bảo trì cơ sở vật chất',
          duration: 120
        }
      ]
    }
  },
  {
    id: 'TKT-004',
    title: 'Phòng 401 chưa được dọn dẹp',
    description: 'Phòng học 401 chưa được vệ sinh, bàn ghế bẩn và có nhiều rác.',
    category: 'classroom',
    priority: 'low',
    status: 'open',
    location: 'Tòa nhà Alpha',
    roomNumber: '401',
    images: [],
    createdBy: 'student-004',
    createdByName: 'Vũ Thị F',
    createdAt: '2025-12-11T23:46:01.175Z',
    updatedAt: '2025-12-11T23:46:01.175Z',
    ticketCode: 'TKT-004',
    categoryId: 'cat-5',
    locationId: 'loc-1',
    requesterId: 'student-004',
    deadlineAt: '2025-12-14T23:46:01.175Z',
    slaDeadline: '2025-12-14T23:46:01.175Z',
    slaTracking: {
      createdAt: '2025-12-11T23:46:01.175Z',
      deadline: '2025-12-14T23:46:01.175Z',
      isOverdue: false,
      timeline: [
        {
          id: 'evt-004-1',
          timestamp: '2025-12-11T23:46:01.175Z',
          status: 'open',
          actor: 'Vũ Thị F',
          actorRole: 'student',
          action: 'Ticket được tạo',
          note: 'Sinh viên báo cáo phòng học chưa được vệ sinh'
        }
      ]
    }
  },
  {
    id: 'TKT-005',
    title: 'Thiếu bàn ghế phòng 205',
    description: 'Phòng 205 chỉ có 25 bàn ghế nhưng lớp có 35 sinh viên, cần bổ sung thêm 10 bộ bàn ghế.',
    category: 'facility',
    priority: 'medium',
    status: 'in-progress',
    location: 'Tòa nhà Beta',
    roomNumber: '205',
    images: [],
    createdBy: 'student-005',
    createdByName: 'Đỗ Văn G',
    assignedTo: 'staff-002',
    assignedToName: 'Bùi Thị H',
    createdAt: '2025-12-10T19:46:01.175Z',
    updatedAt: '2025-12-11T20:46:01.175Z',
    ticketCode: 'TKT-005',
    categoryId: 'cat-1',
    locationId: 'loc-2',
    requesterId: 'student-005',
    assignedToId: 'staff-002',
    deadlineAt: '2025-12-12T19:46:01.175Z',
    slaDeadline: '2025-12-12T19:46:01.175Z',
    slaTracking: {
      createdAt: '2025-12-10T19:46:01.175Z',
      acknowledgedAt: '2025-12-10T21:46:01.175Z',
      startedAt: '2025-12-11T15:46:01.175Z',
      deadline: '2025-12-12T19:46:01.175Z',
      responseTime: 120,
      isOverdue: false,
      timeline: [
        {
          id: 'evt-005-1',
          timestamp: '2025-12-10T19:46:01.175Z',
          status: 'open',
          actor: 'Đỗ Văn G',
          actorRole: 'student',
          action: 'Ticket được tạo',
          note: 'Sinh viên báo cáo thiếu bàn ghế'
        }
      ]
    }
  },
  {
    id: 'TKT-006',
    title: 'Mất điện phòng 101',
    description: 'Phòng 101 bị mất điện hoàn toàn, không thể sử dụng máy chiếu và đèn.',
    category: 'facility',
    priority: 'urgent',
    status: 'resolved',
    location: 'Tòa nhà Alpha',
    roomNumber: '101',
    images: [],
    createdBy: 'student-006',
    createdByName: 'Đinh Văn I',
    assignedTo: 'staff-001',
    assignedToName: 'Lý Văn K',
    createdAt: '2025-12-10T01:46:01.175Z',
    updatedAt: '2025-12-10T03:46:01.175Z',
    ticketCode: 'TKT-006',
    categoryId: 'cat-1',
    locationId: 'loc-1',
    requesterId: 'student-006',
    assignedToId: 'staff-001',
    deadlineAt: '2025-12-10T05:46:01.175Z',
    slaDeadline: '2025-12-10T05:46:01.175Z',
    resolvedAt: '2025-12-10T02:46:01.175Z',
    closedAt: '2025-12-10T03:46:01.175Z',
    slaTracking: {
      createdAt: '2025-12-10T01:46:01.175Z',
      acknowledgedAt: '2025-12-10T01:58:01.175Z',
      startedAt: '2025-12-10T02:16:01.175Z',
      resolvedAt: '2025-12-10T02:46:01.175Z',
      closedAt: '2025-12-10T03:46:01.175Z',
      deadline: '2025-12-10T05:46:01.175Z',
      responseTime: 12,
      resolutionTime: 60,
      isOverdue: false,
      timeline: [
        {
          id: 'evt-006-1',
          timestamp: '2025-12-10T01:46:01.175Z',
          status: 'open',
          actor: 'Đinh Văn I',
          actorRole: 'student',
          action: 'Ticket được tạo',
          note: 'Sinh viên báo cáo mất điện'
        }
      ]
    }
  },
  {
    id: 'TKT-007',
    title: 'Vòi nước nhà vệ sinh tầng 2 hỏng',
    description: 'Vòi nước trong nhà vệ sinh nam tầng 2 bị hỏng, nước chảy liên tục không tắt được.',
    category: 'facility',
    priority: 'high',
    status: 'closed',
    location: 'Tòa nhà Beta',
    roomNumber: '',
    images: [],
    createdBy: 'student-007',
    createdByName: 'Mai Thị L',
    assignedTo: 'staff-004',
    assignedToName: 'Ngô Văn M',
    createdAt: '2025-12-08T01:46:01.175Z',
    updatedAt: '2025-12-08T07:46:01.175Z',
    ticketCode: 'TKT-007',
    categoryId: 'cat-1',
    locationId: 'loc-2',
    requesterId: 'student-007',
    assignedToId: 'staff-004',
    deadlineAt: '2025-12-09T01:46:01.175Z',
    slaDeadline: '2025-12-09T01:46:01.175Z',
    resolvedAt: '2025-12-08T04:46:01.175Z',
    closedAt: '2025-12-08T07:46:01.175Z',
    slaTracking: {
      createdAt: '2025-12-08T01:46:01.175Z',
      acknowledgedAt: '2025-12-08T02:46:01.175Z',
      startedAt: '2025-12-08T03:46:01.175Z',
      resolvedAt: '2025-12-08T04:46:01.175Z',
      closedAt: '2025-12-08T07:46:01.175Z',
      deadline: '2025-12-09T01:46:01.175Z',
      responseTime: 60,
      resolutionTime: 180,
      isOverdue: false,
      timeline: [
        {
          id: 'evt-007-1',
          timestamp: '2025-12-08T01:46:01.175Z',
          status: 'open',
          actor: 'Mai Thị L',
          actorRole: 'student',
          action: 'Ticket được tạo',
          note: 'Sinh viên báo cáo vòi nước hỏng'
        }
      ]
    }
  },
  {
    id: 'TKT-008',
    title: 'Loa phòng 601 không có tiếng',
    description: 'Loa trong phòng 601 không phát ra tiếng, giáo viên phải nói rất to.',
    category: 'equipment',
    priority: 'medium',
    status: 'open',
    location: 'Tòa nhà Alpha',
    roomNumber: '601',
    images: [],
    createdBy: 'student-008',
    createdByName: 'Phan Văn N',
    createdAt: '2025-12-11T13:46:01.175Z',
    updatedAt: '2025-12-11T13:46:01.175Z',
    ticketCode: 'TKT-008',
    categoryId: 'cat-3',
    locationId: 'loc-1',
    requesterId: 'student-008',
    deadlineAt: '2025-12-13T13:46:01.175Z',
    slaDeadline: '2025-12-13T13:46:01.175Z',
    slaTracking: {
      createdAt: '2025-12-11T13:46:01.175Z',
      deadline: '2025-12-13T13:46:01.175Z',
      isOverdue: false,
      timeline: [
        {
          id: 'evt-008-1',
          timestamp: '2025-12-11T13:46:01.175Z',
          status: 'open',
          actor: 'Phan Văn N',
          actorRole: 'student',
          action: 'Ticket được tạo',
          note: 'Sinh viên báo cáo loa không có tiếng'
        }
      ]
    }
  }
];


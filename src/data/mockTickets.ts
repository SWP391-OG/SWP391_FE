import type { Ticket, SLATracking, SLATimelineEvent, UserRole } from '../types';
import { issueTypes } from './issueTypes';

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

// Generate mock tickets
const ticketData = [
  {
    id: 'TKT-001',
    title: 'Máy chiếu phòng 501 không hoạt động',
    description: 'Máy chiếu trong phòng 501 không bật được, đã thử nhiều lần nhưng vẫn không có tín hiệu. Ảnh hưởng đến việc học của lớp.',
    issueType: issueTypes[2],
    category: 'equipment' as const,
    priority: 'high' as const,
    status: 'in-progress' as const,
    location: 'Tòa nhà Alpha',
    roomNumber: '501',
    images: [] as string[],
    createdBy: 'student-001',
    createdByName: 'Nguyễn Văn A',
    assignedTo: 'staff-005',
    assignedToName: 'Trần Văn B',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TKT-002',
    title: 'WiFi tầng 3 không kết nối được',
    description: 'Tất cả sinh viên ở tầng 3 đều không thể kết nối WiFi. Đã thử khởi động lại thiết bị nhưng vẫn không được.',
    issueType: issueTypes[1],
    category: 'wifi' as const,
    priority: 'urgent' as const,
    status: 'open' as const,
    location: 'Tòa nhà Beta',
    roomNumber: '',
    images: [] as string[],
    createdBy: 'student-002',
    createdByName: 'Lê Thị C',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TKT-003',
    title: 'Điều hòa phòng 302 hỏng',
    description: 'Điều hòa trong phòng 302 không làm lạnh, phòng rất nóng khiến sinh viên khó tập trung học.',
    issueType: issueTypes[0],
    category: 'facility' as const,
    priority: 'medium' as const,
    status: 'resolved' as const,
    location: 'Tòa nhà Alpha',
    roomNumber: '302',
    images: [] as string[],
    createdBy: 'student-003',
    createdByName: 'Phạm Văn D',
    assignedTo: 'staff-003',
    assignedToName: 'Hoàng Văn E',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TKT-004',
    title: 'Phòng 401 chưa được dọn dẹp',
    description: 'Phòng học 401 chưa được vệ sinh, bàn ghế bẩn và có nhiều rác.',
    issueType: issueTypes[3],
    category: 'classroom' as const,
    priority: 'low' as const,
    status: 'open' as const,
    location: 'Tòa nhà Alpha',
    roomNumber: '401',
    images: [] as string[],
    createdBy: 'student-004',
    createdByName: 'Vũ Thị F',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TKT-005',
    title: 'Thiếu bàn ghế phòng 205',
    description: 'Phòng 205 chỉ có 25 bàn ghế nhưng lớp có 35 sinh viên, cần bổ sung thêm 10 bộ bàn ghế.',
    issueType: issueTypes[4],
    category: 'facility' as const,
    priority: 'medium' as const,
    status: 'in-progress' as const,
    location: 'Tòa nhà Beta',
    roomNumber: '205',
    images: [] as string[],
    createdBy: 'student-005',
    createdByName: 'Đỗ Văn G',
    assignedTo: 'staff-002',
    assignedToName: 'Bùi Thị H',
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TKT-006',
    title: 'Mất điện phòng 101',
    description: 'Phòng 101 bị mất điện hoàn toàn, không thể sử dụng máy chiếu và đèn.',
    issueType: issueTypes[5],
    category: 'facility' as const,
    priority: 'urgent' as const,
    status: 'resolved' as const,
    location: 'Tòa nhà Alpha',
    roomNumber: '101',
    images: [] as string[],
    createdBy: 'student-006',
    createdByName: 'Đinh Văn I',
    assignedTo: 'staff-001',
    assignedToName: 'Lý Văn K',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TKT-007',
    title: 'Vòi nước nhà vệ sinh tầng 2 hỏng',
    description: 'Vòi nước trong nhà vệ sinh nam tầng 2 bị hỏng, nước chảy liên tục không tắt được.',
    issueType: issueTypes[6],
    category: 'facility' as const,
    priority: 'high' as const,
    status: 'closed' as const,
    location: 'Tòa nhà Beta',
    roomNumber: '',
    images: [] as string[],
    createdBy: 'student-007',
    createdByName: 'Mai Thị L',
    assignedTo: 'staff-004',
    assignedToName: 'Ngô Văn M',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TKT-008',
    title: 'Loa phòng 601 không có tiếng',
    description: 'Loa trong phòng 601 không phát ra tiếng, giáo viên phải nói rất to.',
    issueType: issueTypes[2],
    category: 'equipment' as const,
    priority: 'medium' as const,
    status: 'open' as const,
    location: 'Tòa nhà Alpha',
    roomNumber: '601',
    images: [] as string[],
    createdBy: 'student-008',
    createdByName: 'Phan Văn N',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Generate complete tickets with SLA tracking
export const mockTickets: Ticket[] = ticketData.map(ticket => {
  const slaDeadline = calculateSLADeadline(ticket.createdAt, ticket.priority);
  const events = mockSLAEvents[ticket.id] || [];
  const slaTracking = generateSLATracking(ticket.id, ticket.createdAt, slaDeadline, events);
  
  return {
    ...ticket,
    slaDeadline,
    slaTracking,
  };
});

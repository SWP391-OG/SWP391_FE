import type { Ticket } from '../types';
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

// Generate mock tickets
export const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Máy chiếu phòng 501 không hoạt động',
    description: 'Máy chiếu trong phòng 501 không bật được, đã thử nhiều lần nhưng vẫn không có tín hiệu. Ảnh hưởng đến việc học của lớp.',
    issueType: issueTypes[2], // Equipment broken
    category: 'equipment',
    priority: 'high',
    status: 'in-progress',
    location: 'Tòa nhà Alpha',
    roomNumber: '501',
    images: [],
    createdBy: 'student-001',
    assignedTo: 'staff-005',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    slaDeadline: calculateSLADeadline(new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), 'high'),
  },
  {
    id: 'TKT-002',
    title: 'WiFi tầng 3 không kết nối được',
    description: 'Tất cả sinh viên ở tầng 3 đều không thể kết nối WiFi. Đã thử khởi động lại thiết bị nhưng vẫn không được.',
    issueType: issueTypes[1], // WiFi issue
    category: 'wifi',
    priority: 'urgent',
    status: 'open',
    location: 'Tòa nhà Beta',
    roomNumber: '',
    images: [],
    createdBy: 'student-002',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    slaDeadline: calculateSLADeadline(new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), 'urgent'),
  },
  {
    id: 'TKT-003',
    title: 'Điều hòa phòng 302 hỏng',
    description: 'Điều hòa trong phòng 302 không làm lạnh, phòng rất nóng khiến sinh viên khó tập trung học.',
    issueType: issueTypes[0], // Facility broken
    category: 'facility',
    priority: 'medium',
    status: 'resolved',
    location: 'Tòa nhà Alpha',
    roomNumber: '302',
    images: [],
    createdBy: 'student-003',
    assignedTo: 'staff-003',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    slaDeadline: calculateSLADeadline(new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), 'medium'),
  },
  {
    id: 'TKT-004',
    title: 'Phòng 401 chưa được dọn dẹp',
    description: 'Phòng học 401 chưa được vệ sinh, bàn ghế bẩn và có nhiều rác.',
    issueType: issueTypes[3], // Classroom dirty
    category: 'classroom',
    priority: 'low',
    status: 'open',
    location: 'Tòa nhà Alpha',
    roomNumber: '401',
    images: [],
    createdBy: 'student-004',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    slaDeadline: calculateSLADeadline(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 'low'),
  },
  {
    id: 'TKT-005',
    title: 'Thiếu bàn ghế phòng 205',
    description: 'Phòng 205 chỉ có 25 bàn ghế nhưng lớp có 35 sinh viên, cần bổ sung thêm 10 bộ bàn ghế.',
    issueType: issueTypes[4], // Facility lack
    category: 'facility',
    priority: 'medium',
    status: 'in-progress',
    location: 'Tòa nhà Beta',
    roomNumber: '205',
    images: [],
    createdBy: 'student-005',
    assignedTo: 'staff-002',
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    slaDeadline: calculateSLADeadline(new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), 'medium'),
  },
  {
    id: 'TKT-006',
    title: 'Mất điện phòng 101',
    description: 'Phòng 101 bị mất điện hoàn toàn, không thể sử dụng máy chiếu và đèn.',
    issueType: issueTypes[5], // Electricity issue
    category: 'facility',
    priority: 'urgent',
    status: 'resolved',
    location: 'Tòa nhà Alpha',
    roomNumber: '101',
    images: [],
    createdBy: 'student-006',
    assignedTo: 'staff-001',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    slaDeadline: calculateSLADeadline(new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), 'urgent'),
  },
  {
    id: 'TKT-007',
    title: 'Vòi nước nhà vệ sinh tầng 2 hỏng',
    description: 'Vòi nước trong nhà vệ sinh nam tầng 2 bị hỏng, nước chảy liên tục không tắt được.',
    issueType: issueTypes[6], // Water issue
    category: 'facility',
    priority: 'high',
    status: 'closed',
    location: 'Tòa nhà Beta',
    roomNumber: '',
    images: [],
    createdBy: 'student-007',
    assignedTo: 'staff-004',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 90 * 60 * 60 * 1000).toISOString(),
    slaDeadline: calculateSLADeadline(new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), 'high'),
  },
  {
    id: 'TKT-008',
    title: 'Loa phòng 601 không có tiếng',
    description: 'Loa trong phòng 601 không phát ra tiếng, giáo viên phải nói rất to.',
    issueType: issueTypes[2], // Equipment broken
    category: 'equipment',
    priority: 'medium',
    status: 'open',
    location: 'Tòa nhà Alpha',
    roomNumber: '601',
    images: [],
    createdBy: 'student-008',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    slaDeadline: calculateSLADeadline(new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), 'medium'),
  },
];

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

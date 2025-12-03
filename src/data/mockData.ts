import type { Department, Location, Category } from '../types';

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Cơ sở vật chất',
    description: 'Phản ánh về hư hỏng cơ sở vật chất: tường, sàn, trần, cửa...',
    icon: '🏢',
    color: '#3b82f6',
    slaResolveHours: 72, // 3 days
    defaultPriority: 'medium',
    departmentId: 'dept-2', // Facilities Management
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'WiFi/Mạng',
    description: 'Vấn đề về kết nối WiFi, mạng chậm, mất kết nối',
    icon: '📶',
    color: '#10b981',
    slaResolveHours: 24, // 1 day
    defaultPriority: 'high',
    departmentId: 'dept-1', // IT Department
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Thiết bị',
    description: 'Hư hỏng thiết bị: máy chiếu, máy lạnh, đèn, quạt...',
    icon: '🖥️',
    color: '#f59e0b',
    slaResolveHours: 48, // 2 days
    defaultPriority: 'medium',
    departmentId: 'dept-1', // IT Department
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Điện nước',
    description: 'Vấn đề về điện, nước: mất điện, rò rỉ nước...',
    icon: '💡',
    color: '#ef4444',
    slaResolveHours: 24, // 1 day
    defaultPriority: 'high',
    departmentId: 'dept-2', // Facilities Management
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Vệ sinh',
    description: 'Vấn đề về vệ sinh: toilet, rác, làm sạch...',
    icon: '🧹',
    color: '#8b5cf6',
    slaResolveHours: 24, // 1 day
    defaultPriority: 'medium',
    departmentId: 'dept-2', // Facilities Management
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cat-6',
    name: 'Khẩn cấp',
    description: 'Tình huống khẩn cấp cần xử lý ngay lập tức',
    icon: '🚨',
    color: '#dc2626',
    slaResolveHours: 4, // 4 hours
    defaultPriority: 'urgent',
    departmentId: 'dept-2', // Facilities Management
    status: 'active',
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
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-2',
    name: 'Facilities Management',
    description: 'Bộ phận Quản lý Cơ sở Vật chất - Bảo trì và quản lý tòa nhà',
    location: 'Tầng 1, Tòa nhà Alpha',
    adminId: 'admin-002',
    staffIds: ['staff-003', 'staff-004'],
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-3',
    name: 'Academic Affairs',
    description: 'Phòng Đào tạo - Quản lý học vụ và chương trình đào tạo',
    location: 'Tầng 2, Tòa nhà Beta',
    adminId: 'admin-003',
    staffIds: [],
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-4',
    name: 'Student Services',
    description: 'Phòng Công tác Sinh viên - Hỗ trợ và chăm sóc sinh viên',
    location: 'Tầng 1, Tòa nhà Beta',
    adminId: 'admin-004',
    staffIds: [],
    createdAt: '2024-01-15T08:00:00Z',
  },
];

export const mockLocations: Location[] = [
  {
    id: 'loc-1',
    name: 'P301',
    description: 'Phòng học 301',
    type: 'classroom',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-2',
    name: 'P302',
    description: 'Phòng học 302',
    type: 'classroom',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-3',
    name: 'P501',
    description: 'Phòng học 501',
    type: 'classroom',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-4',
    name: 'WC Tầng 2',
    description: 'Nhà vệ sinh tầng 2',
    type: 'wc',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-5',
    name: 'Sảnh chính',
    description: 'Sảnh chính tòa nhà Alpha',
    type: 'hall',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'loc-6',
    name: 'Hành lang Tầng 3',
    description: 'Hành lang tầng 3',
    type: 'corridor',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
];


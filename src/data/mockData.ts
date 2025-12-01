import { Department, Room } from '../types';

export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'IT Department',
    description: 'Bộ phận Công nghệ Thông tin - Quản lý hạ tầng IT và hỗ trợ kỹ thuật',
    location: 'Tầng 5, Tòa nhà Alpha',
    managerId: 'staff-001',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-2',
    name: 'Facilities Management',
    description: 'Bộ phận Quản lý Cơ sở Vật chất - Bảo trì và quản lý tòa nhà',
    location: 'Tầng 1, Tòa nhà Alpha',
    managerId: 'staff-002',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-3',
    name: 'Academic Affairs',
    description: 'Phòng Đào tạo - Quản lý học vụ và chương trình đào tạo',
    location: 'Tầng 2, Tòa nhà Beta',
    managerId: 'staff-003',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'dept-4',
    name: 'Student Services',
    description: 'Phòng Công tác Sinh viên - Hỗ trợ và chăm sóc sinh viên',
    location: 'Tầng 1, Tòa nhà Beta',
    managerId: 'staff-004',
    createdAt: '2024-01-15T08:00:00Z',
  },
];

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Alpha 501',
    departmentId: 'dept-1',
    capacity: 40,
    facilities: ['Projector', 'Air Conditioner', 'WiFi', 'Whiteboard'],
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'room-2',
    name: 'Alpha 502',
    departmentId: 'dept-1',
    capacity: 50,
    facilities: ['Projector', 'Air Conditioner', 'WiFi', 'Smart Board'],
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'room-3',
    name: 'Beta 201',
    departmentId: 'dept-3',
    capacity: 60,
    facilities: ['Projector', 'Air Conditioner', 'WiFi', 'Sound System'],
    status: 'maintenance',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'room-4',
    name: 'Beta 202',
    departmentId: 'dept-3',
    capacity: 45,
    facilities: ['Projector', 'Air Conditioner', 'WiFi'],
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'room-5',
    name: 'Alpha 101',
    departmentId: 'dept-2',
    capacity: 30,
    facilities: ['Air Conditioner', 'WiFi', 'Whiteboard'],
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
];


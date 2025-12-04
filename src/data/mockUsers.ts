import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'student',
    password: 'student123',
    fullName: 'Nguyễn Văn A',
    email: 'studentA@fpt.edu.vn',
    role: 'student',
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-002',
    username: 'itstaff',
    password: 'itstaff123',
    fullName: 'Trần Thị B',
    email: 'tranb@fpt.edu.vn',
    role: 'it-staff',
    status: 'active',
    createdAt: '2024-01-14T08:00:00Z',
  },
  {
    id: 'user-003',
    username: 'facilitystaff',
    password: 'facility123',
    fullName: 'Lê Văn C',
    email: 'lec@fpt.edu.vn',
    role: 'facility-staff',
    status: 'active',
    createdAt: '2024-01-13T08:00:00Z',
  },
  {
    id: 'user-004',
    username: 'admin',
    password: 'admin123',
    fullName: 'Phạm Thị D',
    email: 'phamd@fpt.edu.vn',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
  },
];

export const authenticateUser = (username: string, password: string): User | null => {
  const user = mockUsers.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
};


import type { User, UserRole } from '../types';
import { loadUsers, saveUsers } from '../utils/localStorage';

export const userService = {
  // Lấy tất cả users
  getAll(): User[] {
    return loadUsers();
  },

  // Lấy user theo ID
  getById(id: string): User | null {
    const users = this.getAll();
    return users.find(u => u.id === id) || null;
  },

  // Lấy user theo username
  getByUsername(username: string): User | null {
    const users = this.getAll();
    return users.find(u => u.username === username) || null;
  },

  // Lấy users theo role
  getByRole(role: UserRole): User[] {
    return this.getAll().filter(u => u.role === role);
  },

  // Lấy staff users (it-staff, facility-staff)
  getStaffUsers(): User[] {
    return this.getAll().filter(u => u.role === 'it-staff' || u.role === 'facility-staff');
  },

  // Lấy student/teacher users
  getStudentUsers(): User[] {
    return this.getAll().filter(u => u.role === 'student' || u.role === 'teacher');
  },

  // Tạo user mới
  create(user: Omit<User, 'id' | 'status' | 'createdAt'>): User {
    const users = this.getAll();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  // Cập nhật user
  update(id: string, updates: Partial<User>): User {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return users[index];
  },

  // Xóa user
  delete(id: string): void {
    const users = this.getAll().filter(u => u.id !== id);
    saveUsers(users);
  },

  // Login (verify username and password)
  login(username: string, password: string): User | null {
    const user = this.getByUsername(username);
    if (user && user.password === password && user.status === 'active') {
      return user;
    }
    return null;
  },
};

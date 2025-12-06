import type { Department } from '../types';
import { loadDepartments, saveDepartments } from '../utils/localStorage';

export const departmentService = {
  // Lấy tất cả departments
  getAll(): Department[] {
    return loadDepartments();
  },

  // Lấy department theo ID
  getById(id: string): Department | null {
    const departments = this.getAll();
    return departments.find(d => d.id === id) || null;
  },

  // Lấy departments theo adminId
  getByAdminId(adminId: string): Department[] {
    return this.getAll().filter(dept => dept.adminId === adminId);
  },

  // Tạo department mới
  create(department: Omit<Department, 'id' | 'createdAt'>): Department {
    const departments = this.getAll();
    const newDepartment: Department = {
      ...department,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    departments.push(newDepartment);
    saveDepartments(departments);
    return newDepartment;
  },

  // Cập nhật department
  update(id: string, updates: Partial<Department>): Department {
    const departments = this.getAll();
    const index = departments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Department not found');
    
    departments[index] = { ...departments[index], ...updates };
    saveDepartments(departments);
    return departments[index];
  },

  // Xóa department
  delete(id: string): void {
    const departments = this.getAll().filter(d => d.id !== id);
    saveDepartments(departments);
  },
};

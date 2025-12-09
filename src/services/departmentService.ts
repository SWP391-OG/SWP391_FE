import { apiClient } from './api';
import type { Department, DepartmentApiResponse } from '../types';

export const departmentService = {
  /**
   * Lấy tất cả departments từ API
   */
  async getAll(): Promise<Department[]> {
    try {
      console.log('🏢 Fetching departments...');
      
      const response = await apiClient.get<DepartmentApiResponse>('/Departments');
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch departments:', response);
        return [];
      }

      // Map backend data và thêm legacy fields cho backward compatibility
      const departments = response.data.map(dept => ({
        ...dept,
        id: dept.deptCode,           // Map deptCode -> id
        name: dept.deptName,         // Map deptName -> name
        isActive: dept.status === 'ACTIVE', // Map status -> isActive
      }));

      console.log('✅ Departments fetched:', departments.length);
      return departments;
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      return [];
    }
  },

  /**
   * Lấy department theo ID (deptCode)
   */
  async getById(id: string): Promise<Department | null> {
    try {
      const allDepartments = await this.getAll();
      return allDepartments.find(d => d.deptCode === id || d.id === id) || null;
    } catch (error) {
      console.error('❌ Error finding department by id:', error);
      return null;
    }
  },

  /**
   * Lấy departments theo adminId
   */
  async getByAdminId(adminId: string): Promise<Department[]> {
    try {
      const allDepartments = await this.getAll();
      return allDepartments.filter(dept => dept.adminId === adminId);
    } catch (error) {
      console.error('❌ Error filtering departments by adminId:', error);
      return [];
    }
  },

  /**
   * Tạo department mới (TODO: implement API when backend is ready)
   */
  async create(department: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
    console.warn('⚠️ Create department API not implemented yet');
    // Temporary: return mock data
    const newDepartment: Department = {
      ...department,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    return newDepartment;
  },

  /**
   * Cập nhật department (TODO: implement API when backend is ready)
   */
  async update(id: string, updates: Partial<Department>): Promise<Department> {
    console.warn('⚠️ Update department API not implemented yet');
    // Temporary: return mock data
    const allDepartments = await this.getAll();
    const dept = allDepartments.find(d => d.id === id);
    if (!dept) throw new Error('Department not found');
    return { ...dept, ...updates };
  },

  /**
   * Xóa department (TODO: implement API when backend is ready)
   */
  async delete(id: string): Promise<void> {
    console.warn('⚠️ Delete department API not implemented yet. ID:', id);
    // Temporary: do nothing
  },
};

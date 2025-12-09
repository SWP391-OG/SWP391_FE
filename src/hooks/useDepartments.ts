import { useState, useEffect } from 'react';
import type { Department } from '../types';
import { departmentService } from '../services/departmentService';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Load departments
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getAll();
      console.log('✅ Departments loaded in hook:', data.length);
      setDepartments(data);
    } catch (error) {
      console.error('❌ Error loading departments:', error);
      setDepartments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Tạo department mới
  const createDepartment = async (department: Omit<Department, 'id' | 'createdAt'>) => {
    try {
      const newDepartment = await departmentService.create(department);
      setDepartments([...departments, newDepartment]);
      return newDepartment;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  };

  // Cập nhật department
  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const updated = await departmentService.update(id, updates);
      setDepartments(departments.map(d => d.id === id ? updated : d));
      return updated;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  };

  // Xóa department
  const deleteDepartment = async (id: string) => {
    try {
      await departmentService.delete(id);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  };

  // Get departments by admin ID
  const getDepartmentsByAdminId = async (adminId: string) => {
    return departmentService.getByAdminId(adminId);
  };

  return {
    departments,
    loading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentsByAdminId,
    loadDepartments,
  };
};

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

  const loadDepartments = () => {
    setLoading(true);
    try {
      const data = departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo department mới
  const createDepartment = (department: Omit<Department, 'id' | 'createdAt'>) => {
    try {
      const newDepartment = departmentService.create(department);
      setDepartments([...departments, newDepartment]);
      return newDepartment;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  };

  // Cập nhật department
  const updateDepartment = (id: string, updates: Partial<Department>) => {
    try {
      const updated = departmentService.update(id, updates);
      setDepartments(departments.map(d => d.id === id ? updated : d));
      return updated;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  };

  // Xóa department
  const deleteDepartment = (id: string) => {
    try {
      departmentService.delete(id);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  };

  // Get departments by admin ID
  const getDepartmentsByAdminId = (adminId: string) => {
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

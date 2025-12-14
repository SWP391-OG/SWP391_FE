import { useState, useEffect } from 'react';
import type { Department, DepartmentRequestDto, DepartmentUpdateDto } from '../types';
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
  const createDepartment = async (department: DepartmentRequestDto) => {
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
  const updateDepartment = async (departmentId: number, updates: DepartmentUpdateDto) => {
    try {
      const updated = await departmentService.update(departmentId, updates);
      setDepartments(departments.map(d => 
        (typeof d.id === 'number' && d.id === departmentId) || 
        (typeof d.id === 'string' && parseInt(d.id, 10) === departmentId)
          ? updated 
          : d
      ));
      return updated;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  };

  // Cập nhật status của department
  const updateDepartmentStatus = async (departmentId: number, status: 'ACTIVE' | 'INACTIVE') => {
    try {
      await departmentService.updateStatus(departmentId, status);
      setDepartments(departments.map(d => {
        const match = (typeof d.id === 'number' && d.id === departmentId) || 
                      (typeof d.id === 'string' && parseInt(d.id, 10) === departmentId);
        if (match) {
          return { ...d, status, isActive: status === 'ACTIVE' };
        }
        return d;
      }));
    } catch (error) {
      console.error('Error updating department status:', error);
      throw error;
    }
  };

  // Xóa department
  const deleteDepartment = async (departmentId: number) => {
    try {
      await departmentService.delete(departmentId);
      setDepartments(departments.filter(d => 
        !((typeof d.id === 'number' && d.id === departmentId) || 
          (typeof d.id === 'string' && parseInt(d.id, 10) === departmentId))
      ));
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
    updateDepartmentStatus,
    deleteDepartment,
    getDepartmentsByAdminId,
    loadDepartments,
  };
};

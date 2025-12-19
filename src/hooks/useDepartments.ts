// Hook quản lý state và thao tác CRUD cho Bộ phận (Department) ở phía client
import { useState, useEffect } from 'react';
import type { Department, DepartmentRequestDto, DepartmentUpdateDto } from '../types';
import { departmentService } from '../services/departmentService';

export const useDepartments = () => {
  // Danh sách bộ phận hiện có trong hệ thống
  const [departments, setDepartments] = useState<Department[]>([]);
  // Trạng thái đang tải dữ liệu
  const [loading, setLoading] = useState(false);

  // Khi hook được sử dụng lần đầu, tự động load danh sách bộ phận
  useEffect(() => {
    loadDepartments();
  }, []);

  // Gọi API lấy toàn bộ danh sách bộ phận và cập nhật state
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

  // Tạo department mới (gọi API rồi append vào state)
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

  // Cập nhật thông tin bộ phận (mã, tên, trạng thái) theo departmentId
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

  // Cập nhật trạng thái hoạt động / không hoạt động cho bộ phận
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

  // Xóa bộ phận theo departmentId
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

  // Lấy danh sách bộ phận thuộc về một admin cụ thể (dùng cho phân quyền)
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

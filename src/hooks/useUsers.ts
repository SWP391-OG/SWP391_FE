// Hook quản lý state và thao tác CRUD cho Người dùng (User) trong hệ thống
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserRole } from '../types';
import { userService } from '../services/userService';

export const useUsers = () => {
  // Danh sách toàn bộ user (admin, staff, student, teacher,...)
  const [users, setUsers] = useState<User[]>([]);
  // Trạng thái loading cho mọi thao tác
  const [loading, setLoading] = useState(false);
  // Lưu thông báo lỗi (nếu có)
  const [error, setError] = useState<string | null>(null);

  /**
   * Load users từ API
   */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load danh sách user ngay khi hook được mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Tạo user mới (gọi API rồi reload lại danh sách)
   */
  const createUser = async (userData: {
    userCode: string;
    fullName: string;
    password: string;
    email: string;
    phoneNumber?: string;
    role: UserRole;
    departmentId?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.create(userData);
      await loadUsers(); // Reload list
      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật thông tin user (dùng cho Staff, Student,... trong trang admin)
   */
  const updateUser = async (userId: number, updates: {
    userCode?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    role?: UserRole;
    roleId?: number;
    departmentId?: number;
    password?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userService.update(userId, updates);
      await loadUsers(); // Reload list
      return updated;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật trạng thái user (active / inactive) - dùng để khóa / mở khóa tài khoản
   */
  const updateUserStatus = async (userId: number, status: 'active' | 'inactive') => {
    setLoading(true);
    setError(null);
    try {
      await userService.updateStatus(userId, status);
      await loadUsers(); // Reload list
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa user theo userCode
   */
  const deleteUser = async (userCode: string) => {
    setLoading(true);
    setError(null);
    try {
      await userService.delete(userCode);
      await loadUsers(); // Reload list
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lọc user theo role (tính toán từ state users hiện tại, không gọi API)
   */
  const getUsersByRole = useCallback((role: UserRole) => {
    return users.filter(u => u.role === role);
  }, [users]);

  /**
   * Lấy danh sách staff (it-staff, facility-staff) - KHÔNG bao gồm admin
   */
  const getStaffUsers = useMemo(() => {
    return users.filter(u => u.role === 'it-staff' || u.role === 'facility-staff');
  }, [users]);

  /**
   * Lấy danh sách student/teacher - KHÔNG bao gồm admin và staff
   */
  const getStudentUsers = useMemo(() => {
    return users.filter(u => 
      u.role === 'student' || 
      u.role === 'teacher'
    );
  }, [users]);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    getUsersByRole,
    getStaffUsers,
    getStudentUsers,
    loadUsers,
  };
};

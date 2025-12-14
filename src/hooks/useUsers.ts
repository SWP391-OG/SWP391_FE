import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserRole } from '../types';
import { userService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Load khi component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Tạo user mới
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
   * Cập nhật user
   */
  const updateUser = async (userId: number, updates: {
    userCode?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    role?: UserRole;
    departmentId?: number;
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
   * Cập nhật trạng thái user (khóa/mở khóa)
   */
  const updateUserStatus = async (userId: number, status: 'active' | 'inactive' | 'banned') => {
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
   * Xóa user
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
   * Filter users by role (computed from users state)
   */
  const getUsersByRole = useCallback((role: UserRole) => {
    return users.filter(u => u.role === role);
  }, [users]);

  /**
   * Get staff users (it-staff, facility-staff) - KHÔNG bao gồm admin
   */
  const getStaffUsers = useMemo(() => {
    return users.filter(u => u.role === 'it-staff' || u.role === 'facility-staff');
  }, [users]);

  /**
   * Get student/teacher users - KHÔNG bao gồm admin và staff
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

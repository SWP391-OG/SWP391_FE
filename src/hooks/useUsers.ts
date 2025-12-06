import { useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { userService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    try {
      const data = userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo user mới
  const createUser = (user: Omit<User, 'id' | 'status' | 'createdAt'>) => {
    try {
      const newUser = userService.create(user);
      setUsers([...users, newUser]);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  // Cập nhật user
  const updateUser = (id: string, updates: Partial<User>) => {
    try {
      const updated = userService.update(id, updates);
      setUsers(users.map(u => u.id === id ? updated : u));
      return updated;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Xóa user
  const deleteUser = (id: string) => {
    try {
      userService.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // Get users by role
  const getUsersByRole = (role: UserRole) => {
    return userService.getByRole(role);
  };

  // Get staff users
  const getStaffUsers = () => {
    return userService.getStaffUsers();
  };

  // Get student users
  const getStudentUsers = () => {
    return userService.getStudentUsers();
  };

  // Login
  const login = (username: string, password: string) => {
    return userService.login(username, password);
  };

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    getStaffUsers,
    getStudentUsers,
    login,
    loadUsers,
  };
};

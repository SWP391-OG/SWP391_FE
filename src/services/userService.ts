import { apiClient } from './api';
import type { User, UserRole, UserDto, UserApiResponse, UserSingleApiResponse, UserRequestDto, UserUpdateDto, ROLE_ID_MAP, ROLE_TO_ID_MAP } from '../types';

// Import role mappings (dựa vào database thực tế)
const ROLE_ID_MAP: Record<number, UserRole> = {
  1: 'admin',        // AD01 - Admin
  2: 'it-staff',     // ST01 - Staff (IT hoặc Facility)
  3: 'student',      // ST101 - Student
  4: 'teacher',      // Teacher (nếu có)
  5: 'facility-staff', // Facility staff (nếu khác với IT staff)
};

const ROLE_TO_ID_MAP: Record<UserRole, number> = {
  'admin': 1,
  'it-staff': 2,
  'student': 3,
  'teacher': 4,
  'facility-staff': 5,
};

/**
 * User Service - Gọi API thật
 * API Base: /api/User
 */
export const userService = {
  /**
   * Lấy tất cả users
   * GET /api/User
   */
  async getAll(): Promise<User[]> {
    try {
      console.log('👥 Fetching users...');
      
      const response = await apiClient.get<UserApiResponse>('/User');
      
      console.log('👥 Raw API Response:', response);
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch users:', response);
        return [];
      }

      // Backend trả về array trực tiếp
      const items: UserDto[] = Array.isArray(response.data) ? response.data : [];
      
      // Map backend data sang frontend format
      const users: User[] = items.map(this.mapDtoToUser);

      console.log(`✅ Users fetched: ${users.length} items`);
      return users;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }
  },

  /**
   * Lấy user profile của current user
   * GET /api/User/profile
   */
  async getProfile(): Promise<User | null> {
    try {
      console.log('👤 Fetching user profile...');
      
      const response = await apiClient.get<UserSingleApiResponse>('/User/profile');
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch profile:', response);
        return null;
      }

      const user = this.mapDtoToUser(response.data);
      console.log('✅ Profile fetched:', user);
      return user;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return null;
    }
  },

  /**
   * Lấy user theo userCode
   */
  async getByCode(userCode: string): Promise<User | null> {
    try {
      const allUsers = await this.getAll();
      return allUsers.find(u => u.userCode === userCode) || null;
    } catch (error) {
      console.error('❌ Error finding user by code:', error);
      return null;
    }
  },

  /**
   * Tạo user mới
   * POST /api/User
   */
  async create(userData: {
    userCode: string;
    fullName: string;
    password: string;
    email: string;
    phoneNumber?: string;
    role: UserRole;
    departmentId?: number;
  }): Promise<User> {
    try {
      console.log('👥 Creating user...', userData);
      
      const requestData: UserRequestDto = {
        userCode: userData.userCode,
        fullName: userData.fullName,
        passwordHash: userData.password, // Backend sẽ hash
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        roleId: ROLE_TO_ID_MAP[userData.role],
        departmentId: userData.departmentId,
        status: 'ACTIVE',
      };
      
      const response = await apiClient.post<UserSingleApiResponse>('/User', requestData);
      
      if (!response.status) {
        console.error('❌ Failed to create user:', response);
        throw new Error(response.message || 'Failed to create user');
      }

      console.log('✅ User created successfully');
      
      return this.mapDtoToUser(response.data);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  /**
   * Cập nhật user
   * PUT /api/User/{userCode}
   */
  async update(userCode: string, updates: {
    fullName?: string;
    phoneNumber?: string;
    role?: UserRole;
    departmentId?: number;
    status?: 'active' | 'inactive' | 'banned';
  }): Promise<User> {
    try {
      console.log(`👥 Updating user ${userCode}...`, updates);
      
      const requestData: UserUpdateDto = {
        fullName: updates.fullName,
        phoneNumber: updates.phoneNumber,
        roleId: updates.role ? ROLE_TO_ID_MAP[updates.role] : undefined,
        departmentId: updates.departmentId,
        status: updates.status ? updates.status.toUpperCase() : undefined,
      };
      
      const response = await apiClient.put<UserSingleApiResponse>(`/User/${encodeURIComponent(userCode)}`, requestData);
      
      if (!response.status) {
        console.error('❌ Failed to update user:', response);
        throw new Error(response.message || 'Failed to update user');
      }

      console.log('✅ User updated successfully');
      
      return this.mapDtoToUser(response.data);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  },

  /**
   * Xóa user (soft delete)
   * DELETE /api/User?code=xxx
   */
  async delete(userCode: string): Promise<void> {
    try {
      console.log(`👥 Deleting user: ${userCode}`);
      
      const response = await apiClient.delete<UserApiResponse>(`/User?code=${encodeURIComponent(userCode)}`);
      
      if (!response.status) {
        console.error('❌ Failed to delete user:', response);
        throw new Error(response.message || 'Failed to delete user');
      }

      console.log('✅ User deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Helper: Map UserDto từ API sang User format của frontend
   */
  mapDtoToUser(dto: UserDto): User {
    return {
      id: dto.userCode,
      userCode: dto.userCode,
      username: dto.email, // Use email as username
      password: '', // Don't expose password
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber || undefined,
      role: ROLE_ID_MAP[dto.roleId] || 'student',
      roleId: dto.roleId.toString(),
      departmentId: dto.departmentId?.toString(),
      status: dto.status.toLowerCase() as 'active' | 'inactive' | 'banned',
      createdAt: dto.createdAt || undefined,
    };
  },
};

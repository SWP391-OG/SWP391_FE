import { apiClient } from './api';
import type { User, UserRole, UserDto, UserApiResponse, UserSingleApiResponse, UserRequestDto, UserUpdateDto, UserStatusUpdateDto, UserProfileApiResponse, UserUpdateProfileDto, UserProfileDto } from '../types';

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
  async getProfile(): Promise<UserProfileDto | null> {
    try {
      console.log('👤 Fetching user profile...');
      
      const response = await apiClient.get<UserProfileApiResponse>('/User/profile');
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch profile:', response);
        return null;
      }

      console.log('✅ Profile fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return null;
    }
  },

  /**
   * Cập nhật profile của current user
   * PUT /api/User/profile
   */
  async updateProfile(updates: UserUpdateProfileDto): Promise<UserProfileDto | null> {
    try {
      console.log('👤 Updating user profile...', updates);
      
      const response = await apiClient.put<UserProfileApiResponse>('/User/profile', updates);
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to update profile:', response);
        throw new Error(response.message || 'Failed to update profile');
      }

      console.log('✅ Profile updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
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
   * Theo Swagger: Request body UserCreateDto, Response 201 với ApiResponse<UserDto>
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
      
      // Validate required fields
      if (!userData.userCode || !userData.userCode.trim()) {
        throw new Error('Mã người dùng (userCode) là bắt buộc');
      }
      if (!userData.fullName || !userData.fullName.trim()) {
        throw new Error('Họ và tên (fullName) là bắt buộc');
      }
      if (!userData.password || !userData.password.trim()) {
        throw new Error('Mật khẩu (password) là bắt buộc');
      }
      if (!userData.email || !userData.email.trim()) {
        throw new Error('Email là bắt buộc');
      }
      if (!userData.password || !userData.password.trim()) {
        throw new Error('Mật khẩu (password) là bắt buộc');
      }
      if (!userData.role) {
        throw new Error('Vai trò (role) là bắt buộc');
      }
      
      // Map role to roleId
      const roleId = ROLE_TO_ID_MAP[userData.role];
      if (!roleId) {
        throw new Error(`Vai trò không hợp lệ: ${userData.role}`);
      }
      
      // Theo Swagger: UserCreateDto có thể khác với UserRequestDto
      // Nhưng hiện tại dùng UserRequestDto, nếu backend expect field khác thì cần điều chỉnh
      const requestData: UserRequestDto = {
        userCode: userData.userCode.trim(),
        fullName: userData.fullName.trim(),
        passwordHash: userData.password, // Backend sẽ hash password
        email: userData.email.trim(),
        phoneNumber: userData.phoneNumber?.trim(),
        roleId: roleId,
        departmentId: userData.departmentId,
        status: 'ACTIVE', // Default status khi tạo mới
      };
      
      console.log('👥 Request body:', JSON.stringify(requestData, null, 2));
      
      // Theo Swagger: Response 201 với ApiResponse<UserDto>
      const response = await apiClient.post<UserSingleApiResponse>('/User', requestData);
      
      console.log('👥 API Response:', JSON.stringify(response, null, 2));
      
      if (!response.status) {
        const errorMsg = response.message || 'Failed to create user';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to create user:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      if (!response.data) {
        console.error('❌ Response data is null:', response);
        throw new Error('Backend trả về dữ liệu rỗng. Vui lòng thử lại.');
      }

      console.log('✅ User created successfully:', response.data);
      
      return this.mapDtoToUser(response.data);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      
      // Improve error messages
      if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          throw new Error(`Dữ liệu không hợp lệ: ${error.message}. Vui lòng kiểm tra lại thông tin nhập vào.`);
        }
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          throw new Error('Bạn không có quyền tạo user. Chỉ admin mới có thể tạo user.');
        }
        if (error.message.includes('409') || error.message.includes('Conflict')) {
          throw new Error('Email hoặc mã người dùng đã tồn tại. Vui lòng sử dụng email/mã khác.');
        }
      }
      
      throw error;
    }
  },

  /**
   * Cập nhật user
   * PUT /api/User/{userId}
   */
  async update(userId: number, updates: {
    userCode?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    role?: UserRole;
    roleId?: number;
    departmentId?: number;
    password?: string;
  }): Promise<User> {
    try {
      console.log(`👥 Updating user ${userId}...`, updates);
      
      const requestData: UserUpdateDto = {
        userCode: updates.userCode,
        fullName: updates.fullName,
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        roleId: updates.roleId || (updates.role ? ROLE_TO_ID_MAP[updates.role] : undefined),
        departmentId: updates.departmentId,
        // Chỉ gửi passwordHash nếu có giá trị
        ...(updates.password && updates.password.trim() ? { passwordHash: updates.password } : {}),
        // status KHÔNG gửi trong update (dùng updateStatus riêng)
      };
      
      console.log(`📤 Request payload:`, requestData);
      
      const response = await apiClient.put<UserSingleApiResponse>(`/User/${userId}`, requestData);
      
      if (!response.status) {
        console.error('❌ Failed to update user:', response);
        throw new Error(response.message || 'Failed to update user');
      }

      console.log('✅ User updated successfully:', response.message);
      
      // API có thể trả về data: null, trong trường hợp đó trả về user cũ
      if (!response.data) {
        console.warn('⚠️ No user data in response, using existing data');
        // Trả về user object đơn giản với data đã update
        return {
          id: userId,
          userCode: updates.userCode || '',
          username: updates.email || '',
          password: '',
          fullName: updates.fullName || '',
          email: updates.email || '',
          phoneNumber: updates.phoneNumber,
          role: updates.role || 'student',
          roleId: updates.roleId?.toString() || '',
          departmentId: updates.departmentId?.toString(),
          status: 'active',
        };
      }
      
      return this.mapDtoToUser(response.data);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái user (khóa/mở khóa)
   * PATCH /api/User - chỉ cập nhật status
   */
  async updateStatus(userId: number, status: 'active' | 'inactive' | 'banned'): Promise<void> {
    try {
      console.log(`👥 Updating user status ${userId}...`, status);
      
      const requestData: UserStatusUpdateDto = {
        userId: userId,
        status: status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'BANNED',
      };
      
      interface UserStatusUpdateResponse {
        status: boolean;
        message: string;
        data: null;
        errors: string[];
      }
      
      const response = await apiClient.patch<UserStatusUpdateResponse>('/User/status', requestData);
      
      if (!response.status) {
        console.error('❌ Failed to update user status:', response);
        throw new Error(response.message || 'Failed to update user status');
      }

      console.log('✅ User status updated successfully');
    } catch (error) {
      console.error('❌ Error updating user status:', error);
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
  mapDtoToUser(dto: UserDto | null | undefined): User {
    if (!dto) {
      throw new Error('Invalid user data received from API');
    }
    
    return {
      id: dto.id, // Use id (int32) from API
      userCode: dto.userCode,
      username: dto.email, // Use email as username
      password: '', // Don't expose password
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber || undefined,
      role: ROLE_ID_MAP[dto.roleId] || 'student',
      roleId: dto.roleId?.toString() || '',
      departmentId: dto.departmentId?.toString(),
      departmentName: dto.departmentName || undefined,
      status: (dto.status?.toLowerCase() || 'active') as 'active' | 'inactive' | 'banned',
      createdAt: dto.createdAt || undefined,
    };
  },
};

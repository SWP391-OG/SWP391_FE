import { apiClient } from './api';
import type { User, UserRole, UserDto, UserApiResponse, UserSingleApiResponse, UserRequestDto, UserUpdateDto, UserStatusUpdateDto, UserProfileApiResponse, UserUpdateProfileDto, UserProfileDto } from '../types';

// ════════════════════════════════════════════════════════════════════════════════════
// 👥 [USER SERVICE] - Quản lý dữ liệu users từ API
// ════════════════════════════════════════════════════════════════════════════════════
// Công dụng:
// - Lấy danh sách users
// - Tạo user mới
// - Cập nhật user
// - Xóa user
// - Quản lý user profile
// API Base: /api/User
// ════════════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────────
// 🔄 [ROLE MAPPING] - Map role từ backend (roleId) sang frontend (UserRole)
// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * 🔄 Map từ roleId (backend) sang UserRole (frontend)
 * Backend dùng số (1, 2, 3...), frontend dùng string ('admin', 'student'...)
 * 
 * @example
 * ROLE_ID_MAP[1] = 'admin'      // AD01
 * ROLE_ID_MAP[2] = 'it-staff'   // ST01
 * ROLE_ID_MAP[3] = 'student'    // ST101
 */
const ROLE_ID_MAP: Record<number, UserRole> = {
  1: 'admin',        // AD01 - Admin
  2: 'it-staff',     // ST01 - Staff (IT hoặc Facility)
  3: 'student',      // ST101 - Student
  4: 'teacher',      // Teacher (nếu có)
  5: 'facility-staff', // Facility staff (nếu khác với IT staff)
};

/**
 * 🔄 Map từ UserRole (frontend) sang roleId (backend)
 * Dùng khi gửi request tạo/cập nhật user
 */
const ROLE_TO_ID_MAP: Record<UserRole, number> = {
  'admin': 1,
  'it-staff': 2,
  'student': 3,
  'teacher': 4,
  'facility-staff': 5,
};

/**
 * 👥 USER SERVICE - Các operations liên quan đến users
 * Gọi API từ /api/User endpoint
 */
export const userService = {
  // ─────────────────────────────────────────────────────────────────────────────────
  // 📥 [GET OPERATIONS] - Lấy dữ liệu users
  // ─────────────────────────────────────────────────────────────────────────────────
  
  /**
   * 👥 Lấy tất cả users từ API
   * GET /api/User
   * @returns Mảng User objects
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
   * 👤 Lấy profile của current user (user đang login)
   * GET /api/User/profile
   * @returns UserProfileDto hoặc null nếu thất bại
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

  // ─────────────────────────────────────────────────────────────────────────────────
  // 🔄 [UPDATE OPERATIONS] - Cập nhật dữ liệu users
  // ─────────────────────────────────────────────────────────────────────────────────
  
  /**
   * ✏️ Cập nhật profile của current user
   * PUT /api/User/profile
   * @param updates - Thông tin cần cập nhật
   * @returns UserProfileDto cập nhật hoặc null nếu thất bại
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
   * 🔍 Tìm user theo userCode
   * Dùng client-side filtering từ getAll() - không gọi API riêng
   * 
   * @param userCode - Mã người dùng (ví dụ: "AD01", "ST101")
   * @returns User object hoặc null nếu không tìm thấy
   * 
   * @example
   * const user = await userService.getByCode('ST101');
   * console.log(user); // { id: 1, userCode: 'ST101', fullName: 'Nguyễn A', ... }
   */
  async getByCode(userCode: string): Promise<User | null> {
    try {
      // 📥 Lấy tất cả users
      const allUsers = await this.getAll();
      
      // 🔍 Tìm user có userCode khớp
      return allUsers.find(u => u.userCode === userCode) || null;
    } catch (error) {
      console.error('❌ Error finding user by code:', error);
      return null;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────────
  // 🆕 [CREATE OPERATION] - Tạo user mới
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * 🆕 Tạo user mới với kiểm tra validation đầy đủ
   * POST /api/User
   * 
   * ⚙️ VALIDATION RULES:
   * - userCode: Bắt buộc, không được trống (ví dụ: "AD01", "ST101")
   * - fullName: Bắt buộc, không được trống
   * - password: Bắt buộc, không được trống (backend sẽ hash)
   * - email: Bắt buộc, không được trống
   * - role: Bắt buộc, phải là một trong các UserRole hợp lệ
   * 
   * 🔄 ROLE MAPPING:
   * Frontend role → roleId gửi lên backend
   * 'admin' → 1, 'it-staff' → 2, 'student' → 3, 'teacher' → 4, 'facility-staff' → 5
   * 
   * 📤 ERRORS:
   * - HTTP 400: Dữ liệu không hợp lệ (required field missing, invalid format)
   * - HTTP 403: Người dùng không có quyền tạo user (chỉ admin)
   * - HTTP 409: Conflict - Email hoặc userCode đã tồn tại
   * 
   * @param userData - Thông tin user mới (chứa userCode, fullName, password, email, role, ...)
   * @returns User object sau khi tạo thành công
   * @throws Error nếu validation thất bại hoặc API error
   * 
   * @example
   * const newUser = await userService.create({
   *   userCode: 'ST102',
   *   fullName: 'Trần B',
   *   password: 'SecurePass123!',
   *   email: 'tranb@email.com',
   *   phoneNumber: '0912345678',
   *   role: 'student',
   *   departmentId: 1
   * });
   * console.log(newUser); // { id: 123, userCode: 'ST102', ... }
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
      
      // ─────────────────────────────────────────────────────────────────────────────
      // ✅ VALIDATION - Kiểm tra các field bắt buộc
      // ─────────────────────────────────────────────────────────────────────────────
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
      if (!userData.role) {
        throw new Error('Vai trò (role) là bắt buộc');
      }
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 🔄 ROLE MAPPING - Convert frontend role string sang backend roleId (number)
      // ─────────────────────────────────────────────────────────────────────────────
      const roleId = ROLE_TO_ID_MAP[userData.role];
      if (!roleId) {
        throw new Error(`Vai trò không hợp lệ: ${userData.role}`);
      }
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 📦 REQUEST DATA - Chuẩn bị object gửi lên API
      // ─────────────────────────────────────────────────────────────────────────────
      // Backend kỳ vọng: UserRequestDto với fields userCode, fullName, passwordHash, email, etc.
      const requestData: UserRequestDto = {
        userCode: userData.userCode.trim(),
        fullName: userData.fullName.trim(),
        passwordHash: userData.password, // ⚠️ Backend sẽ hash password tại server
        email: userData.email.trim(),
        phoneNumber: userData.phoneNumber?.trim(),
        roleId: roleId,  // 🔄 Map role → roleId
        departmentId: userData.departmentId,
        status: 'ACTIVE', // 🆕 Default status khi tạo mới
      };
      
      console.log('👥 Request body:', JSON.stringify(requestData, null, 2));
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 🌐 API CALL - POST /api/User (Response 201 với ApiResponse<UserDto>)
      // ─────────────────────────────────────────────────────────────────────────────
      const response = await apiClient.post<UserSingleApiResponse>('/User', requestData);
      
      console.log('👥 API Response:', JSON.stringify(response, null, 2));
      
      // ─────────────────────────────────────────────────────────────────────────────
      // ❌ ERROR HANDLING - Kiểm tra response status
      // ─────────────────────────────────────────────────────────────────────────────
      if (!response.status) {
        const errorMsg = response.message || 'Failed to create user';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to create user:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      // Backend trả về data null sẽ raise error
      if (!response.data) {
        console.error('❌ Response data is null:', response);
        throw new Error('Backend trả về dữ liệu rỗng. Vui lòng thử lại.');
      }

      console.log('✅ User created successfully:', response.data);
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 🔄 DTO MAPPING - Convert UserDto từ API sang frontend User format
      // ─────────────────────────────────────────────────────────────────────────────
      return this.mapDtoToUser(response.data);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 📋 USER-FRIENDLY ERROR MESSAGES - Map HTTP status codes → Vietnamese messages
      // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // ✏️ [UPDATE OPERATIONS] - Cập nhật thông tin user
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * ✏️ Cập nhật thông tin user (tất cả fields ngoại trừ status)
   * PUT /api/User/{userId}
   * 
   * ⚙️ FIELDS CÓ THỂ UPDATE:
   * - userCode, fullName, email, phoneNumber (thông tin cơ bản)
   * - role hoặc roleId (để thay đổi vai trò người dùng)
   * - departmentId (phòng ban)
   * - password/passwordHash (đổi mật khẩu)
   * 
   * ⚠️ CHÚ Ý:
   * - status KHÔNG được update ở đây (dùng updateStatus riêng)
   * - Nếu cả role và roleId đều có, ưu tiên roleId
   * - Chỉ gửi passwordHash nếu người dùng muốn đổi mật khẩu
   * 
   * @param userId - ID của user cần update
   * @param updates - Object chứa các field cần cập nhật
   * @returns User object sau khi cập nhật
   * @throws Error nếu API error hoặc validation thất bại
   * 
   * @example
   * const updated = await userService.update(123, {
   *   fullName: 'Nguyễn Văn A',
   *   phoneNumber: '0912345678',
   *   departmentId: 2
   * });
   * console.log(updated); // { id: 123, fullName: 'Nguyễn Văn A', ... }
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
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 📦 REQUEST DATA - Chuẩn bị object updates gửi lên API
      // ─────────────────────────────────────────────────────────────────────────────
      const requestData: UserUpdateDto = {
        userCode: updates.userCode,
        fullName: updates.fullName,
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        // 🔄 ROLE MAPPING: Nếu có role string, convert sang roleId; nếu roleId có rồi thì dùng nó
        roleId: updates.roleId || (updates.role ? ROLE_TO_ID_MAP[updates.role] : undefined),
        departmentId: updates.departmentId,
        // ⚠️ CHỈ gửi passwordHash nếu người dùng cung cấp mật khẩu mới
        ...(updates.password && updates.password.trim() ? { passwordHash: updates.password } : {}),
        // ❌ status KHÔNG gửi trong update (dùng updateStatus riêng)
      };
      
      console.log(`📤 Request payload:`, requestData);
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 🌐 API CALL - PUT /api/User/{userId}
      // ─────────────────────────────────────────────────────────────────────────────
      const response = await apiClient.put<UserSingleApiResponse>(`/User/${userId}`, requestData);
      
      // ─────────────────────────────────────────────────────────────────────────────
      // ✅ RESPONSE HANDLING
      // ─────────────────────────────────────────────────────────────────────────────
      if (!response.status) {
        console.error('❌ Failed to update user:', response);
        throw new Error(response.message || 'Failed to update user');
      }

      console.log('✅ User updated successfully:', response.message);
      
      // ⚠️ Backend có thể trả về data: null (phụ thuộc vào API design)
      // Trong trường hợp đó, tạo object user từ data đã gửi lên
      if (!response.data) {
        console.warn('⚠️ No user data in response, constructing from request data');
        // 🔨 FALLBACK: Trả về user object được tạo từ dữ liệu update
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
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 🔄 DTO MAPPING - Convert UserDto từ API sang frontend User format
      // ─────────────────────────────────────────────────────────────────────────────
      return this.mapDtoToUser(response.data);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  },

  /**
   * 🔒 Cập nhật trạng thái user (khóa/mở khóa/ban)
   * PATCH /api/User/status
   * 
   * 📊 STATUSES:
   * - 'active': User bình thường (có thể login)
   * - 'inactive': User bị khóa (không thể login)
   * - 'banned': User bị cấm (vi phạm rule)
   * 
   * ⚠️ CHÚ Ý:
   * - Chỉ admin mới có thể cập nhật status
   * - Phương thức này RIÊNG với updateStatus (không dùng update chung)
   * - Backend chuyển status thành uppercase (ACTIVE, INACTIVE, BANNED)
   * 
   * @param userId - ID của user
   * @param status - Trạng thái mới ('active' | 'inactive' | 'banned')
   * @returns void (chỉ confirm thành công)
   * @throws Error nếu API error hoặc không có quyền
   * 
   * @example
   * // Khóa user
   * await userService.updateStatus(123, 'inactive');
   * 
   * // Mở khóa user
   * await userService.updateStatus(123, 'active');
   * 
   * // Ban user vi phạm
   * await userService.updateStatus(123, 'banned');
   */
  async updateStatus(userId: number, status: 'active' | 'inactive' | 'banned'): Promise<void> {
    try {
      console.log(`👥 Updating user status ${userId}...`, status);
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 📦 REQUEST DATA - Gửi userId + status (uppercase)
      // ─────────────────────────────────────────────────────────────────────────────
      const requestData: UserStatusUpdateDto = {
        userId: userId,
        status: status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'BANNED',
      };
      
      // 🔧 Định nghĩa response type cho PATCH /User/status endpoint
      interface UserStatusUpdateResponse {
        status: boolean;
        message: string;
        data: null;
        errors: string[];
      }
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 🌐 API CALL - PATCH /api/User/status
      // ─────────────────────────────────────────────────────────────────────────────
      const response = await apiClient.patch<UserStatusUpdateResponse>('/User/status', requestData);
      
      // ─────────────────────────────────────────────────────────────────────────────
      // ✅ RESPONSE HANDLING
      // ─────────────────────────────────────────────────────────────────────────────
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
   * 🗑️ Xóa user (soft delete - chỉ đánh dấu là xóa, không xóa khỏi database)
   * DELETE /api/User?code=xxx
   * 
   * ⚠️ CHÚ Ý:
   * - Đây là soft delete, data vẫn tồn tại trong database (status → DELETED)
   * - Chỉ admin mới có thể xóa user
   * - Sử dụng userCode làm parameter (không phải id)
   * 
   * @param userCode - Mã người dùng (ví dụ: "ST101")
   * @returns void (chỉ confirm thành công)
   * @throws Error nếu API error, userCode không tìm thấy, hoặc không có quyền
   * 
   * @example
   * await userService.delete('ST101');
   * console.log('User deleted successfully');
   */
  async delete(userCode: string): Promise<void> {
    try {
      console.log(`👥 Deleting user: ${userCode}`);
      
      // ─────────────────────────────────────────────────────────────────────────────
      // 🌐 API CALL - DELETE /api/User?code=xxx
      // ─────────────────────────────────────────────────────────────────────────────
      const response = await apiClient.delete<UserApiResponse>(`/User?code=${encodeURIComponent(userCode)}`);
      
      // ─────────────────────────────────────────────────────────────────────────────
      // ✅ RESPONSE HANDLING
      // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 [HELPER METHODS] - Hỗ trợ internal
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 🔄 HELPER: Convert UserDto (từ API) → User (frontend format)
   * 
   * 📋 CONVERSION LOGIC:
   * - id: Dùng trực tiếp từ API (int32)
   * - username: Map từ email (vì API dùng email làm unique identifier)
   * - password: Không bao giờ expose (set empty string)
   * - role: Map từ roleId bằng ROLE_ID_MAP (default: 'student')
   * - status: Convert sang lowercase + default 'active'
   * - departmentId: Convert Number → String (để dùng trong form)
   * 
   * ⚠️ CHÚ Ý:
   * - Nếu dto null hoặc undefined, throw error
   * - NEVER expose password từ API response
   * - roleId nếu undefined thì mặc định 'student'
   * 
   * @param dto - UserDto object từ API
   * @returns User object đã được map sang frontend format
   * @throws Error nếu dto invalid
   * 
   * @example
   * // API trả về UserDto
   * const apiData = { id: 123, userCode: 'ST101', fullName: 'Nguyễn A', email: 'nguyena@email.com', roleId: 3, ... };
   * 
   * // Convert sang frontend format
   * const user = userService.mapDtoToUser(apiData);
   * console.log(user); // { id: 123, userCode: 'ST101', username: 'nguyena@email.com', role: 'student', ... }
   */
  mapDtoToUser(dto: UserDto | null | undefined): User {
    // ❌ VALIDATION: Kiểm tra input
    if (!dto) {
      throw new Error('Invalid user data received from API');
    }
    
    // ─────────────────────────────────────────────────────────────────────────────
    // 🔄 MAPPING LOGIC
    // ─────────────────────────────────────────────────────────────────────────────
    return {
      id: dto.id,  // 📝 Dùng id từ API (int32)
      userCode: dto.userCode,  // 📝 Mã người dùng (ví dụ: "AD01", "ST101")
      username: dto.email,  // 🔄 Map email → username (vì email là unique identifier)
      password: '',  // ❌ NEVER expose password
      fullName: dto.fullName,  // 📝 Họ và tên
      email: dto.email,  // 📧 Email address
      phoneNumber: dto.phoneNumber || undefined,  // 📞 Số điện thoại (optional)
      role: ROLE_ID_MAP[dto.roleId] || 'student',  // 🔄 Map roleId → role (default: 'student')
      roleId: dto.roleId?.toString() || '',  // 📝 Convert Number → String
      departmentId: dto.departmentId?.toString(),  // 📝 Convert Number → String (dùng trong form)
      departmentName: dto.departmentName || undefined,  // 🏢 Tên phòng ban (optional)
      status: (dto.status?.toLowerCase() || 'active') as 'active' | 'inactive' | 'banned',  // 🔄 Lowercase status
      createdAt: dto.createdAt || undefined,  // 📅 Ngày tạo account (optional)
    };
  },
};

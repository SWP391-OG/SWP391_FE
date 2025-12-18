// Service xử lý toàn bộ luồng xác thực (login, register, verify email, quên mật khẩu, logout)
import type { User, UserRole } from '../types';
import { apiClient } from './api';

// Kiểu dữ liệu response cho API đăng nhập từ backend
interface LoginApiResponse {
  status: boolean;
  message: string;
  data: {
    token: string;
    email: string;
    fullName: string;
    role: string; // "Admin", "Staff", "Student"
    expiresAt: string;
  };
  errors: string[];
}

// Kiểu dữ liệu response cho API đăng ký
  status: boolean;
  message: string;
  data?: {
    email: string;
    fullName: string;
  };
  errors: string[];
}

// Helper để convert vai trò từ backend ("Admin", "Staff", "Student") sang UserRole ở frontend
const mapRoleFromBackend = (backendRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'Admin': 'admin',
    'Staff': 'it-staff', // Mặc định là IT Staff, sẽ phân biệt bằng departmentId sau
    'Student': 'student',
  };
  
  const mappedRole = roleMap[backendRole];
  console.log('🔄 Role mapping:', { backendRole, mappedRole });
  
  return mappedRole || 'student';
};

export const authService = {
  /**
   * Đăng nhập với backend API
   * - Gửi email/mật khẩu
   * - Nhận token + thông tin user
   * - Lưu token vào localStorage và map sang User (frontend)
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      console.log('🔐 Attempting login with email:', email);
      console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL);
      
      const response = await apiClient.post<LoginApiResponse>('/auth/login', {
        email,
        password,
      });

      // Kiểm tra response status
      if (!response.status || !response.data) {
        console.error('❌ Login failed: Invalid response', response);
        return null;
      }

      const { data } = response;
      console.log('✅ Login successful:', { 
        email: data.email, 
        role: data.role,
        fullName: data.fullName 
      });
      
      // Lưu token vào localStorage để sử dụng cho các request sau
      localStorage.setItem('auth_token', data.token);
      
      // Map role từ backend sang UserRole frontend
      const mappedRole = mapRoleFromBackend(data.role);
      
      // Map response từ backend sang User type của frontend
      const user: User = {
        id: email.split('@')[0], // Tạm thời dùng email prefix làm id
        username: email.split('@')[0],
        password: '', // Không lưu password
        fullName: data.fullName,
        email: data.email,
        userCode: email.split('@')[0].toUpperCase(), // VD: ADMIN1
        role: mappedRole,
        departmentId: undefined, // Sẽ cần API riêng để lấy departmentId cho Staff
        status: 'active',
        isActive: true,
      };

      console.log('👤 User object created:', {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      });

      return user;
    } catch (error) {
      console.error('❌ Login failed:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        // Kiểm tra nếu là lỗi connection
        if (error.message.includes('Failed to fetch')) {
          console.error('⚠️ Cannot connect to backend. Please check:');
          console.error('1. Backend is running on', import.meta.env.VITE_API_BASE_URL);
          console.error('2. CORS is configured properly');
        }
      }
      return null;
    }
  },

  /**
   * Đăng ký tài khoản mới với backend API
   * - Gửi thông tin người dùng
   * - Backend gửi email xác thực cho user
   */
  async register(
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📝 Attempting register with email:', email);
      
      const response = await apiClient.post<RegisterApiResponse>('/auth/register', {
        email,
        password,
        fullName,
        phoneNumber,
      });

      // Kiểm tra response status
      if (!response.status) {
        console.error('❌ Register failed:', response.message);
        return {
          success: false,
          message: response.message || 'Đăng ký thất bại!',
        };
      }

      console.log('✅ Register successful:', response.message);
      return {
        success: true,
        message: response.message || 'Đăng ký thành công!',
      };
    } catch (error) {
      console.error('❌ Register failed:', error);
      let errorMessage = 'Đăng ký thất bại!';
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        errorMessage = error.message;
        
        // Kiểm tra nếu là lỗi connection
        if (error.message.includes('Failed to fetch')) {
          console.error('⚠️ Cannot connect to backend. Please check:');
          console.error('1. Backend is running on', import.meta.env.VITE_API_BASE_URL);
          console.error('2. CORS is configured properly');
          errorMessage = 'Không thể kết nối tới server. Vui lòng thử lại sau.';
        }
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Logout - xóa token và thông tin user khỏi localStorage
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
  },

  /**
   * Lấy user hiện tại từ localStorage (đã lưu sau khi login)
   */
  getCurrentUser(): User | null {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    // Load user từ localStorage (đã được lưu khi login)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Kiểm tra trạng thái đã đăng nhập hay chưa (dựa vào token trong localStorage)
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Quên mật khẩu - Bước 1: gửi email để backend gửi mã reset
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Sending forgot password request for:', email);
      
      const response = await apiClient.post<{ status: boolean; message: string; errors: string[] }>(
        '/auth/forgot-password',
        { email }
      );

      if (!response.status) {
        console.error('❌ Forgot password request failed:', response.message);
        return {
          success: false,
          message: response.message || 'Gửi yêu cầu quên mật khẩu thất bại!',
        };
      }

      console.log('✅ Forgot password email sent successfully');
      return {
        success: true,
        message: response.message || 'Email hướng dẫn đặt lại mật khẩu đã được gửi!',
      };
    } catch (error) {
      console.error('❌ Forgot password failed:', error);
      let errorMessage = 'Gửi yêu cầu quên mật khẩu thất bại!';
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Đặt lại mật khẩu - Bước 2
   * - Gửi email, resetCode và mật khẩu mới lên backend
   */
  async resetPassword(
    email: string,
    resetCode: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔐 Sending reset password request for:', email);
      
      const response = await apiClient.post<{ status: boolean; message: string; errors: string[] }>(
        '/auth/reset-password',
        {
          email,
          resetCode,
          newPassword,
        }
      );

      if (!response.status) {
        console.error('❌ Reset password failed:', response.message);
        return {
          success: false,
          message: response.message || 'Đặt lại mật khẩu thất bại!',
        };
      }

      console.log('✅ Reset password successful');
      return {
        success: true,
        message: response.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.',
      };
    } catch (error) {
      console.error('❌ Reset password failed:', error);
      let errorMessage = 'Đặt lại mật khẩu thất bại!';
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Xác thực email sau khi đăng ký bằng verificationCode
   */
  async verifyEmail(email: string, verificationCode: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Sending email verification request for:', email);
      
      const response = await apiClient.post<{ status: boolean; message: string; errors: string[] }>(
        '/auth/verify-email',
        {
          email,
          verificationCode,
        }
      );

      if (!response.status) {
        console.error('❌ Email verification failed:', response.message);
        return {
          success: false,
          message: response.message || 'Xác thực email thất bại!',
        };
      }

      console.log('✅ Email verification successful');
      return {
        success: true,
        message: response.message || 'Xác thực email thành công! Vui lòng đăng nhập.',
      };
    } catch (error) {
      console.error('❌ Email verification failed:', error);
      let errorMessage = 'Xác thực email thất bại!';
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Gửi lại email chứa mã xác thực nếu người dùng chưa nhận được
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Sending resend verification email request for:', email);
      
      const response = await apiClient.post<{ status: boolean; message: string; errors: string[] }>(
        '/auth/resend-verification',
        { email }
      );

      if (!response.status) {
        console.error('❌ Resend verification email failed:', response.message);
        return {
          success: false,
          message: response.message || 'Gửi lại mã xác thực thất bại!',
        };
      }

      console.log('✅ Resend verification email successful');
      return {
        success: true,
        message: response.message || 'Mã xác thực đã được gửi lại!',
      };
    } catch (error) {
      console.error('❌ Resend verification email failed:', error);
      let errorMessage = 'Gửi lại mã xác thực thất bại!';
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

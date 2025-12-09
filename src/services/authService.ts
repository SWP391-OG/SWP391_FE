import type { User, UserRole } from '../types';
import { apiClient } from './api';

// Response types từ backend API
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

// Helper để convert role từ backend sang frontend format
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
   * Login với backend API
   * @param email - Email đăng nhập
   * @param password - Mật khẩu
   * @returns User object hoặc null nếu thất bại
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
      
      // Lưu token vào localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Map role từ backend
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
   * Logout - xóa token
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
  },

  /**
   * Get current user từ token
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
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};

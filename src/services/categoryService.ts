import { apiClient, API_CONFIG } from './api';
import type { Category, CategoryApiResponse, CategoryRequestDto, CategoryUpdateDto } from '../types/index';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const categoryService = {
  /**
   * Lấy danh sách tất cả categories
   */
  async getAll(): Promise<Category[]> {
    try {
      console.log('📋 Fetching categories...');
      
      const response = await apiClient.get<CategoryApiResponse>('/Category');
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch categories:', response);
        return [];
      }

      console.log('✅ Categories fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Lấy categories theo department
   */
  async getByDepartment(departmentId: number): Promise<Category[]> {
    try {
      const allCategories = await this.getAll();
      return allCategories.filter(cat => cat.departmentId === departmentId);
    } catch (error) {
      console.error('❌ Error filtering categories by department:', error);
      return [];
    }
  },

  /**
   * Lấy category theo code
   */
  async getByCode(categoryCode: string): Promise<Category | null> {
    try {
      const allCategories = await this.getAll();
      return allCategories.find(cat => cat.categoryCode === categoryCode) || null;
    } catch (error) {
      console.error('❌ Error finding category by code:', error);
      return null;
    }
  },

  /**
   * Lấy chỉ các categories ACTIVE
   */
  async getActiveCategories(): Promise<Category[]> {
    try {
      const allCategories = await this.getAll();
      return allCategories.filter(cat => cat.status === 'ACTIVE');
    } catch (error) {
      console.error('❌ Error filtering active categories:', error);
      return [];
    }
  },

  /**
   * Tạo category mới
   */
  async create(category: CategoryRequestDto): Promise<Category> {
    try {
      console.log('📋 Creating category:', category);
      console.log('📋 Request URL:', `${API_BASE_URL}/Category`);
      
      interface CategoryCreateResponse {
        status: boolean;
        message: string;
        data: Category;
        errors: string[];
      }
      
      const response = await apiClient.post<CategoryCreateResponse>('/Category', category);
      
      console.log('📋 API Response:', response);
      
      if (!response.status || !response.data) {
        const errorMsg = response.message || 'Failed to create category';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to create category:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      console.log('✅ Category created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating category:', error);
      
      // Xử lý các loại error khác nhau
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc backend API có đang chạy không.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Vui lòng thử lại sau.');
        }
        if (error.message.includes('404')) {
          throw new Error('API endpoint không tồn tại. Backend có thể chưa hỗ trợ POST /api/Category.\n\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức này.\n\nBackend hiện tại CHƯA HỖ TRỢ POST /api/Category.\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
        }
        if (error.message.includes('400')) {
          throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.');
        }
        if (error.message.includes('500')) {
          throw new Error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
        }
        throw error;
      }
      throw new Error('Có lỗi xảy ra khi tạo category. Vui lòng thử lại.');
    }
  },

  /**
   * Cập nhật category
   */
  async update(categoryCode: string, updates: CategoryUpdateDto): Promise<Category> {
    try {
      console.log('📋 Updating category:', categoryCode, updates);
      console.log('📋 Request URL:', `${API_BASE_URL}/Category/${encodeURIComponent(categoryCode)}`);
      
      interface CategoryUpdateResponse {
        status: boolean;
        message: string;
        data: Category;
        errors: string[];
      }
      
      const response = await apiClient.put<CategoryUpdateResponse>(
        `/Category/${encodeURIComponent(categoryCode)}`,
        updates
      );
      
      console.log('📋 API Response:', response);
      
      if (!response.status || !response.data) {
        const errorMsg = response.message || 'Failed to update category';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to update category:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      console.log('✅ Category updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating category:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc backend API có đang chạy không.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Vui lòng thử lại sau.');
        }
        if (error.message.includes('404')) {
          throw new Error('API endpoint không tồn tại. Backend có thể chưa hỗ trợ PUT /api/Category/{categoryCode}.\n\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức này.\n\nBackend hiện tại CHƯA HỖ TRỢ PUT /api/Category/{categoryCode}.\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
        }
        if (error.message.includes('400')) {
          throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.');
        }
        if (error.message.includes('500')) {
          throw new Error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
        }
        throw error;
      }
      throw new Error('Có lỗi xảy ra khi cập nhật category. Vui lòng thử lại.');
    }
  },

  /**
   * Xóa category
   */
  async delete(categoryCode: string): Promise<void> {
    try {
      console.log('📋 Deleting category:', categoryCode);
      console.log('📋 Request URL:', `${API_BASE_URL}/Category/${encodeURIComponent(categoryCode)}`);
      
      interface CategoryDeleteResponse {
        status: boolean;
        message: string;
        data: null;
        errors: string[];
      }
      
      const response = await apiClient.delete<CategoryDeleteResponse>(
        `/Category/${encodeURIComponent(categoryCode)}`
      );
      
      console.log('📋 API Response:', response);
      
      if (!response.status) {
        const errorMsg = response.message || 'Failed to delete category';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to delete category:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      console.log('✅ Category deleted:', categoryCode);
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc backend API có đang chạy không.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Vui lòng thử lại sau.');
        }
        if (error.message.includes('404')) {
          throw new Error('API endpoint không tồn tại. Backend có thể chưa hỗ trợ DELETE /api/Category/{categoryCode}.\n\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức này.\n\nBackend hiện tại CHƯA HỖ TRỢ DELETE /api/Category/{categoryCode}.\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
        }
        if (error.message.includes('400')) {
          throw new Error('Không thể xóa category này. Có thể category đang được sử dụng.');
        }
        if (error.message.includes('500')) {
          throw new Error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
        }
        throw error;
      }
      throw new Error('Có lỗi xảy ra khi xóa category. Vui lòng thử lại.');
    }
  },
};

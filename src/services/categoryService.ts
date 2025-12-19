import { apiClient, API_CONFIG } from './api';
import type { Category, CategoryDto, CategoryApiResponse, CategoryRequestDto, CategoryUpdateDto, CategoryStatusUpdateDto } from '../types/index';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Helper function: Chuyển đổi CategoryDto từ API backend sang Category interface cho frontend
 * - DTO (Data Transfer Object) là format dữ liệu từ API
 * - Category là format dữ liệu dùng trong frontend
 * - Chuẩn hóa status thành ACTIVE hoặc INACTIVE (chữ hoa)
 */
const mapDtoToCategory = (dto: CategoryDto): Category => {
  return {
    id: dto.id, // ID category (số nguyên)
    categoryCode: dto.categoryCode, // Mã category (ví dụ: "CAT001")
    categoryName: dto.categoryName, // Tên category (ví dụ: "Mạng máy tính")
    departmentId: dto.departmentId, // ID bộ phận phụ trách
    slaResolveHours: dto.slaResolveHours, // Số giờ SLA để giải quyết ticket
    // Chuẩn hóa status: chuyển về chữ hoa và chỉ nhận ACTIVE hoặc INACTIVE
    status: dto.status.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
  };
};

export const categoryService = {
  /**
   * Lấy danh sách tất cả categories từ API
   * - Gọi API GET /Category để lấy toàn bộ danh sách
   * - Chuyển đổi dữ liệu từ CategoryDto sang Category format
   * - Trả về mảng rỗng nếu có lỗi
   */
  async getAll(): Promise<Category[]> {
    try {
      console.log('📋 Fetching categories...');
      
      // Gọi API GET /Category để lấy danh sách categories
      const response = await apiClient.get<CategoryApiResponse>('/Category');
      
      // Kiểm tra response có thành công và có dữ liệu không
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch categories:', response);
        return []; // Trả về mảng rỗng nếu lỗi
      }

      console.log('✅ Categories fetched:', response.data.length);
      // Chuyển đổi từng CategoryDto trong mảng sang Category format
      return response.data.map(mapDtoToCategory);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return []; // Trả về mảng rỗng nếu có exception
    }
  },

  /**
   * Lấy danh sách categories thuộc về một department cụ thể
   * - Lấy tất cả categories trước
   * - Lọc theo departmentId để chỉ lấy categories của department đó
   * - Dùng khi cần hiển thị categories theo bộ phận
   */
  async getByDepartment(departmentId: number): Promise<Category[]> {
    try {
      // Lấy tất cả categories từ API
      const allCategories = await this.getAll();
      // Lọc ra những categories có departmentId khớp với departmentId truyền vào
      return allCategories.filter(cat => cat.departmentId === departmentId);
    } catch (error) {
      console.error('❌ Error filtering categories by department:', error);
      return []; // Trả về mảng rỗng nếu có lỗi
    }
  },

  /**
   * Lấy category theo code
   * GET /api/Category/{categoryCode} - theo Swagger
   */
  async getByCode(categoryCode: string): Promise<Category | null> {
    try {
      console.log('📋 Fetching category by code:', categoryCode);
      
      interface CategoryByCodeResponse {
        status: boolean;
        message: string;
        data: CategoryDto;
        errors: string[];
      }
      
      const response = await apiClient.get<CategoryByCodeResponse>(`/Category/${categoryCode}`);
      
      if (!response.status || !response.data) {
        console.warn('⚠️ Category not found by code:', categoryCode);
        return null;
      }
      
      console.log('✅ Category found by code:', response.data);
      // Chuyển đổi CategoryDto từ API sang Category format và trả về
      return mapDtoToCategory(response.data);
    } catch (error) {
      console.error('❌ Error finding category by code:', error);
      // Nếu lỗi 404 (không tìm thấy), trả về null thay vì throw error để code gọi hàm có thể xử lý
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      // Fallback: nếu API detail thất bại, thử tìm từ danh sách tất cả categories
      try {
        const allCategories = await this.getAll();
        // Tìm category có categoryCode khớp với code truyền vào
        return allCategories.find(cat => cat.categoryCode === categoryCode) || null;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return null; // Trả về null nếu cả fallback cũng thất bại
      }
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
   * POST /api/Category - chỉ gửi categoryCode, categoryName, departmentId, slaResolveHours (không gửi status)
   */
  async create(category: CategoryRequestDto): Promise<Category> {
    try {
      console.log('📋 Creating category:', category);
      console.log('📋 Request URL:', `${API_BASE_URL}/Category`);
      
      // Tạo request data theo Swagger: chỉ gửi categoryCode, categoryName, departmentId, slaResolveHours
      // Không gửi status vì theo Swagger, status được set mặc định khi tạo mới
      const requestData: CategoryRequestDto = {
        categoryCode: category.categoryCode.trim(), // Loại bỏ khoảng trắng thừa ở đầu/cuối
        categoryName: category.categoryName.trim(), // Loại bỏ khoảng trắng thừa ở đầu/cuối
        departmentId: category.departmentId, // ID bộ phận phụ trách (số nguyên)
        slaResolveHours: category.slaResolveHours, // Số giờ SLA (số nguyên)
        // status KHÔNG gửi khi create (theo Swagger, backend sẽ set mặc định)
      };
      
      interface CategoryCreateResponse {
        status: boolean;
        message: string;
        data: CategoryDto; // Theo Swagger: POST trả về ApiResponse<CategoryDto> với status 201
        errors: string[];
      }
      
      const response = await apiClient.post<CategoryCreateResponse>('/Category', requestData);
      
      console.log('📋 API Response:', JSON.stringify(response, null, 2));
      
      if (!response.status) {
        const errorMsg = response.message || 'Failed to create category';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to create category:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      // Kiểm tra response có chứa dữ liệu category không (theo Swagger, POST trả về CategoryDto)
      if (!response.data) {
        throw new Error('Response không chứa dữ liệu category. Vui lòng thử lại.');
      }

      console.log('✅ Category created:', response.data);
      // Chuyển đổi CategoryDto từ API response sang Category format và trả về
      return mapDtoToCategory(response.data);
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
   * PUT /api/Category/{categoryId} - theo Swagger nhận CategoryRequestDto (tất cả fields required)
   */
  async update(categoryId: number, updates: CategoryUpdateDto): Promise<Category> {
    try {
      console.log('📋 Updating category:', categoryId, updates);
      console.log('📋 Request URL:', `${API_BASE_URL}/Category/${categoryId}`);
      
      // Validate: theo Swagger, PUT nhận CategoryRequestDto (tất cả fields required)
      // Cần validate tất cả các field bắt buộc trước khi gửi request
      const categoryCode = updates.categoryCode?.trim(); // Loại bỏ khoảng trắng thừa
      const categoryName = updates.categoryName?.trim(); // Loại bỏ khoảng trắng thừa
      
      // Validate categoryCode: không được để trống
      if (!categoryCode || categoryCode.length === 0) {
        throw new Error('Mã category (categoryCode) là bắt buộc khi cập nhật');
      }
      
      // Validate categoryName: không được để trống
      if (!categoryName || categoryName.length === 0) {
        throw new Error('Tên category (categoryName) là bắt buộc khi cập nhật');
      }
      
      // Validate departmentId: phải là số nguyên dương
      if (!updates.departmentId || updates.departmentId <= 0) {
        throw new Error('Bộ phận (departmentId) là bắt buộc khi cập nhật');
      }
      
      // Validate slaResolveHours: phải là số nguyên dương (lớn hơn 0)
      if (!updates.slaResolveHours || updates.slaResolveHours <= 0) {
        throw new Error('SLA (slaResolveHours) là bắt buộc và phải lớn hơn 0 khi cập nhật');
      }
      
      // Tạo request data theo Swagger: CategoryRequestDto (tất cả fields required)
      const requestData: CategoryRequestDto = {
        categoryCode: categoryCode,
        categoryName: categoryName,
        departmentId: updates.departmentId,
        slaResolveHours: updates.slaResolveHours,
        // status KHÔNG gửi khi update (dùng updateStatus riêng)
      };
      
      interface CategoryUpdateResponse {
        status: boolean;
        message: string;
        data: CategoryDto | null; // Theo Swagger: PUT trả về ApiResponse<Object>, data có thể null
        errors: string[];
      }
      
      const response = await apiClient.put<CategoryUpdateResponse>(
        `/Category/${categoryId}`,
        requestData
      );
      
      console.log('📋 API Response:', JSON.stringify(response, null, 2));
      
      if (!response.status) {
        const errorMsg = response.message || 'Failed to update category';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to update category:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      // Xử lý response: data có thể null theo Swagger (ApiResponse<Object>)
      if (response.data) {
        // Nếu có data trong response, chuyển đổi và trả về luôn
        console.log('✅ Category updated:', response.data);
        return mapDtoToCategory(response.data);
      } else {
        // Nếu data null nhưng status = true (update thành công), reload từ API để lấy dữ liệu mới
        console.log('🔄 Response data is null, reloading category from API...');
        try {
          // Thử reload bằng cách lấy tất cả categories và tìm lại category vừa update
          const allCategories = await this.getAll();
          let found = null;
          
          // Tìm theo categoryCode nếu có trong updates (ưu tiên cách này)
          if (updates.categoryCode) {
            found = allCategories.find(cat => cat.categoryCode === updates.categoryCode);
          }
          
          // Nếu không tìm thấy theo categoryCode, tìm theo categoryId (fallback)
          if (!found) {
            found = allCategories.find(cat => {
              // Xử lý cả trường hợp id là number hoặc string
              const catId = typeof cat.id === 'number' ? cat.id : parseInt(String(cat.id), 10);
              return catId === categoryId;
            });
          }
          
          if (found) {
            // Tìm thấy category sau khi reload
            console.log('✅ Category found after reload:', found);
            return found;
          } else {
            // Không tìm thấy category sau khi reload (có thể bị xóa hoặc lỗi)
            throw new Error('Không thể lấy dữ liệu category sau khi cập nhật. Vui lòng reload trang.');
          }
        } catch (reloadError) {
          console.error('❌ Error reloading category:', reloadError);
          // Thông báo lỗi nhưng không chắc chắn là update thất bại (có thể đã thành công)
          throw new Error('Cập nhật có thể đã thành công nhưng không thể lấy dữ liệu mới. Vui lòng reload trang để xem kết quả.');
        }
      }
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
          throw new Error('API endpoint không tồn tại. Backend có thể chưa hỗ trợ PUT /api/Category/{categoryId}.\n\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức này.\n\nBackend hiện tại CHƯA HỖ TRỢ PUT /api/Category/{categoryId}.\nVui lòng yêu cầu backend implement endpoint này.');
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
   * Cập nhật trạng thái category
   * PATCH /api/Category/status - chỉ cập nhật status
   */
  async updateStatus(categoryId: number, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
    try {
      // Validate categoryId: phải là số nguyên dương (int32)
      if (!categoryId || isNaN(categoryId) || categoryId <= 0) {
        throw new Error(`Invalid categoryId: ${categoryId}. CategoryId must be a positive integer (int32).`);
      }
      
      console.log('📋 Updating category status:', categoryId, status);
      console.log('📋 Request URL:', `${API_BASE_URL}/Category/status`);
      
      // Đảm bảo categoryId là số nguyên hợp lệ (làm tròn xuống để loại bỏ phần thập phân nếu có)
      const validatedCategoryId = Math.floor(Number(categoryId));
      // Validate lại sau khi làm tròn
      if (isNaN(validatedCategoryId) || validatedCategoryId <= 0) {
        throw new Error(`Invalid categoryId: ${categoryId}. CategoryId must be a positive integer (int32).`);
      }
      
      // Tạo request data với categoryId đã được validate và status (ACTIVE hoặc INACTIVE)
      const requestData: CategoryStatusUpdateDto = {
        categoryId: validatedCategoryId, // Sử dụng categoryId đã được validate
        status: status, // ACTIVE hoặc INACTIVE (uppercase)
      };
      
      console.log('📋 Request body:', JSON.stringify(requestData, null, 2));
      console.log('📋 Request data validation:', {
        originalCategoryId: categoryId,
        validatedCategoryId: validatedCategoryId,
        id: requestData.categoryId,
        idType: typeof requestData.categoryId,
        idIsInteger: Number.isInteger(requestData.categoryId),
        status: requestData.status,
        statusType: typeof requestData.status
      });
      
      interface CategoryStatusUpdateResponse {
        status: boolean;
        message: string;
        data: null | object; // Theo Swagger: PATCH trả về ApiResponse<Object>
        errors: string[];
      }
      
      const response = await apiClient.patch<CategoryStatusUpdateResponse>(
        '/Category/status',
        requestData
      );
      
      console.log('📋 API Response:', JSON.stringify(response, null, 2));
      
      if (!response.status) {
        const errorMsg = response.message || 'Failed to update category status';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to update category status:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      console.log('✅ Category status updated successfully:', categoryId, status);
    } catch (error) {
      console.error('❌ Error updating category status:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc backend API có đang chạy không.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Vui lòng thử lại sau.');
        }
        if (error.message.includes('404')) {
          throw new Error('API endpoint không tồn tại. Backend có thể chưa hỗ trợ PATCH /api/Category/status.\n\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức này.\n\nBackend hiện tại CHƯA HỖ TRỢ PATCH /api/Category/status.\nVui lòng yêu cầu backend implement endpoint này.');
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
      throw new Error('Có lỗi xảy ra khi cập nhật trạng thái category. Vui lòng thử lại.');
    }
  },

  /**
   * Xóa category
   * DELETE /api/Category/{categoryId} - dùng categoryId (int32)
   */
  async delete(categoryId: number): Promise<void> {
    try {
      console.log('📋 Deleting category:', categoryId);
      console.log('📋 Request URL:', `${API_BASE_URL}/Category/${categoryId}`);
      
      interface CategoryDeleteResponse {
        status: boolean;
        message: string;
        data: null | object; // Theo Swagger: DELETE trả về ApiResponse<Object>
        errors: string[];
      }
      
      const response = await apiClient.delete<CategoryDeleteResponse>(
        `/Category/${categoryId}`
      );
      
      console.log('📋 API Response:', JSON.stringify(response, null, 2));
      
      if (!response.status) {
        const errorMsg = response.message || 'Failed to delete category';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to delete category:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      console.log('✅ Category deleted successfully:', categoryId);
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
          throw new Error('API endpoint không tồn tại. Backend có thể chưa hỗ trợ DELETE /api/Category/{categoryId}.\n\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức này.\n\nBackend hiện tại CHƯA HỖ TRỢ DELETE /api/Category/{categoryId}.\nVui lòng yêu cầu backend implement endpoint này.');
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

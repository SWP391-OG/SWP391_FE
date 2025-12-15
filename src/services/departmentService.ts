import { apiClient, API_CONFIG } from './api';
import type { Department, DepartmentApiResponse, DepartmentRequestDto, DepartmentUpdateDto, DepartmentStatusUpdateDto, DepartmentDto } from '../types';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const departmentService = {
  /**
   * Lấy tất cả departments từ API
   * GET /api/Departments (số nhiều) - theo Swagger và log lỗi 405
   */
  async getAll(): Promise<Department[]> {
    try {
      console.log('🏢 Fetching departments...');
      
      // Theo Swagger và log: GET /api/Departments (số nhiều) mới đúng
      const response = await apiClient.get<DepartmentApiResponse>('/Departments');
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch departments:', response);
        return [];
      }

      // Map DepartmentDto từ API sang Department
      const departments: Department[] = response.data.map((dto: DepartmentDto) => {
        const normalizedStatus = dto.status?.toUpperCase() || 'INACTIVE';
        return {
          id: dto.id,                    // Sử dụng id (int32) từ API
          deptCode: dto.deptCode,
          deptName: dto.deptName,
          status: normalizedStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          createdAt: dto.createdAt,
          // Legacy fields
          name: dto.deptName,
          isActive: normalizedStatus === 'ACTIVE',
        };
      });

      console.log('✅ Departments fetched:', departments.length);
      return departments;
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      return [];
    }
  },

  /**
   * Lấy department theo ID (deptCode)
   */
  async getById(id: string): Promise<Department | null> {
    try {
      const allDepartments = await this.getAll();
      return allDepartments.find(d => d.deptCode === id || d.id === id) || null;
    } catch (error) {
      console.error('❌ Error finding department by id:', error);
      return null;
    }
  },

  /**
   * Lấy departments theo adminId
   */
  async getByAdminId(adminId: string): Promise<Department[]> {
    try {
      const allDepartments = await this.getAll();
      return allDepartments.filter(dept => dept.adminId === adminId);
    } catch (error) {
      console.error('❌ Error filtering departments by adminId:', error);
      return [];
    }
  },

  /**
   * Tạo department mới
   * POST /api/Department (theo Swagger: chỉ cần deptCode và deptName)
   */
  async create(department: DepartmentRequestDto): Promise<Department> {
    try {
      console.log('🏢 Creating department:', department);
      console.log('🏢 Request URL:', `${API_BASE_URL}/Department`);
      
      // Theo Swagger: chỉ gửi deptCode và deptName (không có status)
      const requestData: DepartmentRequestDto = {
        deptCode: department.deptCode.trim(),
        deptName: department.deptName.trim(),
      };
      
      interface DepartmentCreateResponse {
        status: boolean;
        message: string;
        data: DepartmentDto;
        errors: string[];
      }
      
      const response = await apiClient.post<DepartmentCreateResponse>('/Department', requestData);
      
      console.log('🏢 API Response:', response);
      
      if (!response.status || !response.data) {
        const errorMsg = response.message || 'Failed to create department';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to create department:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      // Map DepartmentDto từ API sang Department
      const dto = response.data;
      const normalizedStatus = dto.status?.toUpperCase() || 'INACTIVE';
      const newDepartment: Department = {
        id: dto.id,                    // Sử dụng id (int32) từ API
        deptCode: dto.deptCode,
        deptName: dto.deptName,
        status: normalizedStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        createdAt: dto.createdAt,
        // Legacy fields
        name: dto.deptName,
        isActive: normalizedStatus === 'ACTIVE',
      };

      console.log('✅ Department created:', newDepartment);
      return newDepartment;
    } catch (error) {
      console.error('❌ Error creating department:', error);
      
      // Xử lý các loại error khác nhau
      if (error instanceof Error) {
        // Nếu là network error hoặc CORS error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc backend API có đang chạy không.');
        }
        // Nếu là timeout
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Vui lòng thử lại sau.');
        }
        // Nếu là 404 - endpoint không tồn tại
        if (error.message.includes('404')) {
          throw new Error('API endpoint không tồn tại. Backend có thể chưa hỗ trợ POST /api/Department.\n\nVui lòng yêu cầu backend implement endpoint này.');
        }
        // Nếu là 405 - Method Not Allowed
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức này.\n\nBackend hiện tại CHƯA HỖ TRỢ POST /api/Department.\nVui lòng yêu cầu backend implement endpoint này.');
        }
        // Nếu là 401/403 - authentication error
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
        }
        // Nếu là 400 - bad request
        if (error.message.includes('400')) {
          throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.');
        }
        // Nếu là 500 - server error
        if (error.message.includes('500')) {
          throw new Error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
        }
        // Throw error message gốc
        throw error;
      }
      throw new Error('Có lỗi xảy ra khi tạo bộ phận. Vui lòng thử lại.');
    }
  },

  /**
   * Cập nhật department
   * PUT /api/Department/{departmentId}
   * Theo Swagger: có thể sửa deptCode và deptName
   */
  async update(departmentId: number, updates: DepartmentUpdateDto): Promise<Department> {
    try {
      console.log('🏢 Updating department ID:', departmentId, updates);
      console.log('🏢 Request URL:', `${API_BASE_URL}/Department/${departmentId}`);
      
      // Theo Swagger: PUT nhận DepartmentRequestDto (deptCode, deptName)
      const requestData: DepartmentRequestDto = {
        deptCode: updates.deptCode?.trim() || '',
        deptName: updates.deptName?.trim() || '',
      };
      
      if (!requestData.deptCode || !requestData.deptName) {
        throw new Error('deptCode và deptName là bắt buộc khi cập nhật');
      }
      
      interface DepartmentUpdateResponse {
        status: boolean;
        message: string;
        data: DepartmentDto;
        errors: string[];
      }
      
      const response = await apiClient.put<DepartmentUpdateResponse>(
        `/Department/${departmentId}`,
        requestData
      );
      
      console.log('🏢 API Response:', response);
      
      if (!response.status || !response.data) {
        const errorMsg = response.message || 'Failed to update department';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to update department:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }

      // Map DepartmentDto từ API sang Department
      const dto = response.data;
      const normalizedStatus = dto.status?.toUpperCase() || 'INACTIVE';
      const updatedDepartment: Department = {
        id: dto.id,                    // Sử dụng id (int32) từ API
        deptCode: dto.deptCode,
        deptName: dto.deptName,
        status: normalizedStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        createdAt: dto.createdAt,
        // Legacy fields
        name: dto.deptName,
        isActive: normalizedStatus === 'ACTIVE',
      };

      console.log('✅ Department updated:', updatedDepartment);
      return updatedDepartment;
    } catch (error) {
      console.error('❌ Error updating department:', error);
      
      // Xử lý các loại error khác nhau
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc backend API có đang chạy không.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Vui lòng thử lại sau.');
        }
        if (error.message.includes('404')) {
          throw new Error('API endpoint không tồn tại. Backend có thể chưa hỗ trợ PUT /api/Department/{departmentId}.\n\nVui lòng yêu cầu backend implement endpoint này.');
        }
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức này.\n\nBackend hiện tại CHƯA HỖ TRỢ PUT /api/Department/{departmentId}.\nVui lòng yêu cầu backend implement endpoint này.');
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
      throw new Error('Có lỗi xảy ra khi cập nhật bộ phận. Vui lòng thử lại.');
    }
  },

  /**
   * Cập nhật status của department
   * PATCH /api/Department/status
   * Theo Swagger: nhận { id: int32, status: string }
   */
  async updateStatus(departmentId: number, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
    try {
      console.log('🏢 Updating department status:', departmentId, status);
      
      const requestData: DepartmentStatusUpdateDto = {
        id: departmentId,
        status: status,
      };
      
      interface DepartmentStatusUpdateResponse {
        status: boolean;
        message: string;
        data: null;
        errors: string[];
      }
      
      const response = await apiClient.patch<DepartmentStatusUpdateResponse>(
        '/Department/status',
        requestData
      );
      
      if (!response.status) {
        const errorMsg = response.message || 'Failed to update department status';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        throw new Error(`${errorMsg}${errorDetails}`);
      }
      
      console.log('✅ Department status updated');
    } catch (error) {
      console.error('❌ Error updating department status:', error);
      throw error;
    }
  },

  /**
   * Xóa department
   * DELETE /api/Department/{departmentId}?departmentId={departmentId}
   * Theo Swagger:
   * - Path parameter: departmentId (string) - REQUIRED
   * - Query parameter: departmentId (integer, int32) - optional
   * - Response: 200 OK với ApiResponse<PaginatedResponse<DepartmentDto>>
   * 
   * Giải pháp: Dùng cả path (string) và query (integer) để đảm bảo backend nhận đúng
   */
  async delete(departmentId: number): Promise<void> {
    try {
      // Validate departmentId
      if (!departmentId || isNaN(departmentId) || departmentId <= 0) {
        throw new Error(`Invalid departmentId: ${departmentId}. DepartmentId must be a positive integer (int32).`);
      }
      
      console.log(`🏢 Deleting department ID: ${departmentId} (type: ${typeof departmentId})`);
      
      // Theo Swagger: Path parameter là REQUIRED (string), Query parameter là optional (integer)
      // Giải pháp: Dùng cả 2 để đảm bảo backend nhận đúng
      // URL: /api/Department/{departmentId}?departmentId={departmentId}
      // Ví dụ: /api/Department/15?departmentId=15
      const endpoint = `/Department/${departmentId}?departmentId=${departmentId}`;
      console.log(`🏢 DELETE ${endpoint}`);
      
      const response = await apiClient.delete<DepartmentApiResponse>(endpoint);
      
      console.log('🏢 DELETE response:', response);
      
      // Xử lý response theo Swagger: 200 OK với ApiResponse<PaginatedResponse<DepartmentDto>>
      if (typeof response === 'object' && response !== null) {
        // Kiểm tra nếu là empty object (có thể là 204 No Content được handleResponse xử lý)
        if (Object.keys(response).length === 0) {
          console.log('✅ Department deleted successfully (204 No Content)');
          return;
        }
        
        // Kiểm tra structure DepartmentApiResponse
        if ('status' in response) {
          const apiResponse = response as DepartmentApiResponse;
          
          if (!apiResponse.status) {
            const errorMsg = apiResponse.message || 'Failed to delete department';
            const errors = apiResponse.errors && apiResponse.errors.length > 0 
              ? `\nErrors: ${apiResponse.errors.join(', ')}`
              : '';
            throw new Error(`${errorMsg}${errors}`);
          }
          
          // Log thông tin response (có thể có pagination data)
          if (apiResponse.data) {
            if (Array.isArray(apiResponse.data)) {
              console.log(`✅ Department deleted successfully. Remaining departments: ${apiResponse.data.length}`);
            } else if (typeof apiResponse.data === 'object' && 'items' in apiResponse.data) {
              const paginatedData = apiResponse.data as { items: DepartmentDto[]; totalCount: number };
              console.log(`✅ Department deleted successfully. Remaining departments: ${paginatedData.items.length} (total: ${paginatedData.totalCount})`);
            }
          }
          
          console.log('✅ Department deleted successfully:', apiResponse.message || 'Success');
          return;
        }
      }
      
      // Nếu không có structure rõ ràng, coi như thành công (vì handleResponse đã xử lý lỗi rồi)
      console.log('✅ Department deleted successfully (no explicit status check)');
    } catch (error) {
      console.error('❌ Error deleting department:', error);
      console.error('❌ Error details:', {
        departmentId,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      // Cải thiện error message theo Swagger response codes
      if (error instanceof Error) {
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức DELETE cho endpoint này. Vui lòng kiểm tra Swagger API.');
        }
        if (error.message.includes('404')) {
          throw new Error(`Không tìm thấy bộ phận với ID ${departmentId}. Có thể bộ phận đã bị xóa hoặc không tồn tại.`);
        }
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          throw new Error(`Lỗi xóa bộ phận: ${error.message}\n\nLưu ý: API yêu cầu departmentId (số nguyên int32). Kiểm tra xem departmentId có đúng không hoặc bộ phận có đang được sử dụng không.`);
        }
        if (error.message.includes('401')) {
          throw new Error('Unauthorized - Vui lòng đăng nhập lại.');
        }
        if (error.message.includes('403')) {
          throw new Error('Forbidden - Bạn không có quyền xóa bộ phận này.');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc backend API có đang chạy không.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Vui lòng thử lại sau.');
        }
        if (error.message.includes('500')) {
          throw new Error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
        }
      }
      
      throw error;
    }
  },
};

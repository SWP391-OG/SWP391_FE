import { apiClient } from './api';

// Kiểu dữ liệu Campus (cơ sở/campus của trường)
export interface Campus {
  campusId?: number; // ID campus (số nguyên) - cần thiết khi tạo location
  campusCode: string; // Mã campus (ví dụ: "HN", "HCM")
  campusName: string; // Tên campus (ví dụ: "Hà Nội", "Hồ Chí Minh")
}

// Kiểu dữ liệu Location (địa điểm trong campus)
export interface Location {
  id?: number; // ID địa điểm từ API
  locationCode: string; // Mã địa điểm
  locationName: string; // Tên địa điểm
  campusName?: string; // Tên campus từ API (optional)
  campusCode?: string; // Mã campus từ API (optional)
  status: 'ACTIVE' | 'INACTIVE'; // Trạng thái (ACTIVE: hoạt động, INACTIVE: không hoạt động)
}

// Kiểu response từ API khi lấy danh sách campuses
interface CampusApiResponse {
  status: boolean; // Trạng thái thành công/thất bại
  message: string; // Thông báo từ API
  data: Campus[]; // Danh sách campuses
  errors: string[]; // Danh sách lỗi nếu có
}

// Kiểu response từ API khi lấy danh sách locations
interface LocationApiResponse {
  status: boolean; // Trạng thái thành công/thất bại
  message: string; // Thông báo từ API
  data: Location[]; // Danh sách locations
  errors: string[]; // Danh sách lỗi nếu có
}

// Service xử lý các API liên quan đến Campus và Location
export const campusService = {
  /**
   * Lấy danh sách tất cả campuses từ API
   * - Gọi API GET /Campus để lấy danh sách campuses
   * - Kiểm tra xem API có trả về campusId không (cần thiết để tạo location)
   * - Trả về danh sách campuses hoặc mảng rỗng nếu lỗi
   */
  async getAllCampuses(): Promise<Campus[]> {
    try {
      const response = await apiClient.get<CampusApiResponse>('/Campus');
      if (response.status && response.data) {
        console.log('📍 Campuses from API:', response.data);
        // Kiểm tra xem các campus có campusId không (cần thiết để tạo location)
        const hasCampusId = response.data.some(c => c.campusId !== undefined);
        if (!hasCampusId) {
          console.warn('⚠️ API /Campus does not return campusId. Backend may need to include campusId in response.');
        }
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching campuses:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin campus theo campusCode (để lấy campusId nếu không có trong danh sách)
   * - Thử tìm trong danh sách tất cả campuses trước
   * - Nếu tìm thấy và có campusId, trả về luôn
   * - Nếu không tìm thấy hoặc không có campusId, thử gọi API GET /Campus/{campusCode} để lấy chi tiết
   * - Trả về campus hoặc null nếu không tìm thấy
   */
  async getCampusByCode(campusCode: string): Promise<Campus | null> {
    try {
      // Thử tìm trong danh sách tất cả campuses trước (có thể đã được cache)
      const allCampuses = await this.getAllCampuses();
      const campus = allCampuses.find(c => c.campusCode === campusCode);
      // Nếu tìm thấy và có campusId, trả về luôn
      if (campus && campus.campusId) {
        return campus;
      }
      
      // Nếu không tìm thấy hoặc không có campusId, thử gọi API detail để lấy campusId
      // Gọi GET /Campus/{campusCode} để lấy thông tin chi tiết campus
      try {
        interface CampusDetailResponse {
          status: boolean;
          message: string;
          data: Campus;
          errors: string[];
        }
        const response = await apiClient.get<CampusDetailResponse>(`/Campus/${encodeURIComponent(campusCode)}`);
        if (response.status && response.data && response.data.campusId) {
          console.log('✅ Got campusId from detail API:', response.data);
          return response.data;
        }
      } catch (detailError) {
        console.warn(`⚠️ Cannot get campus detail from /Campus/${campusCode}:`, detailError);
      }
      
      // Cảnh báo nếu không tìm thấy campusId (cần thiết để tạo location)
      console.warn(`⚠️ Campus ${campusCode} not found or missing campusId. Backend API /Campus should return campusId field.`);
      return campus || null; // Vẫn trả về campus ngay cả khi không có campusId
    } catch (error) {
      console.error(`Error fetching campus by code ${campusCode}:`, error);
      return null;
    }
  },

  /**
   * Lấy danh sách locations (địa điểm) theo campusCode
   * - Gọi API GET /Location/get-by/{campusCode} để lấy danh sách locations trong campus
   * - Trả về tất cả locations (không lọc theo status) để user có thể xem toàn bộ
   * - Trả về mảng rỗng nếu không có dữ liệu hoặc lỗi
   */
  async getLocationsByCampus(campusCode: string): Promise<Location[]> {
    try {
      const response = await apiClient.get<LocationApiResponse>(`/Location/get-by/${campusCode}`);
      console.log('📍 Raw API response for locations:', response);
      
      if (response.status && response.data) {
        console.log('📍 All locations from API:', response.data);
        console.log('📍 Number of locations returned:', response.data.length);
        
        // Trả về tất cả locations không lọc theo status
        // Hiển thị tất cả locations cho user, không lọc theo trạng thái
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching locations for campus ${campusCode}:`, error);
      throw error;
    }
  },
};

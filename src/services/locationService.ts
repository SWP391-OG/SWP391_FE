import { apiClient } from './api';
import type { Location, LocationDto, LocationApiResponse, LocationRequestDto, LocationStatusUpdateDto } from '../types';

/**
 * Location Service - Gọi API thật
 * Backend trả về array trực tiếp, không có pagination wrapper
 */
export const locationService = {
  /**
   * Lấy tất cả locations (API trả về array trực tiếp)
   * GET /api/Locations?PageNumber=1&PageSize=10
   */
  async getAll(): Promise<Location[]> {
    try {
      console.log('📍 Fetching locations...');
      
      const response = await apiClient.get<LocationApiResponse>('/Locations?PageNumber=1&PageSize=100');
      
      console.log('📍 Raw API Response:', response);
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch locations:', response);
        return [];
      }

      // Backend trả về array trực tiếp trong response.data
      const items: LocationDto[] = Array.isArray(response.data) ? response.data : [];
      
      // Map backend data sang frontend format
      const locations: Location[] = items.map(this.mapDtoToLocation);

      console.log(`✅ Locations fetched: ${locations.length} items`, locations);
      return locations;
    } catch (error) {
      console.error('❌ Error fetching locations:', error);
      return [];
    }
  },

  /**
   * Lấy location theo code
   */
  async getByCode(locationCode: string): Promise<Location | null> {
    try {
      const allLocations = await this.getAll();
      return allLocations.find(l => l.code === locationCode) || null;
    } catch (error) {
      console.error('❌ Error fetching location by code:', error);
      return null;
    }
  },

  /**
   * Tạo location mới
   * POST /api/Location
   */
  async create(location: { code: string; name: string; campusId?: number; status?: 'active' | 'inactive' }): Promise<Location> {
    try {
      console.log('📍 Creating location with input:', location);
      
      if (!location.campusId || isNaN(location.campusId)) {
        throw new Error('Campus ID is required and must be a number');
      }
      
      // Ensure campusId is a number, not string
      const campusIdNumber = typeof location.campusId === 'string' 
        ? parseInt(location.campusId, 10) 
        : (location.campusId || 0);
      
      if (isNaN(campusIdNumber) || campusIdNumber <= 0) {
        throw new Error('Campus ID is required and must be a valid positive number');
      }
      
      const requestData: LocationRequestDto = {
        locationCode: location.code.trim(),
        locationName: location.name.trim(),
        campusId: campusIdNumber, // Backend expects campusId as integer
      };
      
      console.log('📍 Request payload to send:', JSON.stringify(requestData, null, 2));
      console.log('📍 campusId value (type):', requestData.campusId, typeof requestData.campusId);
      console.log('📍 Request URL:', '/Location');
      
      const response = await apiClient.post<LocationApiResponse>('/Location', requestData);
      
      if (!response.status) {
        console.error('❌ Failed to create location:', response);
        throw new Error(response.message || 'Failed to create location');
      }

      console.log('✅ Location created successfully');
      
      // Note: Status update would require the newly created location ID from API response
      // which is not provided in the current response, so status cannot be updated here
      
      // Return newly created location
      return {
        id: location.code,
        code: location.code,
        name: location.name,
        status: location.status || 'active',
      };
    } catch (error) {
      console.error('❌ Error creating location:', error);
      throw error;
    }
  },

  /**
   * Cập nhật location
   * PUT /api/Location/{locationId}
   * Theo Swagger: có thể sửa locationCode, locationName, campusId
   */
  async update(locationId: number, updates: { code?: string; name?: string; campusId?: number; status?: 'active' | 'inactive' }): Promise<Location> {
    try {
      console.log(`📍 Updating location ID ${locationId}...`, updates);
      
      // Theo Swagger: PUT /api/Location/{locationId} nhận LocationRequestDto
      const requestData: LocationRequestDto = {
        locationCode: updates.code || '', // Có thể sửa locationCode
        locationName: updates.name || '',
        campusId: updates.campusId || 0, // Required, nhưng có thể update
      };
      
      if (!requestData.campusId || requestData.campusId <= 0) {
        throw new Error('Campus ID is required and must be a valid positive number');
      }
      
      console.log(`📍 PUT /Location/${locationId}`, requestData);
      
      const response = await apiClient.put<LocationApiResponse>(
        `/Location/${locationId}`,
        requestData
      );
      
      if (!response.status) {
        console.error('❌ Failed to update location:', response);
        throw new Error(response.message || 'Failed to update location');
      }

      console.log('✅ Location updated successfully');
      
      // If status needs to be updated, do it separately via PATCH
      if (updates.status) {
        await this.updateStatus(locationId, updates.status);
      }
      
      // Reload để lấy data mới nhất từ API
      const allLocations = await this.getAll();
      const updatedLocation = allLocations.find(l => 
        (typeof l.id === 'number' && l.id === locationId) || 
        (typeof l.id === 'string' && parseInt(l.id, 10) === locationId)
      );
      
      if (!updatedLocation) {
        throw new Error('Failed to retrieve updated location');
      }
      
      return updatedLocation;
    } catch (error) {
      console.error('❌ Error updating location:', error);
      throw error;
    }
  },

  /**
   * Cập nhật status
   * PATCH /api/Location/status
   * Theo Swagger: nhận { id: int32, status: string }
   */
  async updateStatus(locationId: number, status: 'active' | 'inactive'): Promise<void> {
    try {
      console.log(`📍 Updating location status: ID ${locationId} -> ${status}`);
      
      const requestData: LocationStatusUpdateDto = {
        id: locationId, // Sử dụng id (int32) thay vì locationCode
        status: status === 'active' ? 'ACTIVE' : 'INACTIVE',
      };
      
      console.log('📍 PATCH /Location/status', requestData);
      
      const response = await apiClient.patch<LocationApiResponse>('/Location/status', requestData);
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to update status');
      }

      console.log('✅ Status updated successfully');
    } catch (error) {
      console.error('❌ Error updating status:', error);
      throw error;
    }
  },

  /**
   * Xóa location
   * DELETE /api/Location/{locationId}?locationId={locationId}
   * Theo Swagger:
   * - Path parameter: locationId (string) - REQUIRED
   * - Query parameter: locationId (integer, int32) - optional
   * - Response: 200 OK với ApiResponse<PaginatedResponse<LocationDto>>
   * 
   * Giải pháp: Dùng cả path (string) và query (integer) để đảm bảo backend nhận đúng
   */
  async delete(locationId: number): Promise<void> {
    try {
      // Validate locationId
      if (!locationId || isNaN(locationId) || locationId <= 0) {
        throw new Error(`Invalid locationId: ${locationId}. LocationId must be a positive integer (int32).`);
      }
      
      console.log(`📍 Deleting location ID: ${locationId} (type: ${typeof locationId})`);
      
      // Theo Swagger: Path parameter là REQUIRED (string), Query parameter là optional (integer)
      // Giải pháp: Dùng cả 2 để đảm bảo backend nhận đúng
      // URL: /api/Location/{locationId}?locationId={locationId}
      // Ví dụ: /api/Location/15?locationId=15
      const endpoint = `/Location/${locationId}?locationId=${locationId}`;
      console.log(`📍 DELETE ${endpoint}`);
      
      const response = await apiClient.delete<LocationApiResponse>(endpoint);
      
      console.log('📍 DELETE response:', response);
      
      // Xử lý response theo Swagger: 200 OK với ApiResponse<PaginatedResponse<LocationDto>>
      if (typeof response === 'object' && response !== null) {
        // Kiểm tra nếu là empty object (có thể là 204 No Content được handleResponse xử lý)
        if (Object.keys(response).length === 0) {
          console.log('✅ Location deleted successfully (204 No Content)');
          return;
        }
        
        // Kiểm tra structure LocationApiResponse
        if ('status' in response) {
          const apiResponse = response as LocationApiResponse;
          
          if (!apiResponse.status) {
            const errorMsg = apiResponse.message || 'Failed to delete location';
            const errors = apiResponse.errors && apiResponse.errors.length > 0 
              ? `\nErrors: ${apiResponse.errors.join(', ')}`
              : '';
            throw new Error(`${errorMsg}${errors}`);
          }
          
          // Log thông tin response (có thể có pagination data)
          if (apiResponse.data) {
            if (Array.isArray(apiResponse.data)) {
              console.log(`✅ Location deleted successfully. Remaining locations: ${apiResponse.data.length}`);
            } else if (typeof apiResponse.data === 'object' && 'items' in apiResponse.data) {
              const paginatedData = apiResponse.data as { items: LocationDto[]; totalCount: number };
              console.log(`✅ Location deleted successfully. Remaining locations: ${paginatedData.items.length} (total: ${paginatedData.totalCount})`);
            }
          }
          
          console.log('✅ Location deleted successfully:', apiResponse.message || 'Success');
          return;
        }
      }
      
      // Nếu không có structure rõ ràng, coi như thành công (vì handleResponse đã xử lý lỗi rồi)
      console.log('✅ Location deleted successfully (no explicit status check)');
    } catch (error) {
      console.error('❌ Error deleting location:', error);
      console.error('❌ Error details:', {
        locationId,
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
          throw new Error(`Không tìm thấy địa điểm với ID ${locationId}. Có thể địa điểm đã bị xóa hoặc không tồn tại.`);
        }
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          throw new Error(`Lỗi xóa địa điểm: ${error.message}\n\nLưu ý: API yêu cầu locationId (số nguyên int32). Kiểm tra xem locationId có đúng không.`);
        }
        if (error.message.includes('401')) {
          throw new Error('Unauthorized - Vui lòng đăng nhập lại.');
        }
        if (error.message.includes('403')) {
          throw new Error('Forbidden - Bạn không có quyền xóa địa điểm này.');
        }
      }
      
      throw error;
    }
  },

  /**
   * Helper: Map LocationDto từ API sang Location
   */
  mapDtoToLocation(dto: LocationDto): Location {
    // Normalize status to uppercase
    const normalizedStatus = dto.status.toUpperCase();
    const isActive = normalizedStatus === 'ACTIVE';
    
    return {
      id: dto.id, // Sử dụng id (int32) từ API
      code: dto.locationCode,
      name: dto.locationName,
      status: isActive ? 'active' : 'inactive',
      isActive: isActive,
      campusId: dto.campusId,
      campusCode: dto.campusCode,
      campusName: dto.campusName,
    };
  },
};

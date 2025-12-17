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

      // Theo Swagger: response.data có thể là array hoặc pagination object
      let items: LocationDto[] = [];
      
      if (Array.isArray(response.data)) {
        // Nếu là array trực tiếp
        items = response.data;
        console.log('📍 Response data is array:', items.length);
      } else if (typeof response.data === 'object' && 'items' in response.data) {
        // Nếu là pagination object (theo Swagger)
        items = response.data.items || [];
        console.log('📍 Response data is pagination object:', items.length, 'total:', response.data.totalCount);
      } else {
        console.warn('⚠️ Unknown response.data format:', response.data);
        items = [];
      }
      
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
      // Note: We don't have locationId yet, so we use code as id
      // Status will be set via separate API call if needed
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
      console.log('📍 PUT response:', JSON.stringify(response, null, 2));
      
      // Theo Swagger: PUT trả về ApiResponse<PaginatedResponse<LocationDto>>
      // Thử extract updated location từ response nếu có
      let updatedLocation: Location | null = null;
      
      if (response.data) {
        let items: LocationDto[] = [];
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (typeof response.data === 'object' && 'items' in response.data) {
          items = response.data.items || [];
        }
        
        if (items.length > 0) {
          const updatedLocationDto = items.find(item => item.id === locationId);
          if (updatedLocationDto) {
            updatedLocation = this.mapDtoToLocation(updatedLocationDto);
            console.log('📍 Found updated location in PUT response:', updatedLocation);
          }
        }
      }
      
      // If status needs to be updated, do it separately via PATCH
      if (updates.status) {
        console.log(`📍 Updating status separately: ${updates.status}`);
        try {
          await this.updateStatus(locationId, updates.status);
          console.log('✅ Status updated successfully');
          // Add a small delay to ensure backend has committed the changes
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (statusError) {
          console.error('❌ Failed to update status:', statusError);
          // Vẫn tiếp tục vì location đã được update thành công
        }
      }
      
      // Nếu đã có updatedLocation từ response, return luôn
      if (updatedLocation) {
        return updatedLocation;
      }
      
      // Nếu không có, reload để lấy data mới nhất từ API
      console.log('📍 Reloading locations to get updated data...');
      const allLocations = await this.getAll();
      const reloadedLocation = allLocations.find(l => {
        const locId = typeof l.id === 'number' ? l.id : parseInt(String(l.id), 10);
        return locId === locationId;
      });
      
      if (!reloadedLocation) {
        console.error('❌ Updated location not found after reload:', {
          locationId,
          allLocationsCount: allLocations.length
        });
        throw new Error(`Failed to retrieve updated location (ID: ${locationId}) after update`);
      }
      
      console.log('✅ Updated location retrieved from reload:', reloadedLocation);
      return reloadedLocation;
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
      // Validate locationId
      if (!locationId || isNaN(locationId) || locationId <= 0) {
        throw new Error(`Invalid locationId: ${locationId}. LocationId must be a positive integer (int32).`);
      }
      
      console.log(`📍 Updating location status: ID ${locationId} (type: ${typeof locationId}) -> ${status}`);
      
      const requestData: LocationStatusUpdateDto = {
        locationId: locationId, // Sử dụng id (int32) theo Swagger
        status: status === 'active' ? 'ACTIVE' : 'INACTIVE',
      };
      
      console.log('📍 PATCH /Location/status request body:', JSON.stringify(requestData, null, 2));
      console.log('📍 Request data validation:', {
        id: requestData.locationId,
        idType: typeof requestData.locationId,
        idIsInteger: Number.isInteger(requestData.locationId),
        status: requestData.status
      });
      
      const response = await apiClient.patch<LocationApiResponse>('/Location/status', requestData);
      
      console.log('📍 UpdateStatus API Response:', JSON.stringify(response, null, 2));
      
      if (!response.status) {
        const errorMessage = response.message || 'Failed to update location status';
        console.error('❌ UpdateStatus failed:', {
          locationId,
          status,
          requestData,
          response
        });
        throw new Error(errorMessage);
      }

      console.log('✅ Location status updated successfully');
    } catch (error) {
      console.error('❌ Error updating location status:', {
        locationId,
        status,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  /**
   * Xóa location (hard delete)
   * DELETE /api/Location/{locationId}
   * Theo Swagger:
   * - Path parameter: locationId (integer, int32) - REQUIRED
   * - Response: 200 OK với ApiResponse<PaginatedResponse<LocationDto>>
   */
  async delete(locationId: number): Promise<void> {
    try {
      // Validate locationId
      if (!locationId || isNaN(locationId) || locationId <= 0) {
        throw new Error(`Invalid locationId: ${locationId}. LocationId must be a positive integer (int32).`);
      }
      
      console.log(`📍 Deleting location ID: ${locationId} (type: ${typeof locationId})`);
      console.log(`📍 DELETE /Location/${locationId}`);
      
      // Theo Swagger: chỉ cần path parameter locationId (integer, int32)
      const endpoint = `/Location/${locationId}`;
      
      interface LocationDeleteResponse {
        status: boolean;
        message: string;
        data: LocationDto[] | {  // Backend trả về PaginatedResponse<LocationDto>
          pageNumber: number;
          pageSize: number;
          totalCount: number;
          totalPages: number;
          hasPrevious: boolean;
          hasNext: boolean;
          items: LocationDto[];
        } | null;
        errors: string[];
      }
      
      const response = await apiClient.delete<LocationDeleteResponse>(endpoint);
      
      console.log('📍 DELETE response:', JSON.stringify(response, null, 2));
      
      if (!response.status) {
        const errorMsg = response.message || 'Failed to delete location';
        const errorDetails = response.errors?.length ? `: ${response.errors.join(', ')}` : '';
        console.error('❌ Failed to delete location:', { response, errorMsg, errorDetails });
        throw new Error(`${errorMsg}${errorDetails}`);
      }
      
      // Response thành công - location đã được xóa
      console.log('✅ Location deleted successfully:', response.message || 'Success');
      
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
          throw new Error(`Lỗi xóa địa điểm: ${error.message}\n\nLưu ý: API yêu cầu locationId (số nguyên int32). Kiểm tra xem locationId có đúng không hoặc địa điểm có đang được sử dụng không.`);
        }
        if (error.message.includes('401')) {
          throw new Error('Unauthorized - Vui lòng đăng nhập lại.');
        }
        if (error.message.includes('403')) {
          throw new Error('Forbidden - Bạn không có quyền xóa địa điểm này.');
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

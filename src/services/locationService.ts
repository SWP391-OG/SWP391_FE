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
      
      // If status is provided and not active, update it after creation
      const defaultStatus = location.status || 'active';
      if (defaultStatus !== 'active') {
        try {
          await this.updateStatus(location.code, defaultStatus);
          console.log(`✅ Location status set to ${defaultStatus}`);
        } catch (statusError) {
          console.warn('⚠️ Failed to set location status, but location was created:', statusError);
          // Don't throw - location was created successfully
        }
      }
      
      // Return newly created location
      return {
        id: location.code,
        code: location.code,
        name: location.name,
        status: defaultStatus,
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
   * DELETE /api/Location/{locationId} hoặc DELETE /api/Location?locationId={locationId}
   * Theo Swagger: cần locationId (int32), không phải locationCode
   */
  async delete(locationId: number): Promise<void> {
    try {
      console.log(`📍 Deleting location ID: ${locationId}`);
      
      // Thử path parameter trước (theo Swagger: DELETE /api/Location/{locationId})
      try {
        console.log(`📍 Trying DELETE /Location/${locationId} (path parameter)`);
        
        const response = await apiClient.delete<LocationApiResponse>(
          `/Location/${locationId}`
        );
        
        if (!response.status) {
          throw new Error(response.message || 'Failed to delete location');
        }

        console.log('✅ Location deleted successfully (path parameter)');
        return;
      } catch (pathError: any) {
        // Nếu path parameter fail với 404 hoặc 405, thử query parameter
        const errorMsg = pathError instanceof Error ? pathError.message : String(pathError);
        if (errorMsg.includes('404') || errorMsg.includes('405') || errorMsg.includes('Method Not Allowed')) {
          console.log('⚠️ Path parameter failed, trying query parameter...');
          console.log(`📍 Trying DELETE /Location?locationId=${locationId} (query parameter)`);
          
          try {
            const response = await apiClient.delete<LocationApiResponse>(
              `/Location?locationId=${locationId}`
            );
            
            if (!response.status) {
              throw new Error(response.message || 'Failed to delete location');
            }

            console.log('✅ Location deleted successfully (query parameter)');
            return;
          } catch (queryError: any) {
            // Cả 2 cách đều fail
            const queryErrorMsg = queryError instanceof Error ? queryError.message : String(queryError);
            if (queryErrorMsg.includes('405') || queryErrorMsg.includes('Method Not Allowed')) {
              throw new Error('Backend không hỗ trợ phương thức DELETE cho endpoint này. Vui lòng kiểm tra Swagger API để xem endpoint đúng.\n\nThử:\n- DELETE /api/Location/{locationId}\n- DELETE /api/Location?locationId={locationId}');
            }
            throw queryError;
          }
        }
        // Nếu lỗi khác, throw lại
        throw pathError;
      }
    } catch (error) {
      console.error('❌ Error deleting location:', error);
      
      // Cải thiện error message
      if (error instanceof Error) {
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
          throw new Error('Backend không hỗ trợ phương thức DELETE cho endpoint này. Vui lòng kiểm tra Swagger API để xem endpoint đúng.');
        }
        if (error.message.includes('404')) {
          throw new Error('Không tìm thấy địa điểm cần xóa. Có thể địa điểm đã bị xóa hoặc không tồn tại.');
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

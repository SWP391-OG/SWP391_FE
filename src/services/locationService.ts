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
  async create(location: { code: string; name: string }): Promise<Location> {
    try {
      console.log('📍 Creating location...', location);
      
      const requestData: LocationRequestDto = {
        locationCode: location.code,
        locationName: location.name,
      };
      
      const response = await apiClient.post<LocationApiResponse>('/Location', requestData);
      
      if (!response.status) {
        console.error('❌ Failed to create location:', response);
        throw new Error(response.message || 'Failed to create location');
      }

      console.log('✅ Location created successfully');
      
      // Return newly created location
      return {
        id: location.code,
        code: location.code,
        name: location.name,
        status: 'active',
      };
    } catch (error) {
      console.error('❌ Error creating location:', error);
      throw error;
    }
  },

  /**
   * Cập nhật location
   * PUT /api/Location
   */
  async update(locationCode: string, updates: { name?: string }): Promise<Location> {
    try {
      console.log(`📍 Updating location ${locationCode}...`, updates);
      
      const requestData: LocationRequestDto = {
        locationCode: locationCode,
        locationName: updates.name || '',
      };
      
      const response = await apiClient.put<LocationApiResponse>('/Location', requestData);
      
      if (!response.status) {
        console.error('❌ Failed to update location:', response);
        throw new Error(response.message || 'Failed to update location');
      }

      console.log('✅ Location updated successfully');
      
      return {
        id: locationCode,
        code: locationCode,
        name: updates.name || '',
        status: 'active',
      };
    } catch (error) {
      console.error('❌ Error updating location:', error);
      throw error;
    }
  },

  /**
   * Cập nhật status
   * PATCH /api/Location/status
   */
  async updateStatus(locationCode: string, status: 'active' | 'inactive'): Promise<void> {
    try {
      console.log(`📍 Updating location status: ${locationCode} -> ${status}`);
      
      const requestData: LocationStatusUpdateDto = {
        locationCode: locationCode,
        status: status === 'active' ? 'ACTIVE' : 'INACTIVE',
      };
      
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
   * DELETE /api/Location?locationCode=xxx
   */
  async delete(locationCode: string): Promise<void> {
    try {
      console.log(`📍 Deleting location: ${locationCode}`);
      
      const response = await apiClient.delete<LocationApiResponse>(
        `/Location?locationCode=${encodeURIComponent(locationCode)}`
      );
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to delete location');
      }

      console.log('✅ Location deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting location:', error);
      throw error;
    }
  },

  /**
   * Helper: Map LocationDto từ API sang Location
   */
  mapDtoToLocation(dto: LocationDto): Location {
    return {
      id: dto.locationCode,
      code: dto.locationCode,
      name: dto.locationName,
      status: dto.status === 'ACTIVE' ? 'active' : 'inactive',
      isActive: dto.status === 'ACTIVE',
    };
  },
};

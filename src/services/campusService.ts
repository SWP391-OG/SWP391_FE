import { apiClient } from './api';

export interface Campus {
  campusId?: number; // Campus ID (integer) - required for creating location
  campusCode: string;
  campusName: string;
}

export interface Location {
  locationCode: string;
  locationName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface CampusApiResponse {
  status: boolean;
  message: string;
  data: Campus[];
  errors: string[];
}

interface LocationApiResponse {
  status: boolean;
  message: string;
  data: Location[];
  errors: string[];
}

export const campusService = {
  /**
   * Get all campuses
   */
  async getAllCampuses(): Promise<Campus[]> {
    try {
      const response = await apiClient.get<CampusApiResponse>('/Campus');
      if (response.status && response.data) {
        console.log('📍 Campuses from API:', response.data);
        // Check if campuses have campusId
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
   * Get campus by code (to get campusId if not in list)
   */
  async getCampusByCode(campusCode: string): Promise<Campus | null> {
    try {
      // Try to get from list first
      const allCampuses = await this.getAllCampuses();
      const campus = allCampuses.find(c => c.campusCode === campusCode);
      if (campus && campus.campusId) {
        return campus;
      }
      
      // If not found or no campusId, try direct API call
      // Try GET /Campus/{campusCode} to get detail
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
      
      console.warn(`⚠️ Campus ${campusCode} not found or missing campusId. Backend API /Campus should return campusId field.`);
      return campus || null; // Return campus even without campusId
    } catch (error) {
      console.error(`Error fetching campus by code ${campusCode}:`, error);
      return null;
    }
  },

  /**
   * Get locations by campus code
   */
  async getLocationsByCampus(campusCode: string): Promise<Location[]> {
    try {
      const response = await apiClient.get<LocationApiResponse>(`/Campus/${campusCode}/locations`);
      if (response.status && response.data) {
        // Filter only active locations
        return response.data.filter(loc => loc.status === 'ACTIVE');
      }
      return [];
    } catch (error) {
      console.error(`Error fetching locations for campus ${campusCode}:`, error);
      throw error;
    }
  },
};

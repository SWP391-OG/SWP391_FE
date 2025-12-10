import { apiClient } from './api';

export interface Campus {
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
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching campuses:', error);
      throw error;
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

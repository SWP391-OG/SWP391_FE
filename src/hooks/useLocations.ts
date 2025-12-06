import { useState, useEffect } from 'react';
import type { Location } from '../types';
import { locationService } from '../services/locationService';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  // Load locations
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = () => {
    setLoading(true);
    try {
      const data = locationService.getAll();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo location mới
  const createLocation = (location: Omit<Location, 'id' | 'createdAt'>) => {
    try {
      const newLocation = locationService.create(location);
      setLocations([...locations, newLocation]);
      return newLocation;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  };

  // Cập nhật location
  const updateLocation = (id: string, updates: Partial<Location>) => {
    try {
      const updated = locationService.update(id, updates);
      setLocations(locations.map(l => l.id === id ? updated : l));
      return updated;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  // Xóa location
  const deleteLocation = (id: string) => {
    try {
      locationService.delete(id);
      setLocations(locations.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  };

  return {
    locations,
    loading,
    createLocation,
    updateLocation,
    deleteLocation,
    loadLocations,
  };
};

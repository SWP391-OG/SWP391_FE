import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../types';
import { locationService } from '../services/locationService';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load locations từ API
   */
  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await locationService.getAll();
      setLocations(data);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load khi component mount
  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  /**
   * Tạo location mới
   */
  const createLocation = async (location: { code: string; name: string }) => {
    setLoading(true);
    setError(null);
    try {
      const newLocation = await locationService.create(location);
      await loadLocations(); // Reload list
      return newLocation;
    } catch (err) {
      console.error('Error creating location:', err);
      setError(err instanceof Error ? err.message : 'Failed to create location');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật location
   */
  const updateLocation = async (locationCode: string, updates: { name?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await locationService.update(locationCode, updates);
      await loadLocations(); // Reload list
      return updated;
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err instanceof Error ? err.message : 'Failed to update location');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật status
   */
  const updateLocationStatus = async (locationCode: string, status: 'active' | 'inactive') => {
    setLoading(true);
    setError(null);
    try {
      await locationService.updateStatus(locationCode, status);
      await loadLocations(); // Reload list
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa location
   */
  const deleteLocation = async (locationCode: string) => {
    setLoading(true);
    setError(null);
    try {
      await locationService.delete(locationCode);
      await loadLocations(); // Reload list
    } catch (err) {
      console.error('Error deleting location:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete location');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    locations,
    loading,
    error,
    loadLocations,
    createLocation,
    updateLocation,
    updateLocationStatus,
    deleteLocation,
  };
};

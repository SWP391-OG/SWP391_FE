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
  const createLocation = async (location: { code: string; name: string; campusId?: number; status?: 'active' | 'inactive' }) => {
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
   * @param locationId - ID của location (int32)
   * @param updates - Các thay đổi: code, name, campusId, status
   */
  const updateLocation = async (locationId: number, updates: { code?: string; name?: string; status?: 'active' | 'inactive'; campusId?: number }) => {
    setLoading(true);
    setError(null);
    
    // Optimistic update: update UI immediately
    const previousLocations = locations;
    setLocations(prevLocations => 
      prevLocations.map(loc => {
        const locId = typeof loc.id === 'number' ? loc.id : parseInt(String(loc.id), 10);
        if (locId === locationId) {
          return { 
            ...loc, 
            ...(updates.code && { code: updates.code }),
            ...(updates.name && { name: updates.name }),
            ...(updates.status && { status: updates.status }),
            ...(updates.campusId && { campusId: updates.campusId }),
          };
        }
        return loc;
      })
    );
    
    try {
      const updated = await locationService.update(locationId, updates);
      
      // Add a small delay to ensure backend has committed the changes before reload
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload to get the latest data from backend (includes any server-side updates)
      await loadLocations();
      return updated;
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err instanceof Error ? err.message : 'Failed to update location');
      
      // Rollback optimistic update on error
      setLocations(previousLocations);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật status
   * @param locationId - ID của location (int32)
   */
  const updateLocationStatus = async (locationId: number, status: 'active' | 'inactive') => {
    setLoading(true);
    setError(null);
    
    // Optimistic update: update UI immediately
    const previousLocations = locations;
    setLocations(prevLocations => 
      prevLocations.map(loc => {
        const locId = typeof loc.id === 'number' ? loc.id : parseInt(String(loc.id), 10);
        if (locId === locationId) {
          return { ...loc, status };
        }
        return loc;
      })
    );
    
    try {
      await locationService.updateStatus(locationId, status);
      
      // Add a small delay to ensure backend has committed the changes before reload
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload to get the latest data from backend
      await loadLocations();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
      
      // Rollback optimistic update on error
      setLocations(previousLocations);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa location
   * @param locationId - ID của location (int32)
   */
  const deleteLocation = async (locationId: number) => {
    setLoading(true);
    setError(null);
    
    // Lưu lại location ban đầu để có thể restore nếu có lỗi
    const locationToDelete = locations.find(loc => {
      const locId = typeof loc.id === 'number' ? loc.id : parseInt(String(loc.id), 10);
      return locId === locationId;
    });
    
    try {
      // Xóa location khỏi state ngay lập tức (optimistic update)
      // Điều này đảm bảo location biến mất ngay lập tức khỏi UI
      setLocations(prevLocations => {
        const filtered = prevLocations.filter(loc => {
          const locId = typeof loc.id === 'number' ? loc.id : parseInt(String(loc.id), 10);
          return locId !== locationId;
        });
        console.log(`📍 Removed location ${locationId} from state. Remaining: ${filtered.length}`);
        return filtered;
      });
      
      // Gọi API để xóa location từ backend
      await locationService.delete(locationId);
      
      console.log('✅ Location deleted successfully from backend');
      
      // Không reload sau khi delete thành công để tránh location bị soft delete quay lại
      // Nếu backend làm hard delete, location đã bị xóa vĩnh viễn
      // Nếu backend làm soft delete, location vẫn còn nhưng đã bị xóa khỏi UI rồi
      
    } catch (err) {
      console.error('❌ Error deleting location:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete location');
      
      // Nếu có lỗi, restore location lại vào state
      if (locationToDelete) {
        setLocations(prevLocations => {
          // Kiểm tra xem location đã có trong list chưa
          const exists = prevLocations.some(loc => {
            const locId = typeof loc.id === 'number' ? loc.id : parseInt(String(loc.id), 10);
            return locId === locationId;
          });
          if (!exists) {
            console.log(`📍 Restoring location ${locationId} to state`);
            return [...prevLocations, locationToDelete];
          }
          return prevLocations;
        });
      }
      
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

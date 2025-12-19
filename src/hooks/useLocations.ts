// Hook quản lý state và thao tác CRUD cho Địa điểm (Location)
import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../types';
import { locationService } from '../services/locationService';

export const useLocations = () => {
  // Danh sách địa điểm
  const [locations, setLocations] = useState<Location[]>([]);
  // Trạng thái loading cho tất cả thao tác
  const [loading, setLoading] = useState(false);
  // Lưu thông báo lỗi (nếu có)
  const [error, setError] = useState<string | null>(null);

  /**
   * Load danh sách địa điểm từ API
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

  // Tự động load locations khi hook được sử dụng lần đầu
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
      await loadLocations(); // Reload list sau khi tạo thành công
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
   * Cập nhật thông tin location
   * @param locationId - ID của location (int32)
   * @param updates - Các thay đổi: code, name, campusId, status
   */
  const updateLocation = async (locationId: number, updates: { code?: string; name?: string; status?: 'active' | 'inactive'; campusId?: number }) => {
    setLoading(true);
    setError(null);
    
    // Optimistic update: cập nhật UI ngay lập tức trước khi API trả về
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
      
      // Thêm delay nhỏ để backend kịp commit trước khi reload
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Sau đó reload lại danh sách từ backend để đồng bộ
      await loadLocations();
      return updated;
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err instanceof Error ? err.message : 'Failed to update location');
      
      // Nếu lỗi thì rollback về danh sách cũ trước đó
      setLocations(previousLocations);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật trạng thái hoạt động / không hoạt động cho location
   * @param locationId - ID của location (int32)
   */
  const updateLocationStatus = async (locationId: number, status: 'active' | 'inactive') => {
    setLoading(true);
    setError(null);
    
    // Optimistic update: đổi trạng thái luôn trên UI
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
      
      // Thêm delay nhỏ để backend xử lý xong
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload lại danh sách để chắc chắn dữ liệu đúng với backend
      await loadLocations();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
      
      // Lỗi thì trả lại state cũ
      setLocations(previousLocations);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa location theo ID
   * @param locationId - ID của location (int32)
   */
  const deleteLocation = async (locationId: number) => {
    setLoading(true);
    setError(null);
    
    // Lưu lại location chuẩn bị xóa để có thể restore nếu API lỗi
    const locationToDelete = locations.find(loc => {
      const locId = typeof loc.id === 'number' ? loc.id : parseInt(String(loc.id), 10);
      return locId === locationId;
    });
    
    try {
      // Xóa location khỏi state ngay lập tức (optimistic update)
      // Điều này đảm bảo location biến mất ngay khỏi UI, tạo cảm giác nhanh
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
      // Nếu backend hard delete: location biến mất hoàn toàn
      // Nếu backend soft delete: location vẫn còn trong DB nhưng đã ẩn khỏi UI
      
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

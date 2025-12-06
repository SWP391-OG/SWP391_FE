import type { Location } from '../types';
import { loadLocations, saveLocations } from '../utils/localStorage';

export const locationService = {
  // Lấy tất cả locations
  getAll(): Location[] {
    return loadLocations();
  },

  // Lấy location theo ID
  getById(id: string): Location | null {
    const locations = this.getAll();
    return locations.find(l => l.id === id) || null;
  },

  // Tạo location mới
  create(location: Omit<Location, 'id' | 'createdAt'>): Location {
    const locations = this.getAll();
    const newLocation: Location = {
      ...location,
      id: `loc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    locations.push(newLocation);
    saveLocations(locations);
    return newLocation;
  },

  // Cập nhật location
  update(id: string, updates: Partial<Location>): Location {
    const locations = this.getAll();
    const index = locations.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Location not found');
    
    locations[index] = { ...locations[index], ...updates };
    saveLocations(locations);
    return locations[index];
  },

  // Xóa location
  delete(id: string): void {
    const locations = this.getAll().filter(l => l.id !== id);
    saveLocations(locations);
  },
};

import type { User, Category, Department, Location, Ticket } from '../types';
import { mockUsers } from '../data/mockUsers';
import { mockCategories, mockDepartments, mockLocations, mockTickets } from '../data/mockData';

// ════════════════════════════════════════════════════════════════════════════════════
// 💾 [LOCAL STORAGE UTILITIES] - Quản lý dữ liệu lưu trữ cục bộ
// ════════════════════════════════════════════════════════════════════════════════════
// Công dụng:
// - Load/save dữ liệu từ/vào localStorage
// - Fallback về mock data nếu localStorage trống
// - Quản lý session user hiện tại
// - Hỗ trợ cross-tab synchronization thông qua storage events
// ════════════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────────
// 🔑 [STORAGE KEYS] - Các key để lưu dữ liệu trong localStorage
// ─────────────────────────────────────────────────────────────────────────────────────

// LocalStorage keys - tất cả bắt đầu bằng 'fptech_' để tránh trùng với ứng dụng khác
const STORAGE_KEYS = {
  USERS: 'fptech_users',                    // Danh sách users
  CATEGORIES: 'fptech_categories',          // Danh sách categories/issue types
  DEPARTMENTS: 'fptech_departments',        // Danh sách departments
  LOCATIONS: 'fptech_locations',            // Danh sách locations/campuses
  TICKETS: 'fptech_tickets',                // Danh sách tickets (NOT USED - tickets từ backend)
  CURRENT_USER: 'fptech_current_user',      // Session persistence: user hiện tại
} as const;

// ─────────────────────────────────────────────────────────────────────────────────────
// 🛠️ [GENERIC FUNCTIONS] - Các hàm chung để load/save dữ liệu
// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * 📥 Load dữ liệu từ localStorage (generic function)
 * @param key - Storage key
 * @param defaultValue - Giá trị mặc định nếu key không tồn tại
 * @returns Dữ liệu từ localStorage hoặc defaultValue
 */
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue; // Fallback về default value
};

/**
 * 📤 Save dữ liệu vào localStorage (generic function)
 * @param key - Storage key
 * @param data - Dữ liệu cần lưu
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────────────
// 👥 [USERS] - Quản lý dữ liệu users
// ─────────────────────────────────────────────────────────────────────────────────────

export const loadUsers = (): User[] => {
  return loadFromStorage(STORAGE_KEYS.USERS, mockUsers);
};

export const saveUsers = (users: User[]): void => {
  saveToStorage(STORAGE_KEYS.USERS, users);
};

// ─────────────────────────────────────────────────────────────────────────────────────
// 🏷️ [CATEGORIES] - Quản lý dữ liệu categories (loại vấn đề)
// ─────────────────────────────────────────────────────────────────────────────────────

export const loadCategories = (): Category[] => {
  return loadFromStorage(STORAGE_KEYS.CATEGORIES, mockCategories);
};

export const saveCategories = (categories: Category[]): void => {
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
};

// ─────────────────────────────────────────────────────────────────────────────────────
// 🏢 [DEPARTMENTS] - Quản lý dữ liệu departments (phòng ban)
// ─────────────────────────────────────────────────────────────────────────────────────

export const loadDepartments = (): Department[] => {
  return loadFromStorage(STORAGE_KEYS.DEPARTMENTS, mockDepartments);
};

export const saveDepartments = (departments: Department[]): void => {
  saveToStorage(STORAGE_KEYS.DEPARTMENTS, departments);
};

// ─────────────────────────────────────────────────────────────────────────────────────
// 📍 [LOCATIONS] - Quản lý dữ liệu locations (địa điểm/cơ sở)
// ─────────────────────────────────────────────────────────────────────────────────────

export const loadLocations = (): Location[] => {
  return loadFromStorage(STORAGE_KEYS.LOCATIONS, mockLocations);
};

export const saveLocations = (locations: Location[]): void => {
  saveToStorage(STORAGE_KEYS.LOCATIONS, locations);
};

// ─────────────────────────────────────────────────────────────────────────────────────
// 🎫 [TICKETS] - Quản lý dữ liệu tickets
// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * 📥 Load tickets từ mock data
 * ⚠️ NOTE: Tickets KHÔNG được persist vào localStorage
 * Tickets được quản lý hoàn toàn từ backend API
 */
export const loadTickets = (): Ticket[] => {
  // Tickets are NOT persisted to localStorage
  // Always return fresh mock data from backend/mock
  return mockTickets;
};

/**
 * 📤 Save tickets (DEPRECATED - không dùng)
 * Hàm này giữ lại để backward compatibility nhưng không có tác dụng
 * Tickets từ backend, không save locally
 */
export const saveTickets = (): void => {
  // Tickets are not saved to localStorage
  // This function is kept for backward compatibility but does nothing
  console.debug('Tickets are managed server-side, not persisted locally');
};

// ─────────────────────────────────────────────────────────────────────────────────────
// 👤 [CURRENT USER SESSION] - Quản lý session của user hiện tại
// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * 💾 Lưu thông tin user hiện tại vào localStorage (session persistence)
 * Dùng để persist session khi reload trang
 * 
 * @param user - User object hoặc null (để logout)
 * 
 * @example
 * // Login: lưu user
 * saveCurrentUser({ id: '1', email: 'student@fpt.edu.vn', role: 'student', ... })
 * 
 * // Logout: xóa user
 * saveCurrentUser(null)
 */
export const saveCurrentUser = (user: User | null): void => {
  if (user) {
    // Lưu user vào localStorage
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    // Xóa user khỏi localStorage (logout)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

/**
 * 📥 Load thông tin user hiện tại từ localStorage
 * Dùng khi app khởi động để khôi phục session
 * 
 * @returns User object hoặc null nếu không có session
 * 
 * @example
 * const user = loadCurrentUser();
 * if (user) {
 *   // User đã login, show user dashboard
 * } else {
 *   // User chưa login, show login page
 * }
 */
export const loadCurrentUser = (): User | null => {
  return loadFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

// ─────────────────────────────────────────────────────────────────────────────────────
// 🔄 [CLEAR/RESET] - Xóa tất cả dữ liệu (debugging/reset)
// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * 🗑️ Xóa tất cả dữ liệu khỏi localStorage
 * ⚠️ CẢNH BÁO: Hàm này xóa toàn bộ localStorage, dùng cẩn thận!
 * Thường dùng cho:
 * - Testing/debugging
 * - Reset ứng dụng
 * - Logout toàn bộ
 */
export const clearAllStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.info('🗑️ All localStorage data has been cleared');
};


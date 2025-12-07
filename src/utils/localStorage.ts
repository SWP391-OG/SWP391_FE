import type { User, Category, Department, Location, Ticket } from '../types';
import { mockUsers } from '../data/mockUsers';
import { mockCategories, mockDepartments, mockLocations, mockTickets } from '../data/mockData';

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'fptech_users',
  CATEGORIES: 'fptech_categories',
  DEPARTMENTS: 'fptech_departments',
  LOCATIONS: 'fptech_locations',
  TICKETS: 'fptech_tickets',
  CURRENT_USER: 'fptech_current_user', // Session persistence
} as const;

// Generic functions to load/save data
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Specific functions for each data type
export const loadUsers = (): User[] => {
  return loadFromStorage(STORAGE_KEYS.USERS, mockUsers);
};

export const saveUsers = (users: User[]): void => {
  saveToStorage(STORAGE_KEYS.USERS, users);
};

export const loadCategories = (): Category[] => {
  return loadFromStorage(STORAGE_KEYS.CATEGORIES, mockCategories);
};

export const saveCategories = (categories: Category[]): void => {
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
};

export const loadDepartments = (): Department[] => {
  return loadFromStorage(STORAGE_KEYS.DEPARTMENTS, mockDepartments);
};

export const saveDepartments = (departments: Department[]): void => {
  saveToStorage(STORAGE_KEYS.DEPARTMENTS, departments);
};

export const loadLocations = (): Location[] => {
  return loadFromStorage(STORAGE_KEYS.LOCATIONS, mockLocations);
};

export const saveLocations = (locations: Location[]): void => {
  saveToStorage(STORAGE_KEYS.LOCATIONS, locations);
};

export const loadTickets = (): Ticket[] => {
  return loadFromStorage(STORAGE_KEYS.TICKETS, mockTickets);
};

export const saveTickets = (tickets: Ticket[]): void => {
  saveToStorage(STORAGE_KEYS.TICKETS, tickets);
};

// Current user session persistence
export const saveCurrentUser = (user: User | null): void => {
  if (user) {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const loadCurrentUser = (): User | null => {
  return loadFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

// Clear all data (useful for testing/reset)
export const clearAllStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};


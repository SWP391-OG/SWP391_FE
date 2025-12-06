import type { User } from '../types';
import { userService } from './userService';

export const authService = {
  // Login
  login(username: string, password: string): User | null {
    return userService.login(username, password);
  },

  // Logout (clear session - for future API implementation)
  logout(): void {
    // In localStorage mode, just clear any session data if needed
    // For API, this would call logout endpoint
  },

  // Get current user (for future API implementation)
  getCurrentUser(): User | null {
    // In localStorage mode, this would be handled by component state
    // For API, this would fetch from /api/auth/me
    return null;
  },
};

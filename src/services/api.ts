/**
 * API Client Template
 * 
 * File này sẽ được sử dụng khi tích hợp với backend API.
 * Hiện tại chỉ là template, chưa được sử dụng trong code.
 * 
 * Khi sẵn sàng sử dụng:
 * 1. Thay thế logic localStorage trong các service files
 * 2. Import apiClient từ file này
 * 3. Gọi các methods như apiClient.get(), apiClient.post(), etc.
 */

// Đọc biến môi trường từ .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 5000;
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Types
interface RequestOptions extends RequestInit {
  timeout?: number;
}

// Helper function để lấy auth token từ localStorage
const getAuthToken = (): string | null => {
  // TODO: Implement khi có authentication
  // return localStorage.getItem('auth_token');
  return null;
};

// Helper function để tạo headers
const createHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers as HeadersInit;
};

// Helper function để xử lý timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestOptions = {}
): Promise<Response> => {
  const { timeout = API_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Helper function để xử lý response
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || 'An error occurred',
    }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Nếu response không có body (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

/**
 * API Client
 * 
 * Cung cấp các methods để gọi API:
 * - get(): GET request
 * - post(): POST request
 * - put(): PUT request
 * - patch(): PATCH request
 * - delete(): DELETE request
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'GET',
      headers: createHeaders(options?.headers),
    });
    return handleResponse<T>(response);
  },

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      headers: createHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'PUT',
      headers: createHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'PATCH',
      headers: createHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'DELETE',
      headers: createHeaders(options?.headers),
    });
    return handleResponse<T>(response);
  },
};

/**
 * Export constants để có thể sử dụng ở nơi khác nếu cần
 */
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
  USE_MOCK_DATA: USE_MOCK_DATA,
};

/**
 * Example usage (khi tích hợp):
 * 
 * // Trong ticketService.ts
 * import { apiClient } from './api';
 * 
 * export const ticketService = {
 *   async getAll(): Promise<Ticket[]> {
 *     return apiClient.get<Ticket[]>('/tickets');
 *   },
 * 
 *   async getById(id: string): Promise<Ticket> {
 *     return apiClient.get<Ticket>(`/tickets/${id}`);
 *   },
 * 
 *   async create(ticket: CreateTicketDto): Promise<Ticket> {
 *     return apiClient.post<Ticket>('/tickets', ticket);
 *   },
 * 
 *   async update(id: string, updates: Partial<Ticket>): Promise<Ticket> {
 *     return apiClient.patch<Ticket>(`/tickets/${id}`, updates);
 *   },
 * 
 *   async delete(id: string): Promise<void> {
 *     return apiClient.delete(`/tickets/${id}`);
 *   },
 * };
 */


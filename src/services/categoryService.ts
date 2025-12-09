import { apiClient } from './api';
import type { Category, CategoryApiResponse } from '../types/index';

export const categoryService = {
  /**
   * Lấy danh sách tất cả categories
   */
  async getAll(): Promise<Category[]> {
    try {
      console.log('📋 Fetching categories...');
      
      const response = await apiClient.get<CategoryApiResponse>('/Category');
      
      if (!response.status || !response.data) {
        console.error('❌ Failed to fetch categories:', response);
        return [];
      }

      console.log('✅ Categories fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Lấy categories theo department
   */
  async getByDepartment(departmentId: number): Promise<Category[]> {
    try {
      const allCategories = await this.getAll();
      return allCategories.filter(cat => cat.departmentId === departmentId);
    } catch (error) {
      console.error('❌ Error filtering categories by department:', error);
      return [];
    }
  },

  /**
   * Lấy category theo code
   */
  async getByCode(categoryCode: string): Promise<Category | null> {
    try {
      const allCategories = await this.getAll();
      return allCategories.find(cat => cat.categoryCode === categoryCode) || null;
    } catch (error) {
      console.error('❌ Error finding category by code:', error);
      return null;
    }
  },

  /**
   * Lấy chỉ các categories ACTIVE
   */
  async getActiveCategories(): Promise<Category[]> {
    try {
      const allCategories = await this.getAll();
      return allCategories.filter(cat => cat.status === 'ACTIVE');
    } catch (error) {
      console.error('❌ Error filtering active categories:', error);
      return [];
    }
  },
};

import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      console.log('✅ Categories loaded in hook:', data.length);
      setCategories(data);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Tạo category mới (TODO: implement API when backend is ready)
  const createCategory = async (category: Omit<Category, 'categoryCode' | 'categoryName'>) => {
    try {
      console.warn('⚠️ Create category API not implemented yet');
      // Temporary: just add to local state
      const newCategory: Category = {
        categoryCode: `TEMP_${Date.now()}`,
        categoryName: 'New Category',
        departmentId: 1,
        slaResolveHours: 24,
        status: 'ACTIVE',
        ...category,
      };
      setCategories([...categories, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  // Cập nhật category (TODO: implement API when backend is ready)
  const updateCategory = async (code: string, updates: Partial<Category>) => {
    try {
      console.warn('⚠️ Update category API not implemented yet');
      // Temporary: just update local state
      const updated = categories.find(c => c.categoryCode === code);
      if (updated) {
        const newCategory = { ...updated, ...updates };
        setCategories(categories.map(c => c.categoryCode === code ? newCategory : c));
        return newCategory;
      }
      throw new Error('Category not found');
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  // Xóa category (TODO: implement API when backend is ready)
  const deleteCategory = async (code: string) => {
    try {
      console.warn('⚠️ Delete category API not implemented yet');
      // Temporary: just remove from local state
      setCategories(categories.filter(c => c.categoryCode !== code));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // Get categories by department
  const getCategoriesByDepartment = async (departmentId: number) => {
    return categoryService.getByDepartment(departmentId);
  };

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByDepartment,
    loadCategories,
  };
};

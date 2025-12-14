import { useState, useEffect } from 'react';
import type { Category, CategoryRequestDto, CategoryUpdateDto } from '../types';
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

  // Tạo category mới
  const createCategory = async (category: CategoryRequestDto) => {
    try {
      const newCategory = await categoryService.create(category);
      setCategories([...categories, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  // Cập nhật category
  const updateCategory = async (categoryCode: string, updates: CategoryUpdateDto) => {
    try {
      const updated = await categoryService.update(categoryCode, updates);
      setCategories(categories.map(c => c.categoryCode === categoryCode ? updated : c));
      return updated;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  // Xóa category
  const deleteCategory = async (categoryCode: string) => {
    try {
      await categoryService.delete(categoryCode);
      setCategories(categories.filter(c => c.categoryCode !== categoryCode));
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

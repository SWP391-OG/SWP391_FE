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

  const loadCategories = () => {
    setLoading(true);
    try {
      const data = categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo category mới
  const createCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      const newCategory = categoryService.create(category);
      setCategories([...categories, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  // Cập nhật category
  const updateCategory = (id: string, updates: Partial<Category>) => {
    try {
      const updated = categoryService.update(id, updates);
      setCategories(categories.map(c => c.id === id ? updated : c));
      return updated;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  // Xóa category
  const deleteCategory = (id: string) => {
    try {
      categoryService.delete(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // Get categories by department
  const getCategoriesByDepartment = (departmentId: string) => {
    return categoryService.getByDepartmentId(departmentId);
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

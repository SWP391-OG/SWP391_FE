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
  const updateCategory = async (categoryId: number, updates: CategoryUpdateDto) => {
    setLoading(true);
    
    // Optimistic update: update UI immediately
    const previousCategories = categories;
    setCategories(prevCategories =>
      prevCategories.map(c => {
        const idMatch = typeof c.id === 'number' && c.id === categoryId;
        const codeMatch = typeof c.id === 'string' && c.id === categoryId.toString();
        if (idMatch || codeMatch) {
          return {
            ...c,
            ...(updates.categoryCode && { categoryCode: updates.categoryCode }),
            ...(updates.categoryName && { categoryName: updates.categoryName }),
            ...(updates.departmentId && { departmentId: updates.departmentId }),
            ...(updates.slaResolveHours && { slaResolveHours: updates.slaResolveHours }),
          };
        }
        return c;
      })
    );
    
    try {
      const updated = await categoryService.update(categoryId, updates);
      
      // Add a small delay to ensure backend has committed the changes before reload
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload to get the latest data from backend (includes any server-side updates)
      await loadCategories();
      return updated;
    } catch (error) {
      console.error('Error updating category:', error);
      // Rollback optimistic update on error
      setCategories(previousCategories);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái category
  const updateCategoryStatus = async (categoryId: number, status: 'ACTIVE' | 'INACTIVE') => {
    setLoading(true);
    
    // Optimistic update: update UI immediately
    const previousCategories = categories;
    setCategories(prevCategories =>
      prevCategories.map(c => {
        const idMatch = typeof c.id === 'number' && c.id === categoryId;
        const codeMatch = typeof c.id === 'string' && c.id === categoryId.toString();
        if (idMatch || codeMatch) {
          return { ...c, status };
        }
        return c;
      })
    );
    
    try {
      await categoryService.updateStatus(categoryId, status);
      
      // Add a small delay to ensure backend has committed the changes before reload
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload to get the latest data from backend
      await loadCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      // Rollback optimistic update on error
      setCategories(previousCategories);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Xóa category
  const deleteCategory = async (categoryId: number) => {
    try {
      await categoryService.delete(categoryId);
      setCategories(categories.filter(c => {
        // Match by id (number) or categoryCode (backward compatibility)
        const idMatch = typeof c.id === 'number' && c.id === categoryId;
        const codeMatch = typeof c.id === 'string' && c.id === categoryId.toString();
        return !(idMatch || codeMatch);
      }));
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
    updateCategoryStatus,
    deleteCategory,
    getCategoriesByDepartment,
    loadCategories,
  };
};

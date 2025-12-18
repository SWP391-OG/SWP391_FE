// Hook quản lý state và thao tác CRUD cho Danh mục (Category) ở phía client
import { useState, useEffect } from 'react';
import type { Category, CategoryRequestDto, CategoryUpdateDto } from '../types';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  // Danh sách category đang có
  const [categories, setCategories] = useState<Category[]>([]);
  // Trạng thái loading chung cho các thao tác với category
  const [loading, setLoading] = useState(false);

  // Khi hook được mount, tự động load danh sách category từ API
  useEffect(() => {
    loadCategories();
  }, []);

  // Gọi API lấy toàn bộ categories và lưu vào state
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

  // Tạo category mới (gọi API rồi append vào state)
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

  // Cập nhật thông tin category (code, name, departmentId, SLA)
  const updateCategory = async (categoryId: number, updates: CategoryUpdateDto) => {
    setLoading(true);
    
    // Optimistic update: cập nhật UI ngay lập tức trước khi API trả về
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
      
      // Sau khi API thành công, reload lại từ backend để đồng bộ dữ liệu
      await loadCategories();
      return updated;
    } catch (error) {
      console.error('Error updating category:', error);
      // Nếu lỗi thì rollback về danh sách cũ
      setCategories(previousCategories);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái hoạt động / không hoạt động của category
  const updateCategoryStatus = async (categoryId: number, status: 'ACTIVE' | 'INACTIVE') => {
    setLoading(true);
    
    // Optimistic update: cập nhật trạng thái ngay trên UI trước
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
      
      // Reload lại sau khi backend cập nhật xong
      await loadCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      // Lỗi thì trả UI về trạng thái cũ
      setCategories(previousCategories);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Xóa category theo id (xóa cả trên API và cập nhật lại state)
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

  // Lấy danh sách category theo một bộ phận cụ thể
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

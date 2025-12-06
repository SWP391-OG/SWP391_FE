import type { Category, Priority } from '../types';
import { loadCategories, saveCategories } from '../utils/localStorage';

export const categoryService = {
  // Lấy tất cả categories
  getAll(): Category[] {
    return loadCategories();
  },

  // Lấy category theo ID
  getById(id: string): Category | null {
    const categories = this.getAll();
    return categories.find(c => c.id === id) || null;
  },

  // Lấy categories theo department
  getByDepartmentId(departmentId: string): Category[] {
    return this.getAll().filter(cat => cat.departmentId === departmentId);
  },

  // Tạo category mới
  create(category: Omit<Category, 'id' | 'createdAt'>): Category {
    const categories = this.getAll();
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    saveCategories(categories);
    return newCategory;
  },

  // Cập nhật category
  update(id: string, updates: Partial<Category>): Category {
    const categories = this.getAll();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    
    categories[index] = { ...categories[index], ...updates };
    saveCategories(categories);
    return categories[index];
  },

  // Xóa category
  delete(id: string): void {
    const categories = this.getAll().filter(c => c.id !== id);
    saveCategories(categories);
  },
};

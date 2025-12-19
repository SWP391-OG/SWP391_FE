import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types/index';
import CategoryCard from './category-card';

interface CategorySelectorProps {
  onSelectCategory: (category: Category) => void;
  selectedCategory?: Category | null;
  departmentId?: number;
  searchQuery?: string; // Thêm prop này
}

// ════════════════════════════════════════════════════════════════════════════════════
// 🎯 [CATEGORY SELECTOR] - Component chọn category (loại vấn đề)
// ════════════════════════════════════════════════════════════════════════════════════
// Chức năng:
// - Lấy danh sách categories từ API (theo department nếu có)
// - Lọc categories theo search query
// - Hiển thị danh sách category cards
// - Gọi callback khi chọn category
// ════════════════════════════════════════════════════════════════════════════════════

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onSelectCategory,
  selectedCategory = null,
  departmentId,
  searchQuery = '' // Thêm prop này
}) => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // 📥 [DATA STATE] - Quản lý dữ liệu categories từ API
  // ─────────────────────────────────────────────────────────────────────────────────
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // ─────────────────────────────────────────────────────────────────────────────────
  // 📤 [LOAD CATEGORIES] - Lấy categories từ API
  // ─────────────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    loadCategories();
  }, [departmentId]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError('');

      let data: Category[];
      if (departmentId) {
        // Lấy categories của department cụ thể
        data = await categoryService.getByDepartment(departmentId);
      } else {
        // Lấy tất cả active categories
        data = await categoryService.getActiveCategories();
      }

      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Không thể tải danh sách lỗi. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────────
  // 🔍 [FILTER CATEGORIES] - Lọc categories theo search query
  // ─────────────────────────────────────────────────────────────────────────────────
  
  // Thêm logic filter
  const filteredCategories = searchQuery
    ? categories.filter(cat => 
        cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.categoryCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có danh mục lỗi nào.</p>
      </div>
    );
  }

  // Hiển thị thông báo nếu không tìm thấy kết quả
  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Không tìm thấy danh mục nào phù hợp với "<span className="font-semibold">{searchQuery}</span>"
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Chọn loại lỗi ({filteredCategories.length}/{categories.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.categoryCode}
            category={category}
            isSelected={selectedCategory?.categoryCode === category.categoryCode}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Category } from '../../types';
import CategorySelector from '../../components/student/category-selector';

interface IssueSelectionPageProps {
  onSelectIssue: (category: Category) => void;
  onBack?: () => void;
}

// ════════════════════════════════════════════════════════════════════════════════════
// 🎯 [ISSUE SELECTION PAGE] - Chọn loại vấn đề/danh mục khi tạo ticket
// ════════════════════════════════════════════════════════════════════════════════════
// Chức năng:
// - Hiển thị danh sách các category/issue types
// - Tìm kiếm category theo tên
// - Click để chọn category → chuyển sang trang create-ticket
// ════════════════════════════════════════════════════════════════════════════════════

const IssueSelectionPage = ({ onSelectIssue, onBack }: IssueSelectionPageProps) => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // 🔍 [SEARCH STATE] - Quản lý tìm kiếm category
  // ─────────────────────────────────────────────────────────────────────────────────
  
  // Category được chọn từ danh sách
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Search query để tìm kiếm category theo tên
  const [searchQuery, setSearchQuery] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────────
  // 📝 [EVENT HANDLERS] - Xử lý sự kiện
  // ─────────────────────────────────────────────────────────────────────────────────
  
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    // Gọi callback để chuyển sang trang create-ticket với category được chọn
    onSelectIssue(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="mb-8">
          {onBack && (
            <div className="mb-6">
              <button 
                className="py-3 px-6 bg-white text-blue-600 border-2 border-blue-200 rounded-lg cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md"
                onClick={onBack}
              >
                ← Quay lại
              </button>
            </div>
          )}
          <div className="text-center">
            <h2 className="text-3xl font-bold my-2 text-gray-800">Chọn Loại Vấn Đề</h2>
            <p className="text-gray-600 text-base mt-3">Vui lòng chọn danh mục lỗi bạn gặp phải</p>
          </div>
        </div>

        {/* 🔍 Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-4 border-2 border-blue-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 font-bold text-2xl leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
         {/* Category Selector Component */}
          <CategorySelector
            onSelectCategory={handleSelectCategory}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default IssueSelectionPage;
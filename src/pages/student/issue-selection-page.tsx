import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Category } from '../../types';
import CategorySelector from '../../components/student/category-selector';

interface IssueSelectionPageProps {
  onSelectIssue: (category: Category) => void;
  onBack?: () => void;
}

const IssueSelectionPage = ({ onSelectIssue, onBack }: IssueSelectionPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    onSelectIssue(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="max-w-[1400px] mx-auto p-8">
      <div className="mb-8">
        {onBack && (
          <div className="mb-6">
            <button 
              className="py-3 px-6 bg-gray-200 text-gray-700 border-none rounded-lg cursor-pointer text-[0.95rem] font-medium transition-all duration-200 hover:bg-gray-300"
              onClick={onBack}
            >
              ← Quay lại
            </button>
          </div>
        )}
        <div className="text-center">
          <h2 className="text-2xl my-2 text-gray-800">Chọn Loại Vấn Đề</h2>
          <p className="text-gray-600 text-sm">Vui lòng chọn danh mục lỗi bạn gặp phải</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <CategorySelector
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default IssueSelectionPage;
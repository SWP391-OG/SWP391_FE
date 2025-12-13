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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="mb-8">
          {onBack && (
            <div className="mb-6">
              <button 
                className="py-3 px-6 bg-white text-orange-600 border-2 border-orange-200 rounded-xl cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 hover:bg-orange-50 hover:border-orange-300 shadow-sm hover:shadow-md"
                onClick={onBack}
              >
                ← Quay lại
              </button>
            </div>
          )}
          <div className="text-center">
            <h2 className="text-3xl font-bold my-2 text-orange-900">Chọn Loại Vấn Đề</h2>
            <p className="text-orange-700 text-base mt-3">Vui lòng chọn danh mục lỗi bạn gặp phải</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-4 border-2 border-orange-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600 font-bold text-2xl leading-none"
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
    </div>
  );
};

export default IssueSelectionPage;
import { useState } from 'react';
import type { Category } from '../../types';
import CategorySelector from '../../components/student/category-selector';

interface IssueSelectionPageProps {
  onSelectIssue: (category: Category) => void;
  onBack?: () => void;
}

const IssueSelectionPage = ({ onSelectIssue, onBack }: IssueSelectionPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    onSelectIssue(category);
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

      <div className="max-w-6xl mx-auto">
        <CategorySelector
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  );
};

export default IssueSelectionPage;
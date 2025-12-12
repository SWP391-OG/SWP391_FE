import React from 'react';
import type { Category } from '../../types/index';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onSelect?: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  isSelected = false,
  onSelect 
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(category);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected 
          ? 'border-orange-500 bg-orange-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Category Code */}
      <div className="mb-2">
        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          {category.categoryCode}
        </span>
      </div>

      {/* Category Name */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {category.categoryName}
      </h3>

      {/* SLA Info */}
      <div className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Deadline xử lí: {category.slaResolveHours}h</span>
      </div>
    </div>
  );
};

export default CategoryCard;
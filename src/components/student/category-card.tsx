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
        group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ease-in-out
        ${isSelected 
          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-xl scale-[1.02]' 
          : 'border-gray-200 bg-white hover:border-orange-400 hover:shadow-lg hover:-translate-y-1'
        }
      `}
    >
      {/* Background pattern overlay */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
        ${isSelected ? 'opacity-5' : 'group-hover:opacity-5'}
        bg-[radial-gradient(circle_at_50%_120%,rgba(251,146,60,0.3),rgba(251,146,60,0))]
      `} />

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-0 right-0">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Category Code */}
        <div className="mb-3">
          <span className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide
            transition-all duration-300
            ${isSelected 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 group-hover:from-orange-100 group-hover:to-orange-50 group-hover:text-orange-700'
            }
          `}>
            {category.categoryCode}
          </span>
        </div>

        {/* Category Name */}
        <h3 className={`
          text-lg font-bold mb-4 transition-colors duration-300
          ${isSelected ? 'text-gray-900' : 'text-gray-800 group-hover:text-orange-600'}
        `}>
          {category.categoryName}
        </h3>

        {/* SLA Info */}
        <div className={`
          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
          ${isSelected 
            ? 'bg-white/60 text-orange-700' 
            : 'bg-gray-50 text-gray-600 group-hover:bg-orange-50 group-hover:text-orange-600'
          }
        `}>
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center mr-2 transition-all duration-300
            ${isSelected 
              ? 'bg-orange-100' 
              : 'bg-white group-hover:bg-orange-100'
            }
          `}>
            <svg className={`w-4 h-4 ${isSelected ? 'text-orange-600' : 'text-gray-500 group-hover:text-orange-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>Deadline xử lí: <strong>{category.slaResolveHours}h</strong></span>
        </div>
      </div>

      {/* Accent line at bottom */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transition-all duration-300
        ${isSelected 
          ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400' 
          : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-orange-200 group-hover:via-orange-300 group-hover:to-orange-200'
        }
      `} />
    </div>
  );
};

export default CategoryCard;
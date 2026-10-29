'use client';

import React from 'react';
import { Category } from '@/lib/types';
import { useApp } from '@/lib/store';
import { Icon } from './Icon';

interface CategoryBadgeProps {
  category?: Category;
  categoryId?: string;
  subCategoryName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category: categoryProp,
  categoryId,
  subCategoryName,
  size = 'md',
  className = '',
}) => {
  const { categories, setSelectedCategoryId } = useApp();

  const category = categoryProp || categories.find((c) => c.id === categoryId);

  if (!category) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategoryId(category.id);
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center rounded-lg border transition-all hover:opacity-90 active:scale-95 cursor-pointer ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${category.color}18`,
        borderColor: `${category.color}35`,
        color: category.color,
      }}
      title={`Click to view ${category.name} category breakdown`}
    >
      <Icon name={category.icon || 'Tag'} className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{category.name}</span>
      {subCategoryName && (
        <span className="opacity-75 font-normal text-[11px]">› {subCategoryName}</span>
      )}
    </button>
  );
};

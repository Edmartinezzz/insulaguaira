import React from 'react';
import { FiUser, FiUsers, FiBriefcase, FiTruck, FiActivity, FiTag, FiHome } from 'react-icons/fi';
import { getCategoryConfig } from '@/config/categories';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
}

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, any> = {
  FiUser,
  FiUsers,
  FiBriefcase,
  FiTruck,
  FiActivity,
  FiTag,
  FiHome
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
};

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const config = getCategoryConfig(category);
  const Icon = iconMap[config.icon] || FiTag;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.color} ${sizeClasses[size]} transition-all duration-200`}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      {config.label}
    </span>
  );
}

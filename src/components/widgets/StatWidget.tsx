import React from 'react';
import { IconType } from 'react-icons';
import Tooltip from '../ui/Tooltip';
import TrendIndicator from '../ui/TrendIndicator';

interface StatWidgetProps {
  title: string;
  value: string | number;
  icon: IconType;
  subtitle?: string;
  trend?: {
    current: number;
    previous: number;
  };
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  tooltip?: string;
  onClick?: () => void;
}

const colorClasses = {
  red: {
    bg: 'from-red-50 to-white dark:from-red-900/20 dark:to-gray-800',
    border: 'border-red-200 dark:border-red-800',
    icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    text: 'text-red-600 dark:text-red-400',
  },
  blue: {
    bg: 'from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'from-green-50 to-white dark:from-green-900/20 dark:to-gray-800',
    border: 'border-green-200 dark:border-green-800',
    icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  yellow: {
    bg: 'from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  purple: {
    bg: 'from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

export default function StatWidget({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'red',
  tooltip,
  onClick,
}: StatWidgetProps) {
  const colors = colorClasses[color];

  const content = (
    <div
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {title}
          </h3>
          {trend && (
            <TrendIndicator
              value={trend.current}
              previousValue={trend.previous}
            />
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className={`text-3xl font-bold ${colors.text} mb-1`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{content}</Tooltip>;
  }

  return content;
}

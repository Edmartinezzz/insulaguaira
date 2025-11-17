import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  suffix?: string;
  showPercentage?: boolean;
}

export default function TrendIndicator({ 
  value, 
  previousValue, 
  suffix = '',
  showPercentage = true 
}: TrendIndicatorProps) {
  const difference = value - previousValue;
  const percentageChange = previousValue !== 0 
    ? ((difference / previousValue) * 100).toFixed(1)
    : '0';

  const isPositive = difference > 0;
  const isNeutral = difference === 0;

  return (
    <div className="flex items-center gap-1">
      {isNeutral ? (
        <FiMinus className="h-4 w-4 text-gray-400" />
      ) : isPositive ? (
        <FiTrendingUp className="h-4 w-4 text-green-500" />
      ) : (
        <FiTrendingDown className="h-4 w-4 text-red-500" />
      )}
      <span className={`text-sm font-medium ${
        isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {showPercentage ? `${percentageChange}%` : `${Math.abs(difference).toFixed(2)}${suffix}`}
      </span>
    </div>
  );
}

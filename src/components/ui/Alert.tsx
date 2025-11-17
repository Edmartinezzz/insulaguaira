import React from 'react';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiX, FiAlertCircle } from 'react-icons/fi';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ type, title, message, onClose, className = '' }: AlertProps) {
  const config = {
    success: {
      icon: FiCheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-800 dark:text-green-300',
    },
    error: {
      icon: FiAlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-800 dark:text-red-300',
    },
    warning: {
      icon: FiAlertTriangle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-800 dark:text-yellow-300',
    },
    info: {
      icon: FiInfo,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-800 dark:text-blue-300',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

  return (
    <div className={`rounded-lg border p-4 ${bgColor} ${borderColor} ${className} animate-fade-in-down`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 mt-0.5 ${iconColor} flex-shrink-0`} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${textColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${textColor}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${iconColor} hover:opacity-75 transition-opacity`}
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

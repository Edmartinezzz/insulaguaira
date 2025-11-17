import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 active:scale-95 active:rotate-1 transform';
  const variants: Record<string, string> = {
    primary: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-lg active:shadow-inner',
    secondary: 'bg-white text-red-700 border border-red-300 hover:bg-red-50 hover:shadow-lg active:shadow-inner',
    danger: 'bg-red-700 text-white hover:bg-red-800 hover:shadow-lg active:shadow-inner',
    ghost: 'text-gray-700 hover:bg-red-50 active:bg-red-100'
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}



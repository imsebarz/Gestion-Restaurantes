import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const getVariantClasses = (variant: ButtonVariant): string => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 hover:border-indigo-700',
    secondary: 'bg-gray-700 hover:bg-gray-800 text-white border border-gray-700 hover:border-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-500 hover:border-yellow-600',
    info: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700',
  };
  return variants[variant];
};

const getSizeClasses = (size: ButtonSize): string => {
  const sizes = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-sm',
    lg: 'py-2 px-6 text-base',
  };
  return sizes[size];
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';

  const combinedClassName = `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`.trim();

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
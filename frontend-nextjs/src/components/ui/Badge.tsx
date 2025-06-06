import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const getVariantClasses = (variant: BadgeVariant): string => {
  const variants = {
    default: 'bg-gray-200 text-gray-900',
    success: 'bg-green-200 text-green-900',
    warning: 'bg-yellow-200 text-yellow-900',
    danger: 'bg-red-200 text-red-900',
    info: 'bg-blue-200 text-blue-900',
    secondary: 'bg-purple-200 text-purple-900',
  };
  return variants[variant];
};

const getSizeClasses = (size: BadgeSize): string => {
  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  return sizes[size];
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseClasses = 'inline-flex font-semibold rounded-full';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);

  const combinedClassName = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
};

// Helper function to map common status strings to badge variants
export const getStatusBadgeVariant = (status: string): BadgeVariant => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('success') || statusLower.includes('delivered') || statusLower.includes('paid') || statusLower.includes('available')) {
    return 'success';
  }
  if (statusLower.includes('warning') || statusLower.includes('pending') || statusLower.includes('preparing')) {
    return 'warning';
  }
  if (statusLower.includes('error') || statusLower.includes('failed') || statusLower.includes('cancelled') || statusLower.includes('unavailable')) {
    return 'danger';
  }
  if (statusLower.includes('info') || statusLower.includes('ready')) {
    return 'info';
  }
  
  return 'default';
};
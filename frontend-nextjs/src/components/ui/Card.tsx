import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const getPaddingClasses = (padding: 'sm' | 'md' | 'lg'): string => {
  const paddingMap = {
    sm: 'px-3 py-4',
    md: 'px-4 py-5 sm:p-6',
    lg: 'px-6 py-8',
  };
  return paddingMap[padding];
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md' 
}) => {
  const baseClasses = 'bg-white overflow-hidden shadow rounded-lg';
  const paddingClasses = getPaddingClasses(padding);
  
  return (
    <div className={`${baseClasses} ${className}`.trim()}>
      <div className={paddingClasses}>
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`mb-4 ${className}`.trim()}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
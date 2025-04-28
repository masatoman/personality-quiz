import React from 'react';
import { IconType } from 'react-icons';
import { FiInbox } from 'react-icons/fi';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: IconType;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'card';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'データがありません',
  message = '表示するデータが見つかりませんでした。',
  icon: Icon = FiInbox,
  action,
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg'
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const variantClasses = {
    default: 'min-h-[200px]',
    compact: 'min-h-[100px]',
    card: 'min-h-[150px] border rounded-lg shadow-sm'
  };

  return (
    <div className={`
      flex flex-col items-center justify-center text-center
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${className}
    `}>
      <Icon className={`text-gray-400 mb-3 ${iconSizes[size]}`} />
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState; 
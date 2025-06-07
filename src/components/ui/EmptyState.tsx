import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import type { ActionProps } from '@/types';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ActionProps;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={twMerge('text-center py-12 px-4', className)}>
      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6">
          {description}
        </p>
      )}
      {action && (
        <div className="flex justify-center">
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
} 
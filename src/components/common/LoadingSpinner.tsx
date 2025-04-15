import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12'
};

export default function LoadingSpinner({ size = 'medium' }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-primary border-t-transparent`}
        role="status"
        aria-label="読み込み中"
      >
        <span className="sr-only">読み込み中...</span>
      </div>
    </div>
  );
} 
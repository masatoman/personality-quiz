'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'error';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingPhase = 'preparing' | 'loading' | 'processing' | 'error';

interface LoadingStateProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  showText?: boolean;
  isFullPage?: boolean;
  className?: string;
  textClassName?: string;
  progress?: number;
  showProgress?: boolean;
  phase?: LoadingPhase;
  error?: string;
  retryButton?: boolean;
  onRetry?: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  size = 'md',
  text = 'ロード中...',
  showText = true,
  isFullPage = false,
  className = '',
  textClassName = '',
  progress,
  showProgress = false,
  phase,
  error,
  retryButton = false,
  onRetry
}) => {
  // サイズの設定
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // テキストサイズの設定
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // ロード中のコンテナクラス
  const containerClasses = `
    flex flex-col items-center justify-center
    ${isFullPage ? 'min-h-screen w-full fixed inset-0 bg-white bg-opacity-80 z-50' : ''}
    ${className}
  `;

  // スピナー
  const renderSpinner = () => (
    <motion.div
      className={`rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );

  // ドット
  const renderDots = () => {
    const dotSize = {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4'
    };

    return (
      <div className="flex space-x-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`rounded-full bg-blue-500 ${dotSize[size]}`}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    );
  };

  // パルス
  const renderPulse = () => (
    <motion.div
      className={`bg-blue-500 rounded-full ${sizeClasses[size]}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );

  // スケルトン
  const renderSkeleton = () => {
    const skeletonSizes = {
      sm: 'h-4 w-24',
      md: 'h-6 w-32',
      lg: 'h-8 w-40',
      xl: 'h-10 w-48'
    };

    return (
      <motion.div
        className={`bg-gray-200 rounded ${skeletonSizes[size]}`}
        animate={{
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    );
  };

  // バリアントに基づいてローディング表示を選択
  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerClasses}>
      {renderLoadingIndicator()}
      {showText && (
        <p className={`mt-3 ${textSizeClasses[size]} text-gray-600 ${textClassName}`}>
          {text}
          {showProgress && progress !== undefined && ` (${progress}%)`}
        </p>
      )}
      {error && (
        <p className="mt-2 text-red-500">
          {error}
        </p>
      )}
      {retryButton && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          再試行
        </button>
      )}
    </div>
  );
};

export default LoadingState; 
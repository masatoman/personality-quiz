'use client';

import React, { ErrorInfo } from 'react';
import Navbar from '@/components/Navbar';
import ThemeProviderClient from '@/components/ThemeProviderClient';
import dynamic from 'next/dynamic';

// デフォルトのエラー表示コンポーネント
const DefaultErrorFallback = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-900 p-4">
      <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
      <p className="mb-4 text-center">{error.message}</p>
      <button 
        onClick={reset} 
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        再試行
      </button>
    </div>
  );
};

// ErrorBoundaryをクライアントサイドのみで動作するようにする
const ErrorBoundary = dynamic(
  () => import('@/components/ErrorBoundary'),
  { ssr: false }
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const handleError = React.useCallback((error: Error, errorInfo: ErrorInfo) => {
    console.error('Global error caught:', error);
    // 分析サービスや監視システムにエラーを送信する場合はここで実装
  }, []);

  return (
    <ThemeProviderClient>
      <Navbar />
      <main>
        <ErrorBoundary
          fallback={DefaultErrorFallback}
          onError={handleError}
        >
          {children}
        </ErrorBoundary>
      </main>
    </ThemeProviderClient>
  );
}
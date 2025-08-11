'use client';

import React from 'react';
import Navbar from '@/components/common/layout/Navbar';
import ThemeProviderClient from '@/components/ThemeProviderClient';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorFallback from '@/components/ErrorFallback';
import SkipLink from '@/components/common/atoms/SkipLink';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const handleError = React.useCallback((error: Error) => {
    console.error('Global error caught:', error);
    // 分析サービスや監視システムにエラーを送信する場合はここで実装
  }, []);

  return (
    <ThemeProviderClient>
      <SkipLink href="#main-content">メインコンテンツにスキップ</SkipLink>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary
          fallback={<ErrorFallback />}
          onError={handleError}
        >
          {children}
        </ErrorBoundary>
      </main>
    </ThemeProviderClient>
  );
}
import React from 'react';
import './globals.css'
import type { Metadata } from 'next'
import { Noto_Sans_JP, M_PLUS_Rounded_1c } from 'next/font/google'
import Navbar from '@/components/Navbar';
import ThemeProviderClient from '@/components/ThemeProviderClient';
import { AuthProvider } from '@/components/auth/AuthProvider';
import dynamic from 'next/dynamic';

// ErrorBoundaryをクライアントサイドのみで動作するようにする
const ErrorBoundary = dynamic(
  () => import('@/components/ErrorBoundary'),
  { ssr: false }
);

const noto = Noto_Sans_JP({ 
  subsets: ['latin'],
  variable: '--font-noto',
})

const rounded = M_PLUS_Rounded_1c({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-rounded',
})

export const metadata: Metadata = {
  title: '英語学習タイプ診断',
  description: 'あなたに合った英語学習法を見つけましょう',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${noto.variable} ${rounded.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="bg-background text-text-primary min-h-screen font-noto">
        <ThemeProviderClient>
          <AuthProvider>
            <Navbar />
            <main>
              <ErrorBoundary
                onError={(error, errorInfo) => {
                  console.error('Global error caught:', error);
                  // 分析サービスや監視システムにエラーを送信する場合はここで実装
                }}
              >
                {children}
              </ErrorBoundary>
            </main>
          </AuthProvider>
        </ThemeProviderClient>
      </body>
    </html>
  )
}

import React from 'react'
import { Metadata } from 'next'
import { Noto_Sans_JP, M_PLUS_Rounded_1c } from 'next/font/google'
import ClientLayout from './ClientLayout'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import ErrorFallback from '@/components/ErrorFallback'

// eslint-disable-next-line @next/next/no-page-custom-font
const noto = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto',
})

const rounded = M_PLUS_Rounded_1c({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
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
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=optional" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="bg-background text-text-primary min-h-screen font-noto">
        <ErrorBoundary
          fallback={<ErrorFallback />}
        >
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}

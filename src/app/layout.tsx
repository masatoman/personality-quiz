import React from 'react'
import { Metadata } from 'next'
import { Noto_Sans_JP, M_PLUS_Rounded_1c } from 'next/font/google'
import ClientLayout from './ClientLayout'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ErrorFallback } from '@/components/ErrorFallback'

// eslint-disable-next-line @next/next/no-page-custom-font
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-m-plus-rounded-1c',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ShiftWith - 教えて学べるオンライン学習プラットフォーム',
  description: '自分だけの教材を作りながら、効率的に学習できるプラットフォーム。知識をシェアして学びを深めましょう。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${mPlusRounded1c.variable}`} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=optional" rel="stylesheet" />
      </head>
      <body className="bg-color-background text-color-text-primary antialiased">
        <ErrorBoundary
          fallback={<ErrorFallback />}
        >
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}

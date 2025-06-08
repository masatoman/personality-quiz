import { Suspense } from 'react';
import { Metadata } from 'next';
import ResultsClient from '@/components/ResultsClient';

function ResultsLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">診断結果を読み込み中...</p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsLoadingFallback />}>
      <ResultsClient />
    </Suspense>
  );
}

export const metadata: Metadata = {
  title: '英語学習タイプ診断結果 | あなたに最適な学習法の詳細',
  description: 'あなたの英語学習タイプ診断結果です。強み、弱み、おすすめの学習法など、あなたに合わせたパーソナライズされた学習プランを確認できます。',
  openGraph: {
    type: 'website',
    url: 'https://engtype.vercel.app/quiz/results',
    title: '英語学習タイプ診断結果 | あなたに最適な学習法の詳細',
    description: 'あなたの英語学習タイプ診断結果です。強み、弱み、おすすめの学習法など、あなたに合わせたパーソナライズされた学習プランを確認できます。',
    images: [{
      url: 'https://engtype.vercel.app/api/og?type=results',
      width: 1200,
      height: 630,
      alt: '英語学習タイプ診断結果ページ',
    }],
  },
}; 
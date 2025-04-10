import { Metadata } from 'next';
import ResultsClient from '@/components/ResultsClient';

export default function ResultsPage() {
  return <ResultsClient />;
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
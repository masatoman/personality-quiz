import React from 'react';
import { Metadata } from 'next';
import { QuizContainer } from '@/components/features/quiz/QuizContainer';

// メタデータ設定
export const metadata: Metadata = {
  title: '英語学習スタイル診断 | 自分に合った学習法を見つけよう',
  description: '15の質問であなたに最適な英語学習スタイルを診断します。自分の学習タイプを知って、効率的に英語力をアップさせましょう。',
  keywords: '英語学習, 学習スタイル, 診断テスト, パーソナライズ学習, 英語勉強法',
  openGraph: {
    type: 'website',
    url: 'https://engtype.vercel.app/quiz',
    title: '英語学習タイプ診断 | 質問に答えてあなたの学習スタイルを発見',
    description: '3分で答えられる簡単な質問に回答するだけで、あなたの英語学習タイプがわかります。科学的根拠に基づいたパーソナライズされた学習法アドバイスを受け取りましょう。',
    images: [{
      url: 'https://engtype.vercel.app/api/og?type=quiz',
      width: 1200,
      height: 630,
      alt: '英語学習タイプ診断テスト',
    }],
  },
};

// クイズページのメインコンポーネント
export default function QuizPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <QuizContainer />
    </main>
  );
} 
import React from 'react';
import { Metadata } from 'next';
import QuizClient from '@/components/QuizClient';

// メタデータ設定
export const metadata: Metadata = {
  title: '英語学習タイプ診断 | 質問に答えてあなたの学習スタイルを発見',
  description: '3分で答えられる簡単な質問に回答するだけで、あなたの英語学習タイプがわかります。科学的根拠に基づいたパーソナライズされた学習法アドバイスを受け取りましょう。',
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

export default function QuizPage() {
  return <QuizClient />;
} 
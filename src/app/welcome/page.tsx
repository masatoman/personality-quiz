import React, { Suspense } from 'react';
import { Metadata } from 'next'
import WelcomeClient from './WelcomeClient';

export const metadata: Metadata = {
  title: 'ようこそ | ShiftWith',
  description: 'ShiftWithへようこそ。あなたの学習スタイルを診断して、効果的な学習を始めましょう。'
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <WelcomeClient />
    </Suspense>
  );
} 
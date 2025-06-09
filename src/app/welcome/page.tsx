import React from 'react';
import { Metadata } from 'next'
import WelcomeClient from './WelcomeClient';

export const metadata: Metadata = {
  title: 'ようこそ | ShiftWith',
  description: 'ShiftWithへようこそ。あなたの学習スタイルを診断して、効果的な学習を始めましょう。'
}

export default function WelcomePage() {
  return <WelcomeClient />;
} 
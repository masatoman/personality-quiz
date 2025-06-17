import React from 'react';
import ExploreClient from './ExploreClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '教材を探す | ShiftWith',
  description: '英語学習に役立つ教材を探しましょう。レベル別、カテゴリ別に検索でき、ユーザーの評価も参考にできます。',
  openGraph: {
    title: '教材を探す | ShiftWith',
    description: '英語学習に役立つ教材を探しましょう。レベル別、カテゴリ別に検索でき、ユーザーの評価も参考にできます。',
  },
};

export default function ExplorePage() {
  return <ExploreClient />;
} 
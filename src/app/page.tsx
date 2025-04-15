import { Metadata } from 'next';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import WelcomeHero from '@/components/features/home/WelcomeHero';
import FeaturedMaterials from '@/components/features/home/FeaturedMaterials';
import GiverScoreIntro from '@/components/features/home/GiverScoreIntro';
import HowItWorks from '@/components/features/home/HowItWorks';

export const metadata: Metadata = {
  title: 'ShiftWith - 教えることで学ぶ、新しい英語学習プラットフォーム',
  description: '「教えることで学ぶ」をコンセプトに、ギバー行動を通じて効果的に英語を学習できるプラットフォーム。教材作成やフィードバック提供でポイントを獲得し、学習効果を高めましょう。',
  openGraph: {
    type: 'website',
    url: 'https://shiftwith.vercel.app',
    title: 'ShiftWith - 教えることで学ぶ、新しい英語学習プラットフォーム',
    description: '「教えることで学ぶ」をコンセプトに、ギバー行動を通じて効果的に英語を学習できるプラットフォーム。教材作成やフィードバック提供でポイントを獲得し、学習効果を高めましょう。',
    images: [{
      url: 'https://shiftwith.vercel.app/api/og?type=home',
      width: 1200,
      height: 630,
      alt: 'ShiftWithトップページ',
    }],
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ヒーローセクション */}
      <WelcomeHero />

      {/* 特徴紹介セクション */}
      <HowItWorks />

      {/* ギバースコア紹介セクション */}
      <GiverScoreIntro />

      {/* おすすめ教材セクション */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedMaterials />
      </Suspense>
    </main>
  );
} 
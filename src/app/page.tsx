import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  title: '英語学習タイプ診断 | あなたに最適な学習法を発見',
  description: '3分で完了する無料診断で、あなたの英語学習タイプを発見。共感型、没入型、適応型から、あなたの強みを活かした学習方法を科学的に分析します。',
  openGraph: {
    type: 'website',
    url: 'https://engtype.vercel.app',
    title: '英語学習タイプ診断 | あなたに最適な学習法を発見',
    description: '3分で完了する無料診断で、あなたの英語学習タイプを発見。共感型、没入型、適応型から、あなたの強みを活かした学習方法を科学的に分析します。',
    images: [{
      url: 'https://engtype.vercel.app/api/og?type=home',
      width: 1200,
      height: 630,
      alt: '英語学習タイプ診断トップページ',
    }],
  },
};

export default function RootPage() {
  redirect('/materials');
} 
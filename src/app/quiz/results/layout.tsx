import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '英語学習タイプ診断結果 | あなたに最適な学習方法',
  description: '診断結果に基づいた、あなたに最適な英語学習方法をご紹介します。共感型、没入型、適応型の特徴から、あなたの強みを活かした効率的な学習戦略を発見しましょう。',
  openGraph: {
    type: 'website',
    url: 'https://engtype.vercel.app/quiz/results',
    title: '英語学習タイプ診断結果 | あなたに最適な学習方法',
    description: '診断結果に基づいた、あなたに最適な英語学習方法をご紹介します。共感型、没入型、適応型の特徴から、あなたの強みを活かした効率的な学習戦略を発見しましょう。',
    images: ['/results-og-image.jpg'],
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
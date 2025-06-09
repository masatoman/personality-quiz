import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'ホーム | ShiftWith',
  description: 'あなたの学習活動やギバースコアを確認できるホームページです。今日のおすすめ教材や学習進捗をチェックしましょう。',
};

export default function DashboardPage() {
  return <DashboardClient />;
} 
import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'マイページ | ShiftWith',
  description: 'あなたの学習活動やギバースコアを確認できるマイページです。今日のおすすめ教材や学習進捗をチェックしましょう。',
};

export default function DashboardPage() {
  return <DashboardClient />;
} 
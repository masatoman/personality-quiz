import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'ダッシュボード | ShiftWith',
  description: 'あなたの学習活動やギバースコアを確認できるダッシュボードページです。',
};

export default function DashboardPage() {
  return <DashboardClient />;
} 
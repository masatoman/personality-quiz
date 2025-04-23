import { Suspense } from 'react';
import { Metadata } from 'next';
import { DashboardClient } from '@/components/features/dashboard/DashboardClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const metadata: Metadata = {
  title: 'ダッシュボード | ShiftWith',
  description: 'あなたの学習活動やギバースコアを確認できるダッシュボードページです。',
};

// ローディングコンポーネント
function DashboardLoading() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <LoadingSpinner />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient />
    </Suspense>
  );
} 
import { Suspense } from 'react';
import { Metadata } from 'next';
import MaterialsList from './_components/MaterialsList';
import LoadingSpinner from '@/components/common/atoms/LoadingSpinner';
import MaterialsFilter from '@/components/features/materials/MaterialsFilter';
import MaterialsSearch from '@/components/features/materials/MaterialsSearch';

export const metadata: Metadata = {
  title: '教材一覧 | ShiftWith',
  description: '英語学習に役立つ教材を探しましょう。レベル別、カテゴリ別に検索でき、ユーザーの評価も参考にできます。',
  openGraph: {
    title: '教材一覧 | ShiftWith',
    description: '英語学習に役立つ教材を探しましょう。レベル別、カテゴリ別に検索でき、ユーザーの評価も参考にできます。',
  },
};

export default function MaterialsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">教材一覧</h1>
        <MaterialsSearch />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* フィルターサイドバー */}
        <aside className="lg:col-span-1">
          <MaterialsFilter />
        </aside>

        {/* 教材リスト */}
        <main className="lg:col-span-3">
          <Suspense fallback={<LoadingSpinner />}>
            <MaterialsList />
          </Suspense>
        </main>
      </div>
    </div>
  );
} 
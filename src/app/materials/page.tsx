import { Suspense } from 'react';
import { Metadata } from 'next';
import MaterialsList from './_components/MaterialsList';
import LoadingSpinner from '@/components/common/atoms/LoadingSpinner';
import MaterialsFilter from '@/components/features/materials/MaterialsFilter';
import MaterialsSearch from '@/components/features/materials/MaterialsSearch';

export const metadata: Metadata = {
  title: '中学英文法教材一覧 | ShiftWith',
  description: '中学英文法の教材を文法項目別・学年別に検索できます。be動詞から関係代名詞まで、体系的に学習しましょう。',
  openGraph: {
    title: '中学英文法教材一覧 | ShiftWith',
    description: '中学英文法の教材を文法項目別・学年別に検索できます。be動詞から関係代名詞まで、体系的に学習しましょう。',
  },
};

export default function MaterialsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">中学英文法教材一覧</h1>
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
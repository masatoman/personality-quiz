import { Suspense } from 'react';
import { GiverScoreDisplay } from '@/components/features/giver-score/GiverScoreDisplay';
import { getGiverScore } from '@/lib/giver-score';

function GiverScoreLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const giverScoreData = await getGiverScore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
        <Suspense fallback={<GiverScoreLoading />}>
          <div className="grid grid-cols-2 gap-4">
            {/* 活動サマリーなどの他のコンポーネントをここに追加 */}
          </div>
        </Suspense>
      </div>
      
      <div className="md:col-span-1">
        <Suspense fallback={<GiverScoreLoading />}>
          <GiverScoreDisplay data={giverScoreData} />
        </Suspense>
      </div>
    </div>
  );
} 
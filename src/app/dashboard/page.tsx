import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import GiverScoreChart from '@/components/dashboard/GiverScoreChart';
import ActivityPieChart from '@/components/dashboard/ActivityPieChart';
import LoadingSpinner from '@/components/common/atoms/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { ErrorInfo } from 'react';

export const metadata: Metadata = {
  title: 'ダッシュボード | ShiftWith',
  description: 'あなたの学習活動やギバースコアを確認できるダッシュボードページです。',
};

// 型定義
interface GiverScoreData {
  date: string;
  score: number;
}

interface ActivityData {
  type: string;
  percentage: number;
}

// ダミーデータ（後で実際のAPIから取得）
const dummyData = {
  activitySummary: {
    createdMaterials: 12,
    earnedPoints: 350,
    viewedMaterials: 24
  },
  giverScore: [
    { date: '2024-01', score: 65 },
    { date: '2024-02', score: 70 },
    { date: '2024-03', score: 72 },
    { date: '2024-04', score: 75 }
  ] as GiverScoreData[],
  activityPie: [
    { type: '作成', percentage: 40 },
    { type: '学習', percentage: 35 },
    { type: '共有', percentage: 25 }
  ] as ActivityData[]
};

// ローディングコンポーネント
function DashboardLoading() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <LoadingSpinner size="large" />
    </div>
  );
}

// エラーコンポーネント
const DashboardError = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        エラーが発生しました
      </h2>
      <p className="text-gray-600 mb-4">
        {error.message || 'データの読み込み中にエラーが発生しました。'}
      </p>
      <div className="space-x-4">
        <button
          onClick={reset}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          再試行
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ページを更新
        </button>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <ErrorBoundary 
      fallback={DashboardError}
      onError={(error: Error, errorInfo: ErrorInfo) => {
        // エラー発生時の追加処理（アナリティクスへの送信など）
        console.error('ダッシュボードでエラーが発生:', error, errorInfo);
      }}
    >
      <div className="space-y-6">
        <Suspense fallback={<DashboardLoading />}>
          {/* 活動サマリー */}
          <ActivitySummary 
            createdMaterials={dummyData.activitySummary.createdMaterials}
            earnedPoints={dummyData.activitySummary.earnedPoints}
            viewedMaterials={dummyData.activitySummary.viewedMaterials}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ギバースコアチャート */}
            <GiverScoreChart data={dummyData.giverScore} />
            
            {/* 活動種類の円グラフ */}
            <ActivityPieChart data={dummyData.activityPie} />
          </div>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
} 
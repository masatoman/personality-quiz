'use client';

import React, { Suspense, useEffect, useState } from 'react';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import GiverScoreChart from '@/components/dashboard/GiverScoreChart';
import ActivityPieChart from '@/components/dashboard/ActivityPieChart';
import LoadingSpinner from '@/components/common/atoms/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { ErrorInfo } from 'react';
import { supabase } from '@/lib/supabase';

// ローディングコンポーネント
const DashboardLoading = () => (
  <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
    <LoadingSpinner />
  </div>
);

// エラーコンポーネント
const DashboardError = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-red-600 mb-3">
          エラーが発生しました
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {error.message || 'データの読み込み中にエラーが発生しました。'}
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark transition-colors"
          >
            再試行
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
          >
            ページを更新
          </button>
        </div>
      </div>
    </div>
  );
};

// ダッシュボードコンテンツ
const DashboardContent = () => {
  const [userData, setUserData] = useState({
    activitySummary: {
      createdMaterials: 0,
      earnedPoints: 0,
      viewedMaterials: 0,
    },
    activityPie: [
      { type: '教材作成', percentage: 0 },
      { type: '学習', percentage: 0 },
      { type: 'フィードバック', percentage: 0 },
    ],
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setUserId(userData.user.id);
          // アクティビティデータの取得
          const { data: activityData, error: activityError } = await supabase
            .from('user_activities')
            .select('*')
            .eq('user_id', userData.user.id);

          if (activityError) throw activityError;

          // データの集計と更新
          if (activityData) {
            const summary = {
              createdMaterials: activityData.filter(a => a.type === 'create').length,
              earnedPoints: activityData.reduce((sum, a) => sum + (a.points || 0), 0),
              viewedMaterials: activityData.filter(a => a.type === 'view').length,
            };

            const total = activityData.length || 1;
            const pieData = [
              {
                type: '教材作成',
                percentage: (activityData.filter(a => a.type === 'create').length / total) * 100
              },
              {
                type: '学習',
                percentage: (activityData.filter(a => a.type === 'view').length / total) * 100
              },
              {
                type: 'フィードバック',
                percentage: (activityData.filter(a => a.type === 'feedback').length / total) * 100
              },
            ];

            setUserData({
              activitySummary: summary,
              activityPie: pieData,
            });
          }
        }
      } catch (error) {
        console.error('ユーザーデータの取得に失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <DashboardLoading />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">ホーム</h1>
        <p className="text-gray-600 text-sm sm:text-base">あなたの学習活動の全体像とギバースコアの成長を確認できます</p>
      </div>
      <div className="space-y-6 sm:space-y-10">
        <ActivitySummary 
          createdMaterials={userData.activitySummary.createdMaterials}
          earnedPoints={userData.activitySummary.earnedPoints}
          viewedMaterials={userData.activitySummary.viewedMaterials}
        />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">ギバースコアの推移</h2>
            <GiverScoreChart userId={userId || ''} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">活動内訳</h2>
            <ActivityPieChart data={userData.activityPie} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardClient() {
  return (
    <ErrorBoundary 
      fallback={DashboardError}
      onError={(error: Error, errorInfo: ErrorInfo) => {
        console.error('ダッシュボードでエラーが発生:', error, errorInfo);
      }}
    >
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
} 
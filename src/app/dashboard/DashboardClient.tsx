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
  <div className="flex justify-center items-center min-h-screen">
    <LoadingSpinner />
  </div>
);

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
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          // プロフィールデータの取得
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          // アクティビティデータの取得
          const { data: activityData, error: activityError } = await supabase
            .from('user_activities')
            .select('*')
            .eq('user_id', user.id);

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
    <div className="space-y-6">
      <ActivitySummary 
        createdMaterials={userData.activitySummary.createdMaterials}
        earnedPoints={userData.activitySummary.earnedPoints}
        viewedMaterials={userData.activitySummary.viewedMaterials}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GiverScoreChart userId={userId || ''} />
        <ActivityPieChart data={userData.activityPie} />
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
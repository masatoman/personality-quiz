import React from 'react';
import { Metadata } from 'next';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import GiverScoreChart from '@/components/dashboard/GiverScoreChart';
import ActivityPieChart from '@/components/dashboard/ActivityPieChart';

export const metadata: Metadata = {
  title: 'ダッシュボード | ShiftWith',
  description: 'あなたの学習活動やギバースコアを確認できるダッシュボードページです。',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 活動サマリー */}
      <ActivitySummary 
        createdMaterialsCount={12}
        earnedPoints={350}
        viewedMaterialsCount={24}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ギバースコアチャート */}
        <GiverScoreChart />
        
        {/* 活動種類の円グラフ */}
        <ActivityPieChart />
      </div>
    </div>
  );
} 
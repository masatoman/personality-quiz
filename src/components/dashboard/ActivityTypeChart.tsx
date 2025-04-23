'use client';

import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ActivityType, activityTypeMap } from '@/types/activity';
import { useQuery } from '@tanstack/react-query';
import { getActivityStats } from '@/lib/api';

// 活動タイプ情報の型定義
interface ActivityTypeInfo {
  type: ActivityType;
  count: number;
  label: string;
  color: string;
}

// 円グラフコンポーネントのプロパティ
interface ActivityTypeChartProps {
  userId: string;
}

// 活動種類別円グラフコンポーネント
const ActivityTypeChart: React.FC<ActivityTypeChartProps> = ({ userId }) => {
  const {
    data: activityData,
    isLoading: loading,
    error,
    refetch
  } = useQuery<ActivityTypeInfo[]>({
    queryKey: ['activityStats', userId],
    queryFn: () => getActivityStats(userId),
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
    retry: 2
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              活動データの取得中にエラーが発生しました
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activityData || activityData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        活動データがありません
      </div>
    );
  }

  // 合計活動数を計算
  const totalActivities = activityData.reduce((sum, item) => sum + item.count, 0);

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-bold">{data.label}</p>
          <p className="text-sm">{`${data.count}回（${((data.count / totalActivities) * 100).toFixed(1)}%）`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">活動種類の割合</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="label"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {activityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {activityData.map((activity) => (
          <div key={activity.type} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: activity.color }} 
            />
            <span className="text-sm">{activity.label}: {activity.count}回</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>総活動数: {totalActivities}回</p>
        <p>※ ギバースコアの向上には、特に「コンテンツ作成」と「フィードバック提供」が効果的です。</p>
      </div>
    </div>
  );
};

export default ActivityTypeChart; 
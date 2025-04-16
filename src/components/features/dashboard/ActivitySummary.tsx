'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getActivityStats } from '@/lib/api';

// アクティビティ統計情報の型定義
interface ActivityStat {
  total: number;
  change: number;
}

interface ActivitySummaryData {
  stats: {
    contributions: ActivityStat;
    points: ActivityStat;
    streak: ActivityStat;
  };
}

// コンポーネントのプロパティ
interface ActivitySummaryProps {
  userId: string;
}

// ActivitySummaryCardの型定義を追加
interface ActivitySummaryCardProps {
  title: string;
  value: number;
  change?: number;
}

// 活動サマリーコンポーネント
export const ActivitySummary: React.FC = () => {
  const { data, isLoading, error } = useQuery<ActivitySummaryData>({
    queryKey: ['activityStats'],
    queryFn: getActivityStats
  });

  const stats = useMemo(() => {
    if (!data) return null;
    return [
      {
        title: '投稿数',
        value: data.stats.contributions.total,
        change: data.stats.contributions.change
      },
      {
        title: 'ポイント',
        value: data.stats.points.total,
        change: data.stats.points.change
      },
      {
        title: '連続日数',
        value: data.stats.streak.total,
        change: data.stats.streak.change
      }
    ];
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading activity summary</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats?.map((stat) => (
        <ActivitySummaryCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
        />
      ))}
    </div>
  );
};

const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({ title, value, change }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {change && (
        <p className={`ml-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </p>
      )}
    </div>
  </div>
);

ActivitySummaryCard.displayName = 'ActivitySummaryCard';

export default ActivitySummary; 
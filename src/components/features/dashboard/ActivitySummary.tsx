'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaBookOpen, 
  FaPencilAlt, 
  FaEye, 
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaChartBar
} from 'react-icons/fa';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// アクティビティ統計情報の型定義
interface ActivityStats {
  createdMaterials: number;
  totalPoints: number;
  viewedMaterials: number;
  // 前回との比較用
  createdMaterialsChange: number;
  totalPointsChange: number;
  viewedMaterialsChange: number;
}

interface ActivityStat {
  id: string;
  title: string;
  value: number;
  change?: number;
}

interface ActivitySummaryData {
  stats: ActivityStat[];
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
export const ActivitySummary: React.FC<ActivitySummaryProps> = ({ userId }) => {
  const { data, isLoading, error } = useQuery<ActivitySummaryData>({
    queryKey: ['activitySummary', userId],
    queryFn: async () => {
      const response = await fetch(`/api/activity/summary/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity summary');
      }
      const data: ActivitySummaryData = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 30 * 60 * 1000, // 30分
  });

  const renderChange = useMemo(() => (value: number) => {
    const isPositive = value > 0;
    return (
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}
      >
        {isPositive ? '+' : ''}{value}%
      </motion.span>
    );
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error instanceof Error ? error.message : '活動サマリーの取得に失敗しました'}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.stats.map((stat: ActivityStat) => (
        <ActivitySummaryCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          change={stat.change}
        />
      ))}
    </div>
  );
};

const ActivitySummaryCard = ({ title, value, change }: ActivitySummaryCardProps) => {
  // renderChangeをコンポーネント内で定義
  const renderChange = (value: number) => {
    const isPositive = value > 0;
    return (
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}
      >
        {isPositive ? '+' : ''}{value}%
      </motion.span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-white rounded-lg shadow-sm"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {change !== undefined && renderChange(change)}
    </motion.div>
  );
};

ActivitySummaryCard.displayName = 'ActivitySummaryCard';

export default ActivitySummary; 
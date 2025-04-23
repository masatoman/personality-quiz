'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ActivityType } from '@/types/quiz';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { FaChartPie } from 'react-icons/fa';
import { Chart } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
  className?: string;
}

// 活動種類別円グラフコンポーネント
const ActivityTypeChart: React.FC<ActivityTypeChartProps> = ({ userId, className }) => {
  const [activityData, setActivityData] = useState<ActivityTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChartData<'pie'> | null>(null);

  // 活動タイプの表示名とカラーマップをuseMemoでラップ
  const activityTypeMap = useMemo(() => ({
    'CREATE_CONTENT': { label: 'コンテンツ作成', color: '#6246EA' },
    'PROVIDE_FEEDBACK': { label: 'フィードバック提供', color: '#36B9CC' },
    'CONSUME_CONTENT': { label: 'コンテンツ利用', color: '#4CAF50' },
    'RECEIVE_FEEDBACK': { label: 'フィードバック受領', color: '#FFC107' },
    'SHARE_RESOURCE': { label: 'リソース共有', color: '#FF5722' },
    'ASK_QUESTION': { label: '質問', color: '#9C27B0' }
  }), []);

  // モックデータ生成関数（開発用）をuseCallbackでラップ
  const generateMockData = useCallback((): ActivityTypeInfo[] => {
    return [
      {
        type: 'CONSUME_CONTENT',
        count: 45,
        label: activityTypeMap['CONSUME_CONTENT'].label,
        color: activityTypeMap['CONSUME_CONTENT'].color
      },
      {
        type: 'CREATE_CONTENT',
        count: 12,
        label: activityTypeMap['CREATE_CONTENT'].label,
        color: activityTypeMap['CREATE_CONTENT'].color
      },
      {
        type: 'PROVIDE_FEEDBACK',
        count: 23,
        label: activityTypeMap['PROVIDE_FEEDBACK'].label,
        color: activityTypeMap['PROVIDE_FEEDBACK'].color
      },
      {
        type: 'RECEIVE_FEEDBACK',
        count: 18,
        label: activityTypeMap['RECEIVE_FEEDBACK'].label,
        color: activityTypeMap['RECEIVE_FEEDBACK'].color
      },
      {
        type: 'SHARE_RESOURCE',
        count: 7,
        label: activityTypeMap['SHARE_RESOURCE'].label,
        color: activityTypeMap['SHARE_RESOURCE'].color
      },
      {
        type: 'ASK_QUESTION',
        count: 15,
        label: activityTypeMap['ASK_QUESTION'].label,
        color: activityTypeMap['ASK_QUESTION'].color
      }
    ];
  }, [activityTypeMap]);

  // fetchActivityDataをuseCallbackでラップ
  const fetchActivityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/activity-stats?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`データの取得に失敗しました: ${response.status}`);
      }
      
      const data = await response.json();
      
      // データの形式を整える
      const formattedData = Object.entries(data.activityCounts).map(([type, count]) => ({
        type: type as ActivityType,
        count: count as number,
        label: activityTypeMap[type as ActivityType]?.label || type,
        color: activityTypeMap[type as ActivityType]?.color || '#999999'
      }));
      
      setActivityData(formattedData);
    } catch (error) {
      console.error('活動データの取得に失敗しました:', error);
      setError('活動データの取得中にエラーが発生しました。');
      
      // 開発用のモックデータ
      setActivityData(generateMockData());
    } finally {
      setLoading(false);
    }
  }, [userId, activityTypeMap, generateMockData]);

  useEffect(() => {
    void fetchActivityData();
  }, [fetchActivityData]);

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

  const fetchData = async () => {
    try {
      const response = await fetch('/api/activity-types');
      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          generateLabels: (chart) => {
            const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
            return labels.map(label => ({
              ...label,
              text: label.text,
              fillStyle: label.fillStyle,
              strokeStyle: label.strokeStyle,
              lineWidth: label.lineWidth,
              hidden: label.hidden,
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.formattedValue;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div 
        className={className}
        role="status"
        aria-label="アクティビティタイプチャートの読み込み中"
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={className}
        role="alert"
        aria-live="polite"
      >
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!activityData || activityData.length === 0) {
    return (
      <div 
        className={className}
        role="status"
        aria-label="データがありません"
      >
        データが見つかりませんでした
      </div>
    );
  }

  return (
    <div 
      className={className}
      role="region"
      aria-label="アクティビティタイプの分布"
    >
      <Chart 
        type="pie"
        data={data}
        options={options}
        aria-label="アクティビティタイプの円グラフ"
      />
    </div>
  );
};

export default ActivityTypeChart; 
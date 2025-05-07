'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ActivityType } from '@/types/quiz';
import LoadingState from '@/components/common/molecules/LoadingState';
import EmptyState from '@/components/common/molecules/EmptyState';
import { FaChartPie } from 'react-icons/fa';

// 活動タイプ情報の型定義
interface ActivityTypeInfo {
  type: ActivityType;
  count: number;
  label: string;
  color: string;
}

// ActivityTypeChartProps型にuserId: stringを追加
export interface ActivityTypeChartProps {
  userId: string;
  // 他のpropsがあればここに追加
}

// 活動種類別円グラフコンポーネント
const ActivityTypeChart: React.FC<ActivityTypeChartProps> = ({ userId }) => {
  const [activityData, setActivityData] = useState<ActivityTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // activityTypeMapをuseMemoでラップ
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
    const mockData: ActivityTypeInfo[] = [
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
    return mockData;
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
    fetchActivityData();
  }, [fetchActivityData]);

  useEffect(() => {
    generateMockData();
  }, [generateMockData, activityTypeMap]);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">活動種類の割合</h2>
        <LoadingState
          variant="spinner"
          text="活動データを読み込み中..."
          size="md"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">活動種類の割合</h2>
        <EmptyState
          title="エラーが発生しました"
          message={error}
          icon={FaChartPie}
          variant="card"
          action={{
            label: "再試行",
            onClick: () => {
              setError(null);
              setLoading(true);
              fetchActivityData();
            }
          }}
        />
      </div>
    );
  }

  if (!activityData || activityData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">活動種類の割合</h2>
        <EmptyState
          title="活動データがありません"
          message="活動を開始して、データを記録しましょう。"
          icon={FaChartPie}
          variant="card"
        />
      </div>
    );
  }

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
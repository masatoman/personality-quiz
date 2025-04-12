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
import { ActivityType } from '@/types/quiz';

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
  const [activityData, setActivityData] = useState<ActivityTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 活動タイプの表示名とカラーマップ
  const activityTypeMap: Record<ActivityType, { label: string; color: string }> = {
    'CREATE_CONTENT': { label: 'コンテンツ作成', color: '#6246EA' },
    'PROVIDE_FEEDBACK': { label: 'フィードバック提供', color: '#36B9CC' },
    'CONSUME_CONTENT': { label: 'コンテンツ利用', color: '#4CAF50' },
    'RECEIVE_FEEDBACK': { label: 'フィードバック受領', color: '#FFC107' },
    'SHARE_RESOURCE': { label: 'リソース共有', color: '#FF5722' },
    'ASK_QUESTION': { label: '質問', color: '#9C27B0' }
  };

  // データ取得
  useEffect(() => {
    const fetchActivityData = async () => {
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
    };
    
    fetchActivityData();
  }, [userId]);

  // モックデータ生成関数（開発用）
  const generateMockData = (): ActivityTypeInfo[] => {
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
  };

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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          <p>{error}</p>
        </div>
      ) : activityData.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          <p>まだ活動データがありません。</p>
        </div>
      ) : (
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
      )}
      
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
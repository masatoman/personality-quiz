'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ActivityType } from '@/types/common';

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

  // activityTypeMapをuseMemoでラップ
  const activityTypeMap = useMemo(() => ({
    'CREATE_CONTENT': { label: 'コンテンツ作成', color: '#6246EA' },
    'PROVIDE_FEEDBACK': { label: 'フィードバック提供', color: '#36B9CC' },
    'CONSUME_CONTENT': { label: 'コンテンツ利用', color: '#4CAF50' },
    'RECEIVE_FEEDBACK': { label: 'フィードバック受領', color: '#FFC107' },
    'SHARE_RESOURCE': { label: 'リソース共有', color: '#FF5722' },
    'ASK_QUESTION': { label: '質問', color: '#9C27B0' }
  }), []);

  // モックデータ生成関数を削除し、データ取得のみに変更
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
        setError('活動データを取得できませんでした。しばらく後にもう一度お試しください。');
        setActivityData([]); // エラー時は空配列を設定
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivityData();
  }, [userId, activityTypeMap]);

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
          <span className="ml-2 text-gray-600">データを読み込み中...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      ) : activityData.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md">
            <p className="text-gray-600 mb-2">まだ活動データがありません。</p>
            <p className="text-sm text-gray-500">教材を学習したり、コンテンツを作成すると活動データが蓄積されます。</p>
          </div>
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
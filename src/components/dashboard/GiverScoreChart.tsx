'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { GiverScoreHistoryItem } from '@/types/quiz';

// 表示スパンの型定義
type TimeSpan = '1週間' | '1ヶ月' | '3ヶ月' | '6ヶ月' | '1年';

// コンポーネントのプロパティ
export interface GiverScoreChartProps {
  userId: string;
  // 他のpropsがあればここに追加
}

// ギバースコア推移グラフコンポーネント
const GiverScoreChart: React.FC<GiverScoreChartProps> = ({ userId }) => {
  const [scoreHistory, setScoreHistory] = useState<GiverScoreHistoryItem[]>([]);
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('1ヶ月');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 色の設定
  const accentColor = '#4CAF50';
  const textColor = '#333333';

  // ギバースコア履歴データの取得（モック）
  useEffect(() => {
    // ... existing code ...
  }, [userId, timeSpan]);

  // ... existing code ...

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-bold mb-4">ギバースコア推移</h3>
      
      {/* 期間選択ボタン */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['1週間', '1ヶ月', '3ヶ月', '6ヶ月', '1年'] as TimeSpan[]).map((span) => (
          <button
            key={span}
            onClick={() => setTimeSpan(span)}
            className={`px-2 py-1 text-sm rounded ${
              timeSpan === span 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {span}
          </button>
        ))}
      </div>
      
      {/* ローディング状態 */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {/* エラー表示 */}
      {error && !loading && (
        <div className="text-red-500 p-4 text-center">
          <p>{error}</p>
          <button 
            onClick={() => {/* データ再取得処理 */}}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            再試行
          </button>
        </div>
      )}
      
      {/* グラフ表示 */}
      {!loading && !error && scoreHistory.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={scoreHistory}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke={textColor}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke={textColor}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke={accentColor}
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="ギバースコア"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* データなしの表示 */}
      {!loading && !error && scoreHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>データがありません</p>
          <p className="text-sm mt-2">
            アクティビティを増やすとギバースコアが記録されます
          </p>
        </div>
      )}
    </div>
  );
};

export default GiverScoreChart; 
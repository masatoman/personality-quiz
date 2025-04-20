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
interface GiverScoreChartProps {
  userId: string;
}

// ギバースコア推移グラフコンポーネント
const GiverScoreChart: React.FC<GiverScoreChartProps> = ({ userId }) => {
  const [scoreHistory, setScoreHistory] = useState<GiverScoreHistoryItem[]>([]);
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('1ヶ月');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 現在の日付から指定された期間分の過去の日付を取得
  const getDateBefore = (span: TimeSpan): Date => {
    const now = new Date();
    switch (span) {
      case '1週間':
        return new Date(now.setDate(now.getDate() - 7));
      case '1ヶ月':
        return new Date(now.setMonth(now.getMonth() - 1));
      case '3ヶ月':
        return new Date(now.setMonth(now.getMonth() - 3));
      case '6ヶ月':
        return new Date(now.setMonth(now.getMonth() - 6));
      case '1年':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  };

  // データ取得
  useEffect(() => {
    const fetchScoreHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const startDate = getDateBefore(timeSpan);
        
        const response = await fetch(`/api/user/giver-score-history?userId=${userId}&startDate=${startDate.toISOString()}`);
        
        if (!response.ok) {
          throw new Error(`データの取得に失敗しました: ${response.status}`);
        }
        
        const data = await response.json();
        
        // データの形式を整える（日付でソート）
        const sortedData = data.history.sort((a: GiverScoreHistoryItem, b: GiverScoreHistoryItem) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        
        setScoreHistory(sortedData);
      } catch (error) {
        console.error('スコア履歴の取得に失敗しました:', error);
        setError('スコア履歴の取得中にエラーが発生しました。');
        
        // 開発用のモックデータ
        setScoreHistory(generateMockData(timeSpan));
      } finally {
        setLoading(false);
      }
    };
    
    fetchScoreHistory();
  }, [userId, timeSpan]);

  // モックデータ生成関数（開発用）
  const generateMockData = (span: TimeSpan): GiverScoreHistoryItem[] => {
    const data: GiverScoreHistoryItem[] = [];
    const now = new Date();
    const startDate = getDateBefore(span);
    const currentDate = new Date(startDate);
    
    // 基準となるスコア値
    let baseScore = 65;
    
    // 日付の間隔を決定
    let interval = 1; // デフォルトは1日ごと
    if (span === '3ヶ月' || span === '6ヶ月') {
      interval = 3; // 3日ごと
    } else if (span === '1年') {
      interval = 7; // 1週間ごと
    }
    
    // データ生成
    while (currentDate <= now) {
      // ランダムな変動を加える（-3〜+5の範囲）
      const randomChange = Math.floor(Math.random() * 9) - 3;
      
      // 全体的に右肩上がりになるように調整
      const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const trendIncrease = daysPassed * 0.05; // 日数が経つほどわずかに上昇
      
      // 最終スコアを計算（0〜100の範囲内に収める）
      baseScore = Math.min(100, Math.max(0, baseScore + randomChange + trendIncrease));
      
      data.push({
        userId,
        score: Math.round(baseScore),
        timestamp: new Date(currentDate)
      });
      
      // 次の日付に進む
      currentDate.setDate(currentDate.getDate() + interval);
    }
    
    return data;
  };

  // グラフ用にデータをフォーマット
  const formatDataForChart = () => {
    return scoreHistory.map(item => ({
      date: new Date(item.timestamp).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      }),
      score: item.score
    }));
  };

  // 期間選択ハンドラ
  const handleTimeSpanChange = (span: TimeSpan) => {
    setTimeSpan(span);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">ギバースコア推移</h2>
        <div className="flex space-x-2">
          {(['1週間', '1ヶ月', '3ヶ月', '6ヶ月', '1年'] as TimeSpan[]).map((span) => (
            <button
              key={span}
              onClick={() => handleTimeSpanChange(span)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                timeSpan === span
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {span}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formatDataForChart()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                padding={{ left: 10, right: 10 }} 
              />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 25, 50, 75, 100]} 
                label={{ value: 'スコア', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [`${value}ポイント`, 'ギバースコア']}
                labelFormatter={(label) => `日付: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name="ギバースコア"
                stroke="#6246EA"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>※ ギバースコアはギバー行動（教材作成、フィードバック提供など）に基づいて計算されます。</p>
      </div>
    </div>
  );
};

export default GiverScoreChart; 
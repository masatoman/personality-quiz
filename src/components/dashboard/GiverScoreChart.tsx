'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

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
import { supabase } from '@/lib/supabase';
import { GiverScoreHistoryItem } from '@/types/common';

// 表示スパンの型定義
type TimeSpan = '1週間' | '1ヶ月' | '3ヶ月' | '6ヶ月' | '1年';

// エラーの種類を定義
type ErrorType = {
  type: 'NO_DATA' | 'NETWORK' | 'SERVER' | null;
  message: string;
};

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
  const [error, setError] = useState<ErrorType | null>(null);

  // 色の設定
  const accentColor = '#4CAF50';
  const textColor = '#333333';

  useEffect(() => {
    const fetchGiverScoreHistory = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 期間に応じた日付範囲を計算
        const now = new Date();
        let startDate = new Date();
        switch (timeSpan) {
          case '1週間':
            startDate.setDate(now.getDate() - 7);
            break;
          case '1ヶ月':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3ヶ月':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case '6ヶ月':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case '1年':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        // Supabaseからデータを取得
        const { data, error: fetchError } = await supabase
          .from('giver_scores')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', now.toISOString())
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw {
            type: 'SERVER',
            message: 'サーバーでエラーが発生しました'
          };
        }

        if (!data || data.length === 0) {
          setError({
            type: 'NO_DATA',
            message: 'この期間のデータはありません'
          });
          setScoreHistory([]);
          return;
        }

        // データを整形
        const formattedData: GiverScoreHistoryItem[] = data.map(item => ({
          userId: item.user_id,
          date: new Date(item.created_at).toLocaleDateString('ja-JP'),
          score: item.score,
          createdAt: item.created_at
        }));

        setScoreHistory(formattedData);
        setError(null);

      } catch (err: unknown) {
        console.error('ギバースコア履歴の取得に失敗:', err);
        setError(
          (err as { type: 'SERVER' }).type === 'SERVER'
            ? err as ErrorType
            : {
                type: 'NETWORK',
                message: 'ネットワークエラーが発生しました'
              }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGiverScoreHistory();
  }, [userId, timeSpan]);

  // エラーメッセージコンポーネント
  const ErrorMessage = () => {
    if (!error || !error.type) return null;

    const messages: Record<NonNullable<ErrorType['type']>, {
      title: string;
      description: React.ReactNode;
      buttonText: string;
      buttonClass: string;
    }> = {
      NO_DATA: {
        title: 'データがありません',
        description: (
          <>
            <p className="text-sm text-center max-w-sm mb-4">
              この期間のギバースコアデータはまだありません。
              以下のような活動でスコアが記録されます：
            </p>
            <ul className="text-sm space-y-2">
              <li>• 教材の作成と共有</li>
              <li>• 他の学習者へのフィードバック</li>
              <li>• コミュニティへの貢献</li>
            </ul>
          </>
        ),
        buttonText: '期間を変更',
        buttonClass: 'bg-green-100 text-green-700 hover:bg-green-200'
      },
      NETWORK: {
        title: 'ネットワークエラー',
        description: 'インターネット接続を確認して、もう一度お試しください。',
        buttonText: '再試行',
        buttonClass: 'bg-red-100 text-red-700 hover:bg-red-200'
      },
      SERVER: {
        title: 'サーバーエラー',
        description: '申し訳ありません。サーバーでエラーが発生しました。',
        buttonText: '再試行',
        buttonClass: 'bg-red-100 text-red-700 hover:bg-red-200'
      }
    };

    const errorConfig = messages[error.type];

    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg font-semibold mb-2">{errorConfig.title}</p>
        {errorConfig.description}
        <button 
          onClick={() => setTimeSpan(timeSpan)}
          className={`mt-4 px-4 py-2 rounded ${errorConfig.buttonClass}`}
        >
          {errorConfig.buttonText}
        </button>
      </div>
    );
  };

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
      {!loading && error && <ErrorMessage />}
      
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
    </div>
  );
};

export default GiverScoreChart; 
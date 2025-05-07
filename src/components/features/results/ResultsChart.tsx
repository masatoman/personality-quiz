'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { QuizResults } from '@/types/quiz';

// チャートのプロパティ型定義
interface ResultsChartProps {
  results: QuizResults;
}

// 結果チャートコンポーネント
const ResultsChart: React.FC<ResultsChartProps> = ({ results }) => {
  // チャートデータの準備
  const chartData = [
    { name: '共感型', value: results.percentage.giver },
    { name: '没入型', value: results.percentage.taker },
    { name: 'バランス型', value: results.percentage.matcher }
  ];

  return (
    <div className="mx-auto max-w-xs md:max-w-sm bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">あなたの学習タイプ分布</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            <Cell key="giver" fill="#6246EA" />
            <Cell key="taker" fill="#36B9CC" />
            <Cell key="matcher" fill="#4CAF50" />
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart; 
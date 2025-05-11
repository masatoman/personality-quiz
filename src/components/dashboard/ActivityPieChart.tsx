'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { motion } from 'framer-motion';

export interface ActivityPieChartProps {
  data: Array<{
    type: string;
    percentage: number;
  }>;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

const ActivityPieChart: React.FC<ActivityPieChartProps> = ({ data }) => {
  const hasData = data.some(item => item.percentage > 0);

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[300px] flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-6"
      >
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">アクティビティデータがありません</h3>
          <p className="text-sm mb-4">以下のアクティビティを行うとデータが記録されます：</p>
          <ul className="text-sm text-left space-y-2">
            <li className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#4F46E5] mr-2"></span>
              教材作成
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#10B981] mr-2"></span>
              学習活動
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] mr-2"></span>
              フィードバック
            </li>
          </ul>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[300px] bg-white rounded-lg shadow-md p-4"
    >
      <h3 className="text-lg font-semibold mb-4">アクティビティ分布</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="percentage"
            nameKey="type"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ActivityPieChart; 
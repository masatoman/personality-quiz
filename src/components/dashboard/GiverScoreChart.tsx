'use client';

import React from 'react';
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
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { motion } from 'framer-motion';

export interface GiverScoreChartProps {
  data: Array<{
    date: string;
    score: number;
  }>;
}

const GiverScoreChart: React.FC<GiverScoreChartProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MM/dd', { locale: ja });
    } catch (error) {
      console.error('日付の変換エラー:', error);
      return dateStr;
    }
  };

  // デザイン仕様書に合わせた色
  const mainColor = '#3B82F6'; // メインカラー
  const gridColor = '#E5E7EB'; // ボーダー色

  // アニメーション設定
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.4
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={12}
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={{
              stroke: '#4F46E5',
              strokeWidth: 2,
              r: 4,
              fill: '#fff'
            }}
            activeDot={{
              r: 6,
              stroke: '#4F46E5',
              strokeWidth: 2,
              fill: '#4F46E5'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default GiverScoreChart; 
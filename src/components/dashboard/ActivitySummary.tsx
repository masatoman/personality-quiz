'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaStar, FaEye } from 'react-icons/fa';

export interface ActivitySummaryProps {
  createdMaterials: number;
  earnedPoints: number;
  viewedMaterials: number;
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  createdMaterials,
  earnedPoints,
  viewedMaterials
}) => {
  const items = [
    {
      icon: FaBook,
      label: '作成した教材',
      value: createdMaterials,
      color: 'text-blue-500'
    },
    {
      icon: FaStar,
      label: '獲得ポイント',
      value: earnedPoints,
      color: 'text-yellow-500'
    },
    {
      icon: FaEye,
      label: '閲覧した教材',
      value: viewedMaterials,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-2">
            <item.icon className={`text-2xl ${item.color} mr-2`} />
            <h3 className="text-gray-600 dark:text-gray-300">{item.label}</h3>
          </div>
          <p className="text-3xl font-bold">{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivitySummary; 
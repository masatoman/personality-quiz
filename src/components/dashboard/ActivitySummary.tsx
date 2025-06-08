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
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: FaStar,
      label: '獲得ポイント',
      value: earnedPoints,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: FaEye,
      label: '閲覧した教材',
      value: viewedMaterials,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start space-x-4 sm:space-x-5">
            <div className={`${item.bgColor} ${item.color} p-3 sm:p-4 rounded-lg`}>
              <item.icon className="text-xl sm:text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">{item.label}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {(item.value || 0).toLocaleString()}
                <span className="text-sm sm:text-base font-medium text-gray-600 ml-1.5 sm:ml-2">
                  {item.label === '獲得ポイント' ? 'pt' : '件'}
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivitySummary; 
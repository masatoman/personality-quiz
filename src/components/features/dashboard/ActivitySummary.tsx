'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaBookOpen, 
  FaPencilAlt, 
  FaEye, 
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';

// アクティビティ統計情報の型定義
interface ActivityStats {
  createdMaterials: number;
  totalPoints: number;
  viewedMaterials: number;
  // 前回との比較用
  createdMaterialsChange: number;
  totalPointsChange: number;
  viewedMaterialsChange: number;
}

// コンポーネントのプロパティ
interface ActivitySummaryProps {
  userId: string;
}

// 活動サマリーコンポーネント
const ActivitySummary: React.FC<ActivitySummaryProps> = ({ userId }) => {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    const fetchActivityStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/user/activity-summary?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error(`データの取得に失敗しました: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('活動統計の取得に失敗しました:', error);
        setError('活動統計の取得中にエラーが発生しました。');
        
        // 開発用のモックデータ
        setStats({
          createdMaterials: 12,
          totalPoints: 1250,
          viewedMaterials: 48,
          createdMaterialsChange: 2,
          totalPointsChange: 150,
          viewedMaterialsChange: -3
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivityStats();
  }, [userId]);

  // 変化表示のヘルパー関数
  const renderChange = (value: number) => {
    if (value > 0) {
      return (
        <span className="text-green-500 flex items-center">
          <FaArrowUp className="mr-1" />
          {value}
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="text-red-500 flex items-center">
          <FaArrowDown className="mr-1" />
          {Math.abs(value)}
        </span>
      );
    } else {
      return (
        <span className="text-gray-500 flex items-center">
          <FaMinus className="mr-1" />
          {value}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 作成した教材数 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">作成した教材</h3>
          <div className="p-2 bg-blue-100 rounded-full">
            <FaPencilAlt className="text-blue-600" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-bold">{stats.createdMaterials}</p>
          <div className="text-sm">
            前週比 {renderChange(stats.createdMaterialsChange)}
          </div>
        </div>
      </div>

      {/* 獲得ポイント */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">獲得ポイント</h3>
          <div className="p-2 bg-green-100 rounded-full">
            <FaBookOpen className="text-green-600" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-bold">{stats.totalPoints}</p>
          <div className="text-sm">
            前週比 {renderChange(stats.totalPointsChange)}
          </div>
        </div>
      </div>

      {/* 閲覧した教材数 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">閲覧した教材</h3>
          <div className="p-2 bg-purple-100 rounded-full">
            <FaEye className="text-purple-600" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-bold">{stats.viewedMaterials}</p>
          <div className="text-sm">
            前週比 {renderChange(stats.viewedMaterialsChange)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySummary; 
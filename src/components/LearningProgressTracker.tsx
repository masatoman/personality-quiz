'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { FaBook, FaCheckCircle, FaSpinner, FaChartLine, FaClock, FaTrophy } from 'react-icons/fa';

interface LearningStats {
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  totalPoints: number;
}

interface Resource {
  id: number;
  title: string;
  completionPercentage: number;
  lastUpdated: string;
  resourceType: string;
}

interface LearningProgressTrackerProps {
  userId?: string;
  showDetailedView?: boolean;
}

export const LearningProgressTracker: React.FC<LearningProgressTrackerProps> = ({
  userId,
  showDetailedView = false,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'resources' | 'achievements'>('overview');

  // ユーザーIDを取得（外部から渡されない場合は現在のユーザーを使用）
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    const fetchLearningStats = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        // 統計情報の取得
        const statsResponse = await fetch(`${apiUrl}/api/learning/stats?userId=${targetUserId}`);
        if (!statsResponse.ok) {
          throw new Error('学習統計データの取得に失敗しました');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // 最近のリソース情報取得
        const resourcesResponse = await fetch(`${apiUrl}/api/learning/recent-resources?userId=${targetUserId}`);
        if (!resourcesResponse.ok) {
          throw new Error('最近の学習リソースの取得に失敗しました');
        }
        const resourcesData = await resourcesResponse.json();
        setRecentResources(resourcesData);
        
        setError(null);
      } catch (err) {
        console.error('学習進捗データの取得中にエラーが発生しました:', err);
        setError('データの読み込み中にエラーが発生しました。後でもう一度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningStats();
  }, [targetUserId]);

  if (isLoading) {
    return (
      <div className="learning-progress-tracker p-6 bg-white rounded-lg shadow-md flex justify-center items-center min-h-[200px]">
        <FaSpinner className="animate-spin text-primary text-2xl mr-2" />
        <p>進捗データを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-progress-tracker p-6 bg-white rounded-lg shadow-md">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!targetUserId) {
    return (
      <div className="learning-progress-tracker p-6 bg-white rounded-lg shadow-md">
        <p>進捗データを表示するにはログインしてください。</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="learning-progress-tracker p-6 bg-white rounded-lg shadow-md">
        <p>まだ学習データがありません。教材を学習して進捗を記録しましょう。</p>
      </div>
    );
  }

  const completionRate = stats.totalResources > 0 
    ? Math.round((stats.completedResources / stats.totalResources) * 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="learning-progress-tracker p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">学習進捗トラッカー</h2>
      
      {/* タブナビゲーション */}
      <div className="tab-navigation flex mb-6 border-b">
        <button 
          className={`tab-btn py-2 px-4 ${selectedTab === 'overview' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setSelectedTab('overview')}
        >
          概要
        </button>
        <button 
          className={`tab-btn py-2 px-4 ${selectedTab === 'resources' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setSelectedTab('resources')}
        >
          教材
        </button>
        <button 
          className={`tab-btn py-2 px-4 ${selectedTab === 'achievements' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setSelectedTab('achievements')}
        >
          実績
        </button>
      </div>
      
      {/* 概要タブ */}
      {selectedTab === 'overview' && (
        <div className="overview-tab">
          <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FaBook className="text-blue-500 mr-2" />
                <h3 className="font-medium">総教材数</h3>
              </div>
              <p className="text-2xl font-bold">{stats.totalResources}</p>
            </div>
            
            <div className="stat-card p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FaCheckCircle className="text-green-500 mr-2" />
                <h3 className="font-medium">完了教材</h3>
              </div>
              <p className="text-2xl font-bold">{stats.completedResources}</p>
            </div>
            
            <div className="stat-card p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FaSpinner className="text-yellow-500 mr-2" />
                <h3 className="font-medium">進行中</h3>
              </div>
              <p className="text-2xl font-bold">{stats.inProgressResources}</p>
            </div>
            
            <div className="stat-card p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FaTrophy className="text-purple-500 mr-2" />
                <h3 className="font-medium">総ポイント</h3>
              </div>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
            </div>
          </div>
          
          <div className="progress-summary mb-6">
            <h3 className="text-lg font-medium mb-2">全体の進捗</h3>
            <div className="flex items-center mb-2">
              <span className="text-sm text-gray-600 mr-2">完了率: {completionRate}%</span>
              <span className="text-sm text-gray-600 ml-auto">
                {stats.completedResources}/{stats.totalResources} 教材
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          
          {showDetailedView && (
            <div className="activity-chart">
              <h3 className="text-lg font-medium mb-4">学習アクティビティ</h3>
              <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-center h-[200px] text-gray-500">
                <div className="text-center">
                  <FaChartLine className="mx-auto mb-2 text-2xl" />
                  <p>詳細な学習アクティビティグラフは開発中です</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 教材タブ */}
      {selectedTab === 'resources' && (
        <div className="resources-tab">
          <h3 className="text-lg font-medium mb-4">最近の学習教材</h3>
          
          {recentResources.length > 0 ? (
            <div className="resources-list space-y-4">
              {recentResources.map(resource => (
                <div key={resource.id} className="resource-item border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{resource.title}</h4>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaClock className="mr-1" size={12} />
                      {new Date(resource.lastUpdated).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                      {resource.resourceType}
                    </span>
                  </div>
                  
                  <div className="progress-info flex justify-between text-sm mb-1">
                    <span>進捗</span>
                    <span>{resource.completionPercentage}%</span>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        resource.completionPercentage === 100 
                          ? 'bg-green-500' 
                          : resource.completionPercentage > 50 
                          ? 'bg-blue-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${resource.completionPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">最近学習した教材はありません。</p>
          )}
        </div>
      )}
      
      {/* 実績タブ */}
      {selectedTab === 'achievements' && (
        <div className="achievements-tab">
          <h3 className="text-lg font-medium mb-4">学習実績</h3>
          <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-center h-[200px] text-gray-500">
            <div className="text-center">
              <FaTrophy className="mx-auto mb-2 text-2xl" />
              <p>実績システムは開発中です</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 
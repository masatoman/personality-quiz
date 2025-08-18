'use client';

import React, { useState, useEffect } from 'react';

interface PMFMetrics {
  retention: {
    d7: number;
    m1: number;
  };
  fortyPercentRule: number;
  monthlyActiveUsers: number;
  teachingLearningRatio: number;
  communityParticipationRate: number;
  targetMetrics: {
    d7RetentionTarget: number;
    m1RetentionTarget: number;
    fortyPercentRuleTarget: number;
    monthlyActiveUsersTarget: number;
  };
}

export default function PMFMetricsComponent() {
  const [metrics, setMetrics] = useState<PMFMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/pmf-metrics');
        
        if (!response.ok) {
          throw new Error('PMF指標の取得に失敗しました');
        }
        
        const data = await response.json();
        setMetrics(data.metrics);
      } catch (err) {
        console.error('PMF metrics fetch error:', err);
        setError('PMF指標の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">PMF指標</h2>
        <div className="flex justify-center items-center p-8">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">指標を読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">PMF指標</h2>
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">PMF指標</h2>
        <div className="text-center p-8">
          <p className="text-gray-600">指標データがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">PMF指標（起業の科学）</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 継続率 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">継続率</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">D7継続率</span>
                <span className={`text-sm font-bold ${getProgressColor(metrics.retention.d7, metrics.targetMetrics.d7RetentionTarget)}`}>
                  {metrics.retention.d7}% / {metrics.targetMetrics.d7RetentionTarget}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metrics.retention.d7, metrics.targetMetrics.d7RetentionTarget)}`}
                  style={{ width: `${Math.min((metrics.retention.d7 / metrics.targetMetrics.d7RetentionTarget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">M1継続率</span>
                <span className={`text-sm font-bold ${getProgressColor(metrics.retention.m1, metrics.targetMetrics.m1RetentionTarget)}`}>
                  {metrics.retention.m1}% / {metrics.targetMetrics.m1RetentionTarget}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metrics.retention.m1, metrics.targetMetrics.m1RetentionTarget)}`}
                  style={{ width: `${Math.min((metrics.retention.m1 / metrics.targetMetrics.m1RetentionTarget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 40%ルール */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">40%ルール</h3>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">「使えなくなったら困る」</span>
              <span className={`text-sm font-bold ${getProgressColor(metrics.fortyPercentRule, metrics.targetMetrics.fortyPercentRuleTarget)}`}>
                {metrics.fortyPercentRule}% / {metrics.targetMetrics.fortyPercentRuleTarget}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressBarColor(metrics.fortyPercentRule, metrics.targetMetrics.fortyPercentRuleTarget)}`}
                style={{ width: `${Math.min((metrics.fortyPercentRule / metrics.targetMetrics.fortyPercentRuleTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 月間アクティブユーザー */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">月間アクティブユーザー</h3>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">MAU</span>
              <span className={`text-sm font-bold ${getProgressColor(metrics.monthlyActiveUsers, metrics.targetMetrics.monthlyActiveUsersTarget)}`}>
                {metrics.monthlyActiveUsers} / {metrics.targetMetrics.monthlyActiveUsersTarget}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressBarColor(metrics.monthlyActiveUsers, metrics.targetMetrics.monthlyActiveUsersTarget)}`}
                style={{ width: `${Math.min((metrics.monthlyActiveUsers / metrics.targetMetrics.monthlyActiveUsersTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 教え合い指標 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">教え合い指標</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">教材作成/学習比率</span>
                <span className="text-sm font-bold text-blue-600">
                  {metrics.teachingLearningRatio}
                </span>
              </div>
              <p className="text-xs text-gray-500">1.0以上で教え合いが活発</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">コミュニティ参加率</span>
                <span className="text-sm font-bold text-blue-600">
                  {metrics.communityParticipationRate}
                </span>
              </div>
              <p className="text-xs text-gray-500">コメント・レビュー投稿率</p>
            </div>
          </div>
        </div>
      </div>

      {/* 目標達成状況 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">PMF達成目標</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="font-bold text-blue-900">D7継続率</div>
            <div className="text-blue-700">25%以上</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-900">M1継続率</div>
            <div className="text-blue-700">15%以上</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-900">40%ルール</div>
            <div className="text-blue-700">40%以上</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-900">MAU</div>
            <div className="text-blue-700">1,000人以上</div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaBell, FaAward, FaChartLine, FaBookOpen, FaSearch } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

// サブコンポーネントをインポート
import ActivitySummary from './ActivitySummary';
import GiverScoreChart from './GiverScoreChart';
import ActivityTypeChart from './ActivityTypeChart';

// ダッシュボードページコンポーネント
const DashboardPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'progress'>('overview');
  
  // ユーザーデータ取得
  useEffect(() => {
    if (user) {
      // ユーザー名の設定（実際のアプリではユーザー情報から取得）
      setUserName(user.email?.split('@')[0] || 'ユーザー');
    }
  }, [user]);

  // 認証待機中
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 未認証の場合
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <p className="mb-6 text-gray-600">
            ダッシュボードを表示するには、ログインが必要です。
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            onClick={() => {/* ログイン画面へ遷移 */}}
          >
            ログインする
          </button>
        </div>
      </div>
    );
  }

  // タブ切り替え関数
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* 活動サマリー */}
            <ActivitySummary userId={user.id} />
            
            {/* チャートセクション */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <GiverScoreChart userId={user.id} />
              <ActivityTypeChart userId={user.id} />
            </div>
            
            {/* レコメンドセクション */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaAward className="mr-2 text-yellow-500" />
                今日のレコメンド
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* レコメンドカード1 */}
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold mb-2">英語学習の基本ガイド</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    あなたのギバースコアを上げるのに最適な教材です。
                  </p>
                  <button className="text-blue-600 text-sm hover:underline">
                    詳細を見る →
                  </button>
                </div>
                
                {/* レコメンドカード2 */}
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold mb-2">文法マスターへの道</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    多くのユーザーから高評価を受けている人気の教材です。
                  </p>
                  <button className="text-blue-600 text-sm hover:underline">
                    詳細を見る →
                  </button>
                </div>
                
                {/* レコメンドカード3 */}
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold mb-2">効果的な単語学習法</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    最近のアクティビティに基づくおすすめの教材です。
                  </p>
                  <button className="text-blue-600 text-sm hover:underline">
                    詳細を見る →
                  </button>
                </div>
              </div>
            </div>
            
            {/* 最近の活動 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-500" />
                最近の活動
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                      <div>
                        <p className="font-medium">
                          {i % 2 === 0 ? '教材「英語リスニング上達のコツ」を作成しました' : 
                           i % 3 === 0 ? '「発音練習の基本」にフィードバックを提供しました' :
                           '「TOEIC対策講座」を閲覧しました'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {`${i}日前`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                すべての活動を見る
              </button>
            </div>
          </>
        );
      case 'materials':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaBookOpen className="mr-2 text-green-500" />
              あなたの教材
            </h2>
            <p className="text-gray-500 mb-6">作成した教材と利用中の教材を管理できます</p>
            
            {/* ここに教材リストを表示 */}
            <div className="text-center py-10 text-gray-500">
              教材コンテンツは開発中です
            </div>
          </div>
        );
      case 'progress':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaAward className="mr-2 text-purple-500" />
              学習進捗
            </h2>
            <p className="text-gray-500 mb-6">あなたの学習進捗と成果を確認できます</p>
            
            {/* ここに進捗グラフなどを表示 */}
            <div className="text-center py-10 text-gray-500">
              進捗詳細機能は開発中です
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <FaBell />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center">
                <FaUserCircle className="text-gray-600 mr-2" size={24} />
                <span className="font-medium">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* 検索バー */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="教材を検索..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        {/* タブナビゲーション */}
        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'overview' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('overview')}
            >
              概要
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'materials' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('materials')}
            >
              教材
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'progress' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('progress')}
            >
              進捗
            </button>
          </div>
        </div>
        
        {/* タブコンテンツ */}
        {renderTabContent()}
      </main>
    </div>
  );
};

export default DashboardPage; 
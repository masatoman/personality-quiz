'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ActivitySummary from './ActivitySummary';
import DashboardLayout from './DashboardLayout';
import TodoList from '../features/todo/TodoList';
import GiverScoreDisplay from '../features/giver-score/GiverScoreDisplay';
import GiverScoreChart from './GiverScoreChart';
import ActivityPieChart from './ActivityPieChart';
import { FaChartLine, FaCalendarAlt } from 'react-icons/fa';

// モックデータ
const initialUserData = {
  id: '',
  name: 'ユーザー',
  email: 'user@example.com',
  score: 0,
  activities: 0,
  level: 1,
  nextLevelScore: 10,
  progressPercentage: 0,
  personalityType: 'matcher' as 'giver' | 'taker' | 'matcher',
};

const DashboardClient: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [userData, setUserData] = useState(initialUserData);
  const [activityCounts, setActivityCounts] = useState({
    CREATE_CONTENT: 0,
    PROVIDE_FEEDBACK: 0,
    CONSUME_CONTENT: 0,
    COMPLETE_QUIZ: 0
  });
  const [scoreHistory, setScoreHistory] = useState([
    { date: '2023-04-01', score: 0 },
    { date: '2023-04-08', score: 10 },
    { date: '2023-04-15', score: 15 },
    { date: '2023-04-22', score: 20 },
    { date: '2023-04-29', score: 25 },
    { date: '2023-05-06', score: 40 },
    { date: '2023-05-13', score: 50 }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // クライアントサイドでのみ実行される初期化
  useEffect(() => {
    // 既存のIDを取得するか新規生成
    const storedUserId = localStorage.getItem('userId');
    const newUserId = storedUserId || 'user_' + uuidv4();
    
    if (!storedUserId) {
      localStorage.setItem('userId', newUserId);
    }
    
    setUserId(newUserId);
    
    // ユーザーデータの初期化（実際の実装ではAPI等から取得）
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // ローカルストレージからデータを取得
        const localScore = parseInt(localStorage.getItem('giverScore') || '0', 10);
        const localActivitiesStr = localStorage.getItem('activities');
        
        let localActivities = [];
        if (localActivitiesStr) {
          try {
            localActivities = JSON.parse(localActivitiesStr);
          } catch (error) {
            console.error('ローカルストレージからの活動データの解析に失敗しました:', error);
          }
        }
        
        // APIからデータ取得（失敗したらローカルデータを使用）
        try {
          const response = await fetch(`/api/activities/user/${newUserId}`);
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            // ユーザーデータを更新
            const giverScore = data.data.giverScore || 0;
            const activities = data.data.activities || [];
            
            // ギバースコアに基づくレベル計算（例: 10点ごとに1レベル、最大レベル10）
            const level = Math.min(10, Math.floor(giverScore / 10) + 1);
            // 次のレベルまでのスコア
            const nextLevelScore = level * 10;
            // 現在のレベル内での進捗率
            const progressPercentage = Math.min(100, ((giverScore % 10) / 10) * 100);
            // ギバータイプの判定
            const personalityType = giverScore >= 67 ? 'giver' : (giverScore >= 34 ? 'matcher' : 'taker');
            
            setUserData({
              id: newUserId,
              name: initialUserData.name,
              email: initialUserData.email,
              score: giverScore,
              activities: activities.length,
              level,
              nextLevelScore,
              progressPercentage,
              personalityType: personalityType as 'giver' | 'taker' | 'matcher',
            });
            
            // アクティビティのカウント
            const counts = {
              CREATE_CONTENT: activities.filter((a: any) => a.activityType === 'CREATE_CONTENT').length,
              PROVIDE_FEEDBACK: activities.filter((a: any) => a.activityType === 'PROVIDE_FEEDBACK').length,
              CONSUME_CONTENT: activities.filter((a: any) => a.activityType === 'CONSUME_CONTENT').length,
              COMPLETE_QUIZ: activities.filter((a: any) => a.activityType === 'COMPLETE_QUIZ').length
            };
            setActivityCounts(counts);
            
            // キャッシュのために更新
            localStorage.setItem('activities', JSON.stringify(activities));
            localStorage.setItem('giverScore', giverScore.toString());
          } else {
            throw new Error(data.error || 'Unknown error');
          }
        } catch (apiError) {
          console.error('APIからのデータ取得に失敗しました:', apiError);
          
          // APIエラーの場合、ローカルデータを使用
          const level = Math.min(10, Math.floor(localScore / 10) + 1);
          const nextLevelScore = level * 10;
          const progressPercentage = Math.min(100, ((localScore % 10) / 10) * 100);
          const personalityType = localScore >= 67 ? 'giver' : (localScore >= 34 ? 'matcher' : 'taker');
          
          setUserData({
            id: newUserId,
            name: initialUserData.name,
            email: initialUserData.email,
            score: localScore,
            activities: localActivities.length,
            level,
            nextLevelScore,
            progressPercentage,
            personalityType: personalityType as 'giver' | 'taker' | 'matcher',
          });
          
          // アクティビティのカウント
          const counts = {
            CREATE_CONTENT: localActivities.filter((a: any) => a.activityType === 'CREATE_CONTENT').length,
            PROVIDE_FEEDBACK: localActivities.filter((a: any) => a.activityType === 'PROVIDE_FEEDBACK').length,
            CONSUME_CONTENT: localActivities.filter((a: any) => a.activityType === 'CONSUME_CONTENT').length,
            COMPLETE_QUIZ: localActivities.filter((a: any) => a.activityType === 'COMPLETE_QUIZ').length
          };
          setActivityCounts(counts);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* ウェルカムセクション */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">こんにちは、{userData.name}さん</h1>
        <p className="text-gray-600">あなたの活動状況とギバースコアを確認しましょう</p>
      </div>

      {/* 活動サマリーとギバースコア */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-6">
        <div className="lg:col-span-8">
          <ActivitySummary
            createdMaterialsCount={activityCounts.CREATE_CONTENT}
            earnedPoints={userData.score}
            viewedMaterialsCount={activityCounts.CONSUME_CONTENT}
          />
        </div>
        <div className="lg:col-span-4">
          <GiverScoreDisplay userData={userData} />
        </div>
      </div>
      
      {/* データ可視化チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <GiverScoreChart data={scoreHistory} height={300} />
        <ActivityPieChart activityCounts={activityCounts} height={300} />
      </div>
      
      {/* 最近の活動とTODO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" />
              最近の活動
            </h2>
            {userData.activities > 0 ? (
              <ul className="space-y-2">
                <li className="p-3 bg-blue-50 rounded border border-blue-100">
                  <div className="flex justify-between">
                    <span className="font-medium">ギバー診断完了</span>
                    <span className="text-sm text-blue-600">+20ポイント</span>
                  </div>
                </li>
                {activityCounts.CREATE_CONTENT > 0 && (
                  <li className="p-3 bg-green-50 rounded border border-green-100">
                    <div className="flex justify-between">
                      <span className="font-medium">教材作成</span>
                      <span className="text-sm text-green-600">+10ポイント</span>
                    </div>
                  </li>
                )}
                {activityCounts.CONSUME_CONTENT > 0 && (
                  <li className="p-3 bg-purple-50 rounded border border-purple-100">
                    <div className="flex justify-between">
                      <span className="font-medium">教材閲覧</span>
                      <span className="text-sm text-purple-600">+1ポイント</span>
                    </div>
                  </li>
                )}
                {activityCounts.PROVIDE_FEEDBACK > 0 && (
                  <li className="p-3 bg-amber-50 rounded border border-amber-100">
                    <div className="flex justify-between">
                      <span className="font-medium">フィードバック提供</span>
                      <span className="text-sm text-amber-600">+5ポイント</span>
                    </div>
                  </li>
                )}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>まだ活動がありません</p>
                <p className="text-sm mt-1">活動を開始してポイントを獲得しましょう</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <TodoList />
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-4 md:mt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              次のイベント
            </h2>
            <div className="p-3 bg-yellow-50 rounded border border-yellow-100">
              <p className="font-medium">ギバーコミュニティミーティング</p>
              <p className="text-sm text-gray-600 mt-1">5月10日 19:00 - オンライン</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardClient; 
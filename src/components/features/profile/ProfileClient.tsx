'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Activity } from '@/types/activity';
import { GiverScoreDisplay } from '@/components/features/giver-score/GiverScoreDisplay';
import { FaHistory, FaTrophy, FaUser, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import TodoList from '@/components/features/todo/TodoList';
import type { GiverScore } from '@/types/giver-score';

// モックユーザー情報（認証システム実装後に修正）
const initialUserData = {
  name: 'ユーザー',
  email: 'user@example.com',
  avatar: null
};

// アクティビティタイプのラベル
const ACTIVITY_LABELS = {
  'CREATE_CONTENT': 'コンテンツ作成',
  'PROVIDE_FEEDBACK': 'フィードバック提供',
  'CONSUME_CONTENT': 'コンテンツ閲覧',
  'SHARE_RESOURCE': 'リソース共有',
  'ASK_QUESTION': '質問',
  'COMPLETE_QUIZ': 'クイズ完了'
};

const ProfileClient: React.FC = () => {
  // クライアントコンポーネントとしてIDをローカルで生成
  const [userId, setUserId] = useState<string>('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [giverScore, setGiverScore] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'activities' | 'achievements'>('activities');
  const [isClientRendered, setIsClientRendered] = useState<boolean>(false);

  // クライアントサイドでのみ実行される初期化
  useEffect(() => {
    // 既存のIDを取得するか新規生成
    const storedUserId = localStorage.getItem('userId');
    const newUserId = storedUserId || 'user_' + uuidv4();
    
    if (!storedUserId) {
      localStorage.setItem('userId', newUserId);
    }
    
    setUserId(newUserId);
    setIsClientRendered(true);
    
    // 以下のコードは既存のままで問題ない
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    // ページがマウントされた時にユーザーデータを取得
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // リクエストが失敗した場合に備えてローカルストレージから取得
        let localScore = parseInt(localStorage.getItem('giverScore') || '0', 10);
        let localActivities: Activity[] = [];
        
        try {
          const localActivitiesData = localStorage.getItem('activities');
          if (localActivitiesData) {
            localActivities = JSON.parse(localActivitiesData);
          }
        } catch (parseError) {
          console.error('ローカルストレージからの活動データの解析に失敗しました:', parseError);
        }
        
        try {
          // ユーザーのアクティビティとスコアを取得
          const response = await fetch(`/api/activities/user/${userId}`);
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            setActivities(data.data.activities);
            setGiverScore(data.data.giverScore);
            
            // キャッシュのために更新
            localStorage.setItem('activities', JSON.stringify(data.data.activities));
            localStorage.setItem('giverScore', data.data.giverScore.toString());
          } else {
            throw new Error(data.error || 'Unknown error');
          }
        } catch (apiError) {
          console.error('APIからのデータ取得に失敗しました:', apiError);
          
          // APIエラーの場合、ローカルデータを使用
          setActivities(localActivities);
          setGiverScore(localScore);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  // 新しいアクティビティをモックデータとして追加（テスト用）
  const addMockActivity = async (activityType: string) => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/activities/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          activityType
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // アクティビティ追加後にデータを再取得
        const refreshResponse = await fetch(`/api/activities/user/${userId}`);
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          setActivities(refreshData.data.activities);
          setGiverScore(refreshData.data.giverScore);
          
          localStorage.setItem('activities', JSON.stringify(refreshData.data.activities));
          localStorage.setItem('giverScore', refreshData.data.giverScore.toString());
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('アクティビティの追加に失敗しました:', error);
      alert('アクティビティの追加に失敗しました。');
    }
  };

  // GiverScore型のデータを生成
  const getGiverScore = (): GiverScore => {
    const level = Math.min(10, Math.floor(giverScore / 10) + 1);
    const points = giverScore;
    const progress = Math.min(100, ((giverScore % 10) / 10) * 100);
    const pointsToNextLevel = (level * 10) - giverScore;
    const personalityType: 'giver' | 'matcher' | 'taker' = 
      giverScore >= 67 ? 'giver' : (giverScore >= 34 ? 'matcher' : 'taker');
    return {
      level,
      points,
      progress,
      pointsToNextLevel,
      personalityType,
    };
  };

  // クライアントサイドレンダリングされるまでローディング表示
  if (!isClientRendered) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="profile-page max-w-4xl mx-auto p-4 md:p-8">
      <div className="profile-header bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col md:flex-row items-center">
        <div className="avatar bg-blue-100 rounded-full h-24 w-24 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
          <FaUser className="text-blue-500 text-4xl" />
        </div>
        
        <div className="profile-info flex-1">
          <h1 className="text-2xl font-bold">{initialUserData.name}さんのプロフィール</h1>
          <p className="text-gray-600 mb-2">{initialUserData.email}</p>
          {userId && <p className="text-sm text-gray-500">ユーザーID: {userId}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="tabs mb-4">
            <button 
              className={`mr-4 pb-2 px-2 font-medium ${selectedTab === 'activities' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500'}`}
              onClick={() => setSelectedTab('activities')}
            >
              <FaHistory className="inline mr-2" />
              活動履歴
            </button>
            <button 
              className={`pb-2 px-2 font-medium ${selectedTab === 'achievements' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500'}`}
              onClick={() => setSelectedTab('achievements')}
            >
              <FaTrophy className="inline mr-2" />
              実績
            </button>
          </div>
          
          {selectedTab === 'activities' ? (
            <div className="activities-panel bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">最近の活動</h2>
                
                {/* テスト用のアクティビティ追加ボタン */}
                <div className="test-buttons">
                  <select
                    className="p-2 border rounded text-sm"
                    id="activityType"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addMockActivity(e.target.value);
                        // 選択後にデフォルト値に戻す
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="" disabled>アクティビティを選択</option>
                    <option value="CREATE_CONTENT">コンテンツ作成</option>
                    <option value="PROVIDE_FEEDBACK">フィードバック提供</option>
                    <option value="CONSUME_CONTENT">コンテンツ閲覧</option>
                    <option value="SHARE_RESOURCE">リソース共有</option>
                    <option value="ASK_QUESTION">質問</option>
                    <option value="COMPLETE_QUIZ">クイズ完了</option>
                  </select>
                  <button
                    className="ml-2 bg-green-500 text-white px-3 py-2 rounded text-sm flex items-center"
                    onClick={() => {
                      alert('アクティビティを選択してください。選択するだけで追加されます。');
                    }}
                  >
                    <FaPlus className="mr-1" />
                    <span>テスト活動追加（選択するだけでOK）</span>
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-spinner flex justify-center p-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : activities.length > 0 ? (
                <ul className="activity-list divide-y">
                  {activities.map((activity) => (
                    <li key={activity.id} className="py-4">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">
                            {ACTIVITY_LABELS[activity.activityType] || activity.activityType}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            +{activity.points}ポイント
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(activity.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </div>
                      </div>
                      {activity.referenceId && (
                        <div className="text-xs text-gray-500 mt-1">
                          参照ID: {activity.referenceId}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-activities text-center py-10 text-gray-500">
                  <p>まだアクティビティがありません。</p>
                  <p className="mt-2 text-sm">クイズを受けたり、コンテンツを閲覧したりしてアクティビティを増やしましょう。</p>
                </div>
              )}
            </div>
          ) : (
            <div className="achievements-panel bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">実績</h2>
              <p className="text-gray-600 mb-4">獲得した実績や達成したマイルストーンがここに表示されます。</p>
              
              <div className="achievements-list grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`achievement-item p-4 border rounded-lg ${giverScore >= 10 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center mb-2">
                    <div className={`achievement-icon mr-3 text-xl ${giverScore >= 10 ? 'text-blue-500' : 'text-gray-400'}`}>
                      {giverScore >= 10 ? '🌟' : '⭐'}
                    </div>
                    <h3 className="font-medium">初めてのギバー</h3>
                  </div>
                  <p className="text-sm text-gray-600">ギバースコア10以上を獲得する</p>
                  <div className="progress mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${Math.min(100, (giverScore / 10) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {giverScore}/10
                  </div>
                </div>
                
                <div className={`achievement-item p-4 border rounded-lg ${activities.filter(a => a.activityType === 'CREATE_CONTENT').length >= 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center mb-2">
                    <div className={`achievement-icon mr-3 text-xl ${activities.filter(a => a.activityType === 'CREATE_CONTENT').length >= 1 ? 'text-green-500' : 'text-gray-400'}`}>
                      {activities.filter(a => a.activityType === 'CREATE_CONTENT').length >= 1 ? '📝' : '📄'}
                    </div>
                    <h3 className="font-medium">初めての投稿</h3>
                  </div>
                  <p className="text-sm text-gray-600">コンテンツを1つ以上作成する</p>
                  <div className="progress mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${Math.min(100, (activities.filter(a => a.activityType === 'CREATE_CONTENT').length / 1) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {activities.filter(a => a.activityType === 'CREATE_CONTENT').length}/1
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="sidebar">
          <GiverScoreDisplay score={getGiverScore()} />
          
          <TodoList />
          
          <div className="tips bg-white rounded-lg shadow-md p-5 mt-6">
            <h3 className="font-bold text-lg mb-3">スコアを伸ばすには？</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 教材コンテンツを作成する (+10)</li>
              <li>• 他のユーザーにフィードバックを提供する (+5)</li>
              <li>• 教材や有用なリソースを共有する (+3)</li>
              <li>• 質問を投稿する (+2)</li>
              <li>• 毎日学習コンテンツを閲覧する (+1)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileClient; 
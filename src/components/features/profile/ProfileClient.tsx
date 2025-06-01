'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ActivityType } from '@/types/activity';
import { GiverScoreDisplay } from '@/components/features/giver-score/GiverScoreDisplay';
import { FaHistory, FaTrophy, FaUser, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

// アクティビティタイプのラベル
const ACTIVITY_LABELS: Record<ActivityType, string> = {
  'CREATE_CONTENT': 'コンテンツ作成',
  'CONSUME_CONTENT': 'コンテンツ閲覧',
  'SHARE_RESOURCE': 'リソース共有',
  'ASK_QUESTION': '質問',
  'COMPLETE_QUIZ': 'クイズ完了',
  'PROVIDE_FEEDBACK': 'フィードバック提供'
};

const ProfileClient: React.FC = () => {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'activities' | 'achievements'>('activities');

  useEffect(() => {
    if (!user?.id) return;

    const fetchActivities = async () => {
      try {
        const supabase = getClient();
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        // データベースの型をActivityの型に変換
        const convertedActivities: Activity[] = data?.map(item => ({
          id: item.id,
          userId: item.user_id,
          activityType: item.activity_type as ActivityType,
          referenceId: item.reference_id || undefined,
          points: item.points,
          createdAt: item.created_at
        })) || [];

        setActivities(convertedActivities);
      } catch (error) {
        console.error('アクティビティの取得に失敗しました:', error);
        toast.error('アクティビティの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id]);

  // ローディング中の表示
  if (loading || profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // ユーザーが未認証の場合
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">プロフィールを表示するにはログインしてください。</p>
      </div>
    );
  }

  // プロフィールが取得できない場合
  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">プロフィールの読み込みに失敗しました。</p>
      </div>
    );
  }

  return (
    <div className="profile-page max-w-4xl mx-auto p-4 md:p-8">
      <div className="profile-header bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col md:flex-row items-center">
        <div className="avatar bg-blue-100 rounded-full h-24 w-24 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="プロフィール画像"
              width={96}
              height={96}
              className="rounded-full"
            />
          ) : (
            <FaUser className="text-blue-500 text-4xl" />
          )}
        </div>
        
        <div className="profile-info flex-1">
          <h1 className="text-2xl font-bold">{profile.display_name}さんのプロフィール</h1>
          <p className="text-gray-600 mb-2">{user.email}</p>
          {profile.bio && <p className="text-gray-700">{profile.bio}</p>}
        </div>
      </div>

      <div className="tabs flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            selectedTab === 'activities'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('activities')}
        >
          <FaHistory className="inline mr-2" />
          アクティビティ
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            selectedTab === 'achievements'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('achievements')}
        >
          <FaTrophy className="inline mr-2" />
          実績
        </button>
      </div>

      {selectedTab === 'activities' ? (
        <div className="activities space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="activity-item bg-white rounded-lg shadow-sm p-4 flex items-center"
              >
                <div className="activity-icon mr-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <FaPlus className="text-primary-600" />
                  </div>
                </div>
                <div className="activity-content flex-1">
                  <p className="font-medium text-gray-900">
                    {ACTIVITY_LABELS[activity.activityType]}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(activity.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </p>
                </div>
                <div className="activity-points text-right">
                  <span className="text-primary-600 font-medium">+{activity.points}</span>
                  <p className="text-xs text-gray-500">ポイント</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">まだアクティビティがありません</p>
            </div>
          )}
        </div>
      ) : (
        <div className="achievements bg-white rounded-lg shadow-sm p-6">
          <GiverScoreDisplay score={{
            level: Math.min(10, Math.floor((profile.giver_score || 0) / 10) + 1),
            points: profile.giver_score || 0,
            progress: ((profile.giver_score || 0) % 10) / 10 * 100,
            pointsToNextLevel: 10 - ((profile.giver_score || 0) % 10),
            personalityType: profile.personality_type || 'matcher'
          }} />
        </div>
      )}
    </div>
  );
};

export default ProfileClient; 
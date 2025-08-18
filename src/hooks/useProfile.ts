import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getProfile, upsertProfile, UserProfile } from '@/services/apiService';
import { PersonalityType } from '@/types/common';

export interface ProfileSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'daily' | 'weekly' | 'monthly';
  profile_visibility: 'public' | 'private' | 'friends';
  activity_visibility: 'public' | 'private' | 'friends';
  learning_history_visibility: 'public' | 'private' | 'friends';
  preferred_learning_time: string;
  daily_goal_minutes: number;
  preferred_content_type: ('text' | 'video' | 'audio' | 'interactive')[];
}

export interface UpdateProfileData {
  display_name: string;
  avatar_url?: string;
  bio?: string;
  personality_type?: PersonalityType;
  settings?: Partial<ProfileSettings>;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        const profileData = await getProfile(user.id);
        if (!profileData) {
          throw new Error('プロファイルが見つかりません');
        }
        setProfile(profileData);
        setError(null);
      } catch (err) {
        console.error('プロファイル取得エラー:', err);
        setError(err instanceof Error ? err : new Error('プロファイルの取得に失敗しました'));
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user?.id]);

  const updateProfile = async (data: UpdateProfileData | ProfileSettings) => {
    if (!user?.id) {
      throw new Error('ユーザーが認証されていません');
    }

    setIsLoading(true);
    setError(null);

    try {
      let updateData: UpdateProfileData;
      
      // ProfileSettingsの場合は、settingsフィールドとして包む
      if ('email_notifications' in data) {
        updateData = {
          display_name: profile?.display_name || '',
          settings: data as ProfileSettings
        };
      } else {
        updateData = data as UpdateProfileData;
      }

      await upsertProfile(user.id, updateData);
      const updatedProfile = await getProfile(user.id);
      if (!updatedProfile) {
        throw new Error('プロファイルの更新後の取得に失敗しました');
      }
      setProfile(updatedProfile);
      setError(null);
    } catch (err) {
      console.error('プロファイル更新エラー:', err);
      setError(err instanceof Error ? err : new Error('プロファイルの更新に失敗しました'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
} 
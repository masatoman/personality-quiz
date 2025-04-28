import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getProfile, upsertProfile, UserProfile } from '@/services/apiService';
import { PersonalityType } from '@/types/quiz';

interface UpdateProfileData {
  display_name: string;
  avatar_url?: string;
  bio?: string;
  personality_type?: PersonalityType;
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
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('プロファイルの取得に失敗しました'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user?.id]);

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user?.id) {
      throw new Error('ユーザーが認証されていません');
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await upsertProfile(user.id, data);
      if (!success) {
        throw new Error('プロファイルの更新に失敗しました');
      }

      const updatedProfile = await getProfile(user.id);
      setProfile(updatedProfile);
    } catch (err) {
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
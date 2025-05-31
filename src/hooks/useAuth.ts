import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getClient } from '@/lib/supabase/client';

export type User = {
  id: string;
  email: string;
  name?: string;
  profile?: {
    display_name: string;
    avatar_url?: string;
    bio?: string;
    personality_type?: string;
    giver_score?: number;
  };
};

const mapSupabaseUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'ユーザー',
});

type UseAuthReturn = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // プロフィール情報を取得する関数
  const fetchUserProfile = async (userId: string): Promise<User['profile'] | null> => {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, bio, personality_type, giver_score')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('プロフィール取得エラー:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('プロフィール取得例外:', err);
      return null;
    }
  };

  // ユーザー情報を更新する関数
  const updateUserWithProfile = async (supabaseUser: SupabaseUser) => {
    const baseUser = mapSupabaseUser(supabaseUser);
    const profile = await fetchUserProfile(supabaseUser.id);
    
    setUser({
      ...baseUser,
      profile: profile || undefined,
    });
  };

  // プロフィール情報を再取得する関数
  const refreshProfile = async () => {
    if (!user?.id) return;
    
    try {
      const profile = await fetchUserProfile(user.id);
      setUser(prev => prev ? { ...prev, profile: profile || undefined } : null);
    } catch (err) {
      console.error('プロフィール更新エラー:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // セッションの確認
    const checkSession = async () => {
      try {
        const supabase = getClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          if (session?.user) {
            await updateUserWithProfile(session.user);
          } else {
            setUser(null);
          }
          setError(null);
        }
      } catch (err) {
        console.error('セッション確認エラー:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('認証エラーが発生しました'));
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // 認証状態の変更を監視
    const supabase = getClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event, session?.user?.email);
      
      if (mounted) {
        if (session?.user) {
          await updateUserWithProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
        setError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        await updateUserWithProfile(data.user);
      }
    } catch (err) {
      const authError = err instanceof Error ? err : new Error('ログインに失敗しました');
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      const authError = err instanceof Error ? err : new Error('Googleログインに失敗しました');
      setError(authError);
      throw authError;
    }
  };

  const signInWithGithub = async () => {
    try {
      setError(null);
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      const authError = err instanceof Error ? err : new Error('GitHubログインに失敗しました');
      setError(authError);
      throw authError;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = getClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
    } catch (err) {
      const authError = err instanceof Error ? err : new Error('ログアウトに失敗しました');
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    refreshProfile
  };
}; 
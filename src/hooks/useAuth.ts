import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getClient } from '@/lib/supabase/client';

export type User = {
  id: string;
  email: string;
  name?: string;
};

const mapSupabaseUser = (user: SupabaseUser): User => ({
  id: user.id,
  email: user.email!,
  name: user.user_metadata?.name
});

export type UseAuthReturn = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // セッションの確認
    const checkSession = async () => {
      try {
        const supabase = getClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('セッション確認エラー:', err);
        setError(err instanceof Error ? err : new Error('認証エラーが発生しました'));
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // 認証状態の変更を監視
    const supabase = getClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const supabase = getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('ログインに失敗しました'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Googleログインに失敗しました'));
      throw err;
    }
  };

  const signInWithGithub = async () => {
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('GitHubログインに失敗しました'));
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const supabase = getClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('ログアウトに失敗しました'));
      throw err;
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
    signOut
  };
}; 
import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';

export type AuthUser = User | null;

export interface UseAuthReturn {
  user: AuthUser;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string) => Promise<{
    user: AuthUser;
    error: AuthError | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    user: AuthUser;
    error: AuthError | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: AuthError | null;
  }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    // 現在のセッションとユーザーを取得
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(session);
        setUser(session?.user ?? null);

        // 認証状態の変更を監視
        const { data: listener } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );
        
        authListener = listener;
        setLoading(false);
      } catch (error) {
        setError(error as AuthError);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      // クリーンアップ関数
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // ユーザー登録
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // ログイン
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      setError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  // パスワードリセット
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
} 
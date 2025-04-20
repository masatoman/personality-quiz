import { AuthError, Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { ExtendedSession } from '@/lib/auth';

export interface UseAuthResult {
  user: ExtendedSession['user'] | null;
  session: ExtendedSession | null;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google') => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<ExtendedSession['user'] | null>(null);
  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        setIsLoading(true);
        try {
          if (session) {
            // ExtendedSessionの取得処理
            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single();

            const extendedSession: ExtendedSession = {
              ...session,
              user: {
                ...session.user,
                role: userData?.role
              }
            };
            setSession(extendedSession);
            setUser(extendedSession.user);
          } else {
            setSession(null);
            setUser(null);
          }
        } catch (err) {
          console.error('認証状態の更新エラー:', err);
          setError(err as AuthError);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      console.error('サインインエラー:', err);
      setError(err as AuthError);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('サインアウトエラー:', err);
      setError(err as AuthError);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider: 'google') => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) throw error;
    } catch (err) {
      console.error('OAuthサインインエラー:', err);
      setError(err as AuthError);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    isLoading,
    error,
    signIn,
    signOut,
    signInWithOAuth,
  };
} 
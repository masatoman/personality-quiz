import { supabase } from '@/lib/supabase/client';
import { AuthError, Session } from '@supabase/supabase-js';

export interface SessionResponse {
  success: boolean;
  error?: string;
  session?: Session | null;
}

export async function getSession(): Promise<SessionResponse> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      session: data.session,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : 'セッション取得エラーが発生しました',
    };
  }
}

export async function refreshSession(): Promise<SessionResponse> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      session: data.session,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : 'セッション更新エラーが発生しました',
    };
  }
}

export async function signOut(): Promise<SessionResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      session: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : 'ログアウトエラーが発生しました',
    };
  }
}

export function onAuthStateChange(
  callback: (session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}

export async function setSessionData(
  key: string,
  value: any
): Promise<SessionResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { [key]: value },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : 'セッションデータ更新エラーが発生しました',
    };
  }
}

export async function getSessionData(key: string): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.user_metadata?.[key];
} 
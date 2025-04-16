import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * 環境変数の存在チェック
 * @throws {EnvironmentError} 環境変数が設定されていない場合
 */
function validateEnvironmentVariables(): { supabaseUrl: string; supabaseAnonKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new EnvironmentError('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!supabaseAnonKey) {
    throw new EnvironmentError('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Cookieを使ったセッション付きのSupabaseクライアントを作成
 * @returns Supabaseクライアント
 * @throws {EnvironmentError} 必要な環境変数が設定されていない場合
 */
export function createClient() {
  const cookieStore = cookies();
  const { supabaseUrl, supabaseAnonKey } = validateEnvironmentVariables();
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // エラーをキャッチして適切に処理
            console.error('Cookieの設定に失敗しました:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // エラーをキャッチして適切に処理
            console.error('Cookieの削除に失敗しました:', error);
          }
        },
      },
    }
  );
}

/**
 * 現在のセッションを取得
 */
export const getSession = async () => {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Session error:', error.message);
    return null;
  }
  
  return session;
};

/**
 * ログインしているユーザーIDを取得
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.user?.id || null;
};

/**
 * ユーザーがログインしているか確認
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const userId = await getCurrentUserId();
  return !!userId;
}; 
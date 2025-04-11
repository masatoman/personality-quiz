import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase';

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Cookieを使ったセッション付きのSupabaseクライアントを作成
 * @returns Supabaseクライアント
 */
export const createServerClient = () => {
  const cookieStore = cookies();
  
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
};

/**
 * 現在のセッションを取得
 */
export const getSession = async () => {
  const supabase = createServerClient();
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
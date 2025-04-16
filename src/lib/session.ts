import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Cookieを使ったセッション付きのSupabaseクライアントを作成
 * @returns Supabaseクライアント
 */
export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
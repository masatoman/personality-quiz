import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// 環境変数からSupabaseの設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabaseの環境変数が設定されていません');
}

// クライアントサイドでSupabaseクライアントを作成する関数
export const createBrowserClient = () => {
  return createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  });
};

// シングルトンパターンでクライアントを提供
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getClient() {
  if (!client) {
    client = createBrowserClient();
  }
  return client;
}

// 互換性のためのエイリアス
export const createClient = getClient;

// デフォルトエクスポートとしてシングルトンインスタンスを提供
export const supabase = getClient(); 
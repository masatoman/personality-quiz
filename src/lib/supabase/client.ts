import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabaseの環境変数が設定されていません');
}

// クライアントサイドでSupabaseクライアントを作成する関数
export const createClient = () => {
  return createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

// シングルトンパターンでクライアントを提供
let client: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!client) {
    client = createClient();
  }
  return client;
} 
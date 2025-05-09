import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabaseの環境変数が設定されていません');
}

// サーバーサイドでSupabaseクライアントを作成する関数
export const createClient = () => {
  return createSupabaseClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-client-info': '@supabase/auth-helpers-nextjs',
        },
      },
    }
  );
}; 
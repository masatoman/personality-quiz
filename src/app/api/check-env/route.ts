import { NextResponse } from 'next/server';

export async function GET() {
  // 環境変数の情報のみを返す（Supabaseへの接続は行わない）
  const envInfo = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || '未設定',
    anon_key_exists: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定',
    anon_key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 0,
    node_env: process.env.NODE_ENV
  };

  return NextResponse.json(envInfo);
} 
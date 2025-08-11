import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 1. テーブル構造の確認
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'materials')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('カラム情報取得エラー:', columnsError);
    }

    // 2. 簡易的な接続テスト
    const { data: testConnection, error: connectionError } = await supabase
      .from('materials')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('接続テストエラー:', connectionError);
    }

    // 3. 教材データの確認（管理者権限で）
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('id, title, is_published, author_id, created_at')
      .limit(5);

    if (materialsError) {
      console.error('教材データ取得エラー:', materialsError);
    }

    // 4. 認証状態の確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('ユーザー確認エラー:', userError);
    }

    return NextResponse.json({
      success: true,
      debug: {
        columns: columns || [],
        testConnection: testConnection || null,
        materials: materials || [],
        user: user ? { id: user.id, email: user.email } : null,
        errors: {
          columns: columnsError?.message,
          connection: connectionError?.message,
          materials: materialsError?.message,
          user: userError?.message,
        }
      }
    });

  } catch (error) {
    console.error('デバッグAPI実行エラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 });
  }
} 
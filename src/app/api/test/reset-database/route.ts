import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 注意: このAPIエンドポイントは開発環境とテスト環境でのみ使用可能
export async function POST() {
  // 本番環境では無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    // Supabaseクライアントの初期化
    const supabase = createClient();

    // テスト用テーブルのクリア
    const tables = [
      'user_profiles_test',
      'materials_test',
      'feedback_test',
      'quiz_results_test',
      'user_activities_test',
      'badges_test',
      'rewards_test'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().gt('id', 0);
      if (error) {
        console.error(`Error clearing table ${table}:`, error);
      }
    }

    // テスト用シードデータの投入
    // 必要に応じてテスト用のシードデータを挿入

    return NextResponse.json({ success: true, message: 'Test database reset successfully' });
  } catch (error) {
    console.error('Failed to reset test database:', error);
    return NextResponse.json(
      { error: 'Failed to reset test database' },
      { status: 500 }
    );
  }
} 
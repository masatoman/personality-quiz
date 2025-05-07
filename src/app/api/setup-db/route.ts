import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// このAPIルートはNode.jsランタイムで実行されることを明示的に指定
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // 常に動的に実行

export async function GET(request: NextRequest) {
  try {
    // 認証キーの確認（本番環境では適切な認証方法に変更）
    const { searchParams } = new URL(request.url);
    const authKey = searchParams.get('key');
    
    if (authKey !== process.env.SETUP_DB_KEY) {
      return NextResponse.json(
        { error: '認証エラー' },
        { status: 401 }
      );
    }

    // quiz_resultsテーブルの作成
    await query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        dominant_type VARCHAR(10) NOT NULL,
        giver_score INTEGER NOT NULL,
        taker_score INTEGER NOT NULL,
        matcher_score INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // インデックスの作成
    await query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results (user_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_results_dominant_type ON quiz_results (dominant_type);
      CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results (created_at);
    `);

    // ユーザーアクティビティテーブルの作成（将来的な拡張用）
    await query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        activity_type VARCHAR(20) NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return NextResponse.json({
      success: true,
      message: 'データベーステーブルの作成が完了しました'
    });
  } catch (error) {
    console.error('データベーステーブル作成エラー:', error);
    return NextResponse.json(
      { error: 'データベーステーブルの作成に失敗しました', details: String(error) },
      { status: 500 }
    );
  }
} 
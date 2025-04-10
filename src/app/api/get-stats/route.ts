import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db';

// このAPIルートはNode.jsランタイムで実行されることを明示的に指定
export const runtime = 'nodejs';
// auto（デフォルト）に設定してNext.jsに判断を委ねる
export const dynamic = 'auto';

export async function GET() {
  try {
    console.log('APIリクエストを受信しました: get-stats');
    // ローカルデータベースから統計情報を取得
    const statsData = getStats();
    
    console.log('取得した統計データ:', statsData);
    return NextResponse.json(statsData);
  } catch (error) {
    console.error('統計の取得中にエラーが発生:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 注意: このAPIエンドポイントは開発環境とテスト環境でのみ使用可能
export async function POST(request: Request) {
  // 本番環境では無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Supabaseクライアントの初期化
    const supabase = createClient();

    // ユーザープロフィールテーブルのデータをリセット
    const { error } = await supabase
      .from('user_profiles_test')
      .update({
        giver_score: 0,
        taker_score: 0,
        matcher_score: 0,
        dominant_type: 'giver',
        level: 1,
        points: 0
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error resetting giver score:', error);
      return NextResponse.json(
        { error: 'Failed to reset giver score' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Giver score reset successfully' });
  } catch (error) {
    console.error('Failed to reset giver score:', error);
    return NextResponse.json(
      { error: 'Failed to reset giver score' },
      { status: 500 }
    );
  }
} 
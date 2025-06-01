import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 難易度レベル取得 (GET /api/difficulties)
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 基本的な難易度レベル一覧を取得
    const { data: difficulties, error } = await supabase
      .from('difficulty_levels')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      difficulties: difficulties || []
    });

  } catch (error) {
    console.error('Difficulties fetch error:', error);
    return NextResponse.json(
      { error: '難易度レベルの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
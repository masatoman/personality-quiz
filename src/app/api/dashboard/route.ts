import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/supabase/dashboard';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const data = await getDashboardData(supabase, userId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('ダッシュボードデータの取得に失敗:', error);
    return NextResponse.json(
      { error: 'ダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    );
  }
} 
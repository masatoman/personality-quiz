import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getSession } from '@/lib/session';

/**
 * ポイント残高を取得するAPI
 * 
 * @returns レスポンス
 */
export async function GET() {
  try {
    // セッションからユーザーIDを取得
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // ポイント残高を取得
    const { data, error } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('ポイント残高取得エラー:', error);
      return NextResponse.json({ error: 'ポイントの取得に失敗しました' }, { status: 500 });
    }
    
    return NextResponse.json({
      points: data?.points || 0
    });
  } catch (error) {
    console.error('ポイント残高API例外:', error);
    return NextResponse.json({ error: '予期せぬエラーが発生しました' }, { status: 500 });
  }
} 
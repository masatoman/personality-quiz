import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/services/supabaseClient';
import { getSession } from '@/lib/session';

/**
 * ポイント履歴を取得するAPI
 * 
 * @param req リクエスト
 * @returns レスポンス
 */
export async function GET(req: NextRequest) {
  try {
    // セッションからユーザーIDを取得
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // URLパラメータから取得
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const actionType = searchParams.get('actionType');
    
    // ポイント履歴を取得するクエリを作成
    let query = supabase
      .from('points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    // アクションタイプでフィルタリング（指定されている場合）
    if (actionType) {
      query = query.eq('action_type', actionType);
    }
    
    // クエリの実行
    const { data, error } = await query;
    
    if (error) {
      console.error('ポイント履歴取得エラー:', error);
      return NextResponse.json({ error: 'ポイント履歴の取得に失敗しました' }, { status: 500 });
    }
    
    // 合計ポイントを取得
    const { data: totalPoints, error: totalError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();
      
    if (totalError) {
      console.error('合計ポイント取得エラー:', totalError);
      return NextResponse.json({ error: '合計ポイントの取得に失敗しました' }, { status: 500 });
    }
    
    // 総履歴数を取得
    let countQuery = supabase
      .from('points_history')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
      
    // アクションタイプでフィルタリング（指定されている場合）
    if (actionType) {
      countQuery = countQuery.eq('action_type', actionType);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('履歴数取得エラー:', countError);
      return NextResponse.json({ error: '履歴数の取得に失敗しました' }, { status: 500 });
    }
    
    return NextResponse.json({
      points: data,
      totalPoints: totalPoints?.points || 0,
      count: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('ポイント履歴API例外:', error);
    return NextResponse.json({ error: '予期せぬエラーが発生しました' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * ポイント履歴を取得するAPI
 * 
 * @param request リクエスト
 * @returns レスポンス
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    // クエリパラメータ
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'earned' | 'consumed'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const offset = (page - 1) * limit;
    
    // ベースクエリ
    let query = supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // フィルタリング
    if (type) {
      query = query.eq('transaction_type', type);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // ページング
    query = query.range(offset, offset + limit - 1);
    
    const { data: transactions, error } = await query;
    
    if (error) {
      console.error('ポイント履歴取得エラー:', error);
      return NextResponse.json(
        { error: 'ポイント履歴の取得に失敗しました' },
        { status: 500 }
      );
    }
    
    // 統計情報も取得
    const { data: stats } = await supabase
      .from('point_transactions')
      .select('transaction_type, points')
      .eq('user_id', user.id);
    
    const statistics = {
      totalEarned: stats?.filter(s => s.transaction_type === 'earned')
                        .reduce((sum, s) => sum + s.points, 0) || 0,
      totalConsumed: stats?.filter(s => s.transaction_type === 'consumed')
                          .reduce((sum, s) => sum + s.points, 0) || 0,
      transactionCount: stats?.length || 0,
    };
    
    return NextResponse.json({
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        hasMore: transactions?.length === limit,
      },
      statistics,
    });
  } catch (error) {
    console.error('ポイント履歴API例外:', error);
    return NextResponse.json(
      { error: 'ポイント履歴取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * ポイント消費API (強化版)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // リクエストボディからデータ取得
    const { 
      points, 
      actionType, 
      referenceId, 
      referenceType, 
      description 
    } = await req.json();
    
    // バリデーション
    if (!points || !actionType) {
      return NextResponse.json(
        { error: 'points と actionType は必須です' }, 
        { status: 400 }
      );
    }
    
    if (typeof points !== 'number' || points <= 0) {
      return NextResponse.json(
        { error: 'points は正の数値である必要があります' }, 
        { status: 400 }
      );
    }
    
    // 現在のポイント残高を取得
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', user.id)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('ポイント取得エラー:', fetchError);
      return NextResponse.json(
        { error: 'ポイント情報の取得に失敗しました' }, 
        { status: 500 }
      );
    }
    
    const userPoints = currentPoints?.total_points || 0;
    
    // ポイント不足チェック
    if (userPoints < points) {
      return NextResponse.json(
        { 
          error: 'ポイントが不足しています', 
          currentPoints: userPoints,
          requiredPoints: points,
          shortage: points - userPoints
        }, 
        { status: 400 }
      );
    }
    
    const newTotal = userPoints - points;
    
    // ポイント消費処理
    const { error: updateError } = await supabase
      .from('user_points')
      .upsert({
        user_id: user.id,
        total_points: newTotal,
        last_spent_at: new Date().toISOString(),
      });
    
    if (updateError) {
      console.error('ポイント更新エラー:', updateError);
      return NextResponse.json(
        { error: 'ポイントの消費に失敗しました' }, 
        { status: 500 }
      );
    }
    
    // 活動履歴記録
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: `points_consumed_${actionType}`,
        activity_data: {
          actionType,
          referenceId,
          referenceType,
          pointsConsumed: points,
        },
        points_earned: -points, // 負の値でポイント消費を記録
      });
    
    // ポイント取引履歴記録
    await supabase
      .from('point_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'consumed',
        points: points,
        activity_type: actionType,
        reference_id: referenceId,
        reference_type: referenceType,
        description: description || `${actionType}でポイント消費`,
        previous_balance: userPoints,
        new_balance: newTotal,
      });
    
    return NextResponse.json({
      success: true,
      consumedPoints: points,
      remainingPoints: newTotal,
      previousPoints: userPoints,
      actionType,
      message: `${points}ポイント消費しました`,
    });
  } catch (error) {
    console.error('ポイント消費API例外:', error);
    return NextResponse.json(
      { error: '予期せぬエラーが発生しました' }, 
      { status: 500 }
    );
  }
} 
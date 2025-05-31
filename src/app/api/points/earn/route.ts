import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ポイント獲得処理
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    const { activityType, activityData, points, description } = await request.json();
    
    if (!activityType || !points || points <= 0) {
      return NextResponse.json(
        { error: 'アクティビティタイプとポイント数が必要です' },
        { status: 400 }
      );
    }
    
    // トランザクション開始
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('現在のポイント取得エラー:', fetchError);
      return NextResponse.json(
        { error: 'ポイント情報の取得に失敗しました' },
        { status: 500 }
      );
    }
    
    const previousPoints = currentPoints?.total_points || 0;
    const newTotal = previousPoints + points;
    
    // ポイント更新
    const { error: updateError } = await supabase
      .from('user_points')
      .upsert({
        user_id: user.id,
        total_points: newTotal,
        last_earned_at: new Date().toISOString(),
      });
    
    if (updateError) {
      console.error('ポイント更新エラー:', updateError);
      return NextResponse.json(
        { error: 'ポイントの更新に失敗しました' },
        { status: 500 }
      );
    }
    
    // 活動履歴記録
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData || {},
        points_earned: points,
      });
    
    // ポイント履歴記録
    await supabase
      .from('point_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'earned',
        points: points,
        activity_type: activityType,
        description: description || `${activityType}でポイント獲得`,
        previous_balance: previousPoints,
        new_balance: newTotal,
      });
    
    return NextResponse.json({
      success: true,
      pointsEarned: points,
      totalPoints: newTotal,
      previousPoints,
      message: `${points}ポイント獲得しました！`,
    });
  } catch (error) {
    console.error('ポイント獲得エラー:', error);
    return NextResponse.json(
      { error: 'ポイント獲得処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
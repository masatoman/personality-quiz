import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ギバー行動の種類とポイント
const GIVER_ACTIONS = {
  material_created: { base: 50, multiplier: 1.0, description: '教材作成' },
  material_shared: { base: 20, multiplier: 1.5, description: '教材共有' },
  quiz_helped: { base: 30, multiplier: 2.0, description: 'クイズ解説' },
  comment_helpful: { base: 15, multiplier: 1.2, description: '有用コメント' },
  teaching_activity: { base: 40, multiplier: 1.8, description: '教える活動' },
  knowledge_sharing: { base: 25, multiplier: 1.3, description: '知識共有' },
  community_contribution: { base: 35, multiplier: 1.6, description: 'コミュニティ貢献' },
};

// ギバースコア計算
function calculateGiverScore(activityType: string, impact: number = 1): number {
  const action = GIVER_ACTIONS[activityType as keyof typeof GIVER_ACTIONS];
  if (!action) return 0;
  
  return Math.round(action.base * action.multiplier * impact);
}

// ギバー行動報酬処理
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
    
    const { 
      activityType, 
      targetUserId, 
      materialId, 
      impact = 1,
      additionalData = {}
    } = await request.json();
    
    if (!activityType || !GIVER_ACTIONS[activityType as keyof typeof GIVER_ACTIONS]) {
      return NextResponse.json(
        { error: '有効なギバー行動タイプが必要です' },
        { status: 400 }
      );
    }
    
    // ギバースコア計算
    const points = calculateGiverScore(activityType, impact);
    const actionInfo = GIVER_ACTIONS[activityType as keyof typeof GIVER_ACTIONS];
    
    // 現在のポイント残高を取得
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('total_points, giver_score')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('ポイント取得エラー:', fetchError);
      return NextResponse.json(
        { error: 'ポイント情報の取得に失敗しました' },
        { status: 500 }
      );
    }
    
    const previousPoints = currentPoints?.total_points || 0;
    const previousGiverScore = currentPoints?.giver_score || 0;
    const newTotal = previousPoints + points;
    const newGiverScore = previousGiverScore + points;
    
    // ポイント更新（ギバースコアも含む）
    const { error: updateError } = await supabase
      .from('user_points')
      .upsert({
        user_id: user.id,
        total_points: newTotal,
        giver_score: newGiverScore,
        last_earned_at: new Date().toISOString(),
      });
    
    if (updateError) {
      console.error('ポイント更新エラー:', updateError);
      return NextResponse.json(
        { error: 'ポイントの更新に失敗しました' },
        { status: 500 }
      );
    }
    
    // ギバー活動履歴記録
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: `giver_${activityType}`,
        activity_data: {
          ...additionalData,
          targetUserId,
          materialId,
          impact,
          giverScoreEarned: points,
        },
        points_earned: points,
      });
    
    // ポイント取引履歴記録
    await supabase
      .from('point_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'earned',
        points: points,
        activity_type: `giver_${activityType}`,
        description: `${actionInfo.description}によるギバー報酬`,
        previous_balance: previousPoints,
        new_balance: newTotal,
      });
    
    return NextResponse.json({
      success: true,
      giverReward: {
        activityType,
        actionDescription: actionInfo.description,
        pointsEarned: points,
        impact,
        totalPoints: newTotal,
        giverScore: newGiverScore,
        previousGiverScore,
        giverScoreIncrease: points,
      },
      message: `${actionInfo.description}で${points}ポイント獲得！ギバー精神が評価されました✨`,
    });
  } catch (error) {
    console.error('ギバー報酬エラー:', error);
    return NextResponse.json(
      { error: 'ギバー報酬処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ギバー行動統計取得
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
    
    const period = searchParams.get('period') || 'week'; // week, month, all
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    // ギバー活動統計を取得
    let query = supabase
      .from('user_activities')
      .select('activity_type, points_earned, created_at')
      .eq('user_id', user.id)
      .like('activity_type', 'giver_%');
    
    if (dateFilter) {
      query = query.gte('created_at', dateFilter);
    }
    
    const { data: activities, error } = await query;
    
    if (error) {
      console.error('ギバー統計取得エラー:', error);
      return NextResponse.json(
        { error: 'ギバー統計の取得に失敗しました' },
        { status: 500 }
      );
    }
    
    // 統計集計
    const stats = {
      totalActivities: activities?.length || 0,
      totalGiverPoints: activities?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0,
      activityBreakdown: {} as Record<string, number>,
      recentActivity: activities?.slice(-5) || [],
    };
    
    // 活動タイプ別集計
    activities?.forEach(activity => {
      const type = activity.activity_type.replace('giver_', '');
      stats.activityBreakdown[type] = (stats.activityBreakdown[type] || 0) + 1;
    });
    
    return NextResponse.json({
      period,
      statistics: stats,
      availableActions: Object.keys(GIVER_ACTIONS).map(key => ({
        type: key,
        ...GIVER_ACTIONS[key as keyof typeof GIVER_ACTIONS],
      })),
    });
  } catch (error) {
    console.error('ギバー統計API例外:', error);
    return NextResponse.json(
      { error: 'ギバー統計取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
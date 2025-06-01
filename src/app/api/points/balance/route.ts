import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * ポイント残高と詳細統計を取得するAPI (強化版)
 */
export async function GET() {
  try {
    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // 基本ポイント情報取得
    const { data: pointsData, error: pointsError } = await supabase
      .from('user_points')
      .select('total_points, giver_score, last_earned_at, last_spent_at')
      .eq('user_id', user.id)
      .single();
      
    if (pointsError && pointsError.code !== 'PGRST116') {
      console.error('ポイント残高取得エラー:', pointsError);
      return NextResponse.json({ error: 'ポイントの取得に失敗しました' }, { status: 500 });
    }
    
    // 統計情報取得
    const { data: stats, error: statsError } = await supabase
      .from('point_transactions')
      .select('transaction_type, points, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (statsError) {
      console.error('統計取得エラー:', statsError);
    }
    
    // 統計計算
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const earnedStats = stats?.filter(s => s.transaction_type === 'earned') || [];
    const consumedStats = stats?.filter(s => s.transaction_type === 'consumed') || [];
    
    const weeklyEarned = earnedStats
      .filter(s => new Date(s.created_at) >= weekAgo)
      .reduce((sum, s) => sum + s.points, 0);
    
    const monthlyEarned = earnedStats
      .filter(s => new Date(s.created_at) >= monthAgo)
      .reduce((sum, s) => sum + s.points, 0);
    
    const weeklySpent = consumedStats
      .filter(s => new Date(s.created_at) >= weekAgo)
      .reduce((sum, s) => sum + s.points, 0);
    
    const monthlySpent = consumedStats
      .filter(s => new Date(s.created_at) >= monthAgo)
      .reduce((sum, s) => sum + s.points, 0);
    
    // ギバーランキングでの順位取得
    const { data: giverRank } = await supabase
      .rpc('get_user_giver_rank', { target_user_id: user.id });
    
    const response = {
      points: pointsData?.total_points || 0,
      giverScore: pointsData?.giver_score || 0,
      lastEarnedAt: pointsData?.last_earned_at,
      lastSpentAt: pointsData?.last_spent_at,
      statistics: {
        lifetime: {
          totalEarned: earnedStats.reduce((sum, s) => sum + s.points, 0),
          totalSpent: consumedStats.reduce((sum, s) => sum + s.points, 0),
          transactionCount: stats?.length || 0,
        },
        weekly: {
          earned: weeklyEarned,
          spent: weeklySpent,
          netGain: weeklyEarned - weeklySpent,
        },
        monthly: {
          earned: monthlyEarned,
          spent: monthlySpent,
          netGain: monthlyEarned - monthlySpent,
        },
      },
      rankings: {
        giverRank: giverRank || null,
      },
      recentTransactions: stats?.slice(0, 5).map(s => ({
        type: s.transaction_type,
        points: s.points,
        createdAt: s.created_at,
      })) || [],
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('ポイント残高API例外:', error);
    return NextResponse.json({ error: '予期せぬエラーが発生しました' }, { status: 500 });
  }
} 
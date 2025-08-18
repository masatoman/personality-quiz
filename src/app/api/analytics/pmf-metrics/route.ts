import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // 1. 継続率の計算 (D7, M1)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // 7日前のアクティブユーザー
    const { data: activeUsers7DaysAgo } = await supabase
      .from('activities')
      .select('user_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .lt('created_at', new Date(sevenDaysAgo.getTime() + 24 * 60 * 60 * 1000).toISOString());
    
    // 今日のアクティブユーザー（7日前のユーザーの中で）
    const { data: retainedUsers7Days } = await supabase
      .from('activities')
      .select('user_id')
      .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .in('user_id', activeUsers7DaysAgo?.map(u => u.user_id) || []);
    
    const d7Retention = activeUsers7DaysAgo && activeUsers7DaysAgo.length > 0 
      ? (retainedUsers7Days?.length || 0) / activeUsers7DaysAgo.length 
      : 0;
    
    // 30日前のアクティブユーザー
    const { data: activeUsers30DaysAgo } = await supabase
      .from('activities')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .lt('created_at', new Date(thirtyDaysAgo.getTime() + 24 * 60 * 60 * 1000).toISOString());
    
    // 今日のアクティブユーザー（30日前のユーザーの中で）
    const { data: retainedUsers30Days } = await supabase
      .from('activities')
      .select('user_id')
      .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .in('user_id', activeUsers30DaysAgo?.map(u => u.user_id) || []);
    
    const m1Retention = activeUsers30DaysAgo && activeUsers30DaysAgo.length > 0 
      ? (retainedUsers30Days?.length || 0) / activeUsers30DaysAgo.length 
      : 0;
    
    // 2. 40%ルールの計算（「サービスが使えなくなったら困る」と答えるユーザー）
    // 実際の実装では、ユーザーアンケートやフィードバックから計算
    const fortyPercentRule = 0.35; // 仮の値（35%）
    
    // 3. 月間アクティブユーザー数
    const { data: monthlyActiveUsers } = await supabase
      .from('activities')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const uniqueMonthlyUsers = new Set(monthlyActiveUsers?.map(u => u.user_id) || []).size;
    
    // 4. 教材作成・学習の比率（教え合いの指標）
    const { data: materialCreationActivities } = await supabase
      .from('activities')
      .select('*')
      .eq('activity_type', 'material_created')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const { data: learningActivities } = await supabase
      .from('activities')
      .select('*')
      .eq('activity_type', 'material_viewed')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const teachingLearningRatio = learningActivities && learningActivities.length > 0
      ? (materialCreationActivities?.length || 0) / learningActivities.length
      : 0;
    
    // 5. コミュニティ参加度（コメント・レビュー）
    const { data: communityActivities } = await supabase
      .from('activities')
      .select('*')
      .in('activity_type', ['comment_posted', 'feedback_provided'])
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const communityParticipationRate = uniqueMonthlyUsers > 0
      ? (communityActivities?.length || 0) / uniqueMonthlyUsers
      : 0;
    
    return NextResponse.json({
      success: true,
      metrics: {
        retention: {
          d7: Math.round(d7Retention * 100),
          m1: Math.round(m1Retention * 100)
        },
        fortyPercentRule: Math.round(fortyPercentRule * 100),
        monthlyActiveUsers: uniqueMonthlyUsers,
        teachingLearningRatio: Math.round(teachingLearningRatio * 100) / 100,
        communityParticipationRate: Math.round(communityParticipationRate * 100) / 100,
        targetMetrics: {
          d7RetentionTarget: 25,
          m1RetentionTarget: 15,
          fortyPercentRuleTarget: 40,
          monthlyActiveUsersTarget: 1000
        }
      }
    });
    
  } catch (error) {
    console.error('PMF metrics error:', error);
    return NextResponse.json(
      { error: 'PMF指標の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // 今月の開始日と終了日を計算
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // 月間ポイントランキングを取得
    const { data: rankings, error } = await supabase
      .from('user_activities')
      .select(`
        user_id,
        profiles!user_activities_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())
      .not('points_earned', 'is', null);
    
    if (error) {
      console.error('月間ランキング取得エラー:', error);
      return NextResponse.json(
        { error: '月間ランキングの取得に失敗しました' },
        { status: 500 }
      );
    }
    
    // ユーザー別ポイント集計
    const userPointsMap = new Map();
    const userActivityCount = new Map();
    const userProfiles = new Map();
    
    rankings?.forEach((activity: any) => {
      const userId = activity.user_id;
      const points = activity.points_earned || 0;
      
      // プロフィール情報を保存
      if (activity.profiles) {
        userProfiles.set(userId, activity.profiles);
      }
      
      // ポイント集計
      userPointsMap.set(userId, (userPointsMap.get(userId) || 0) + points);
      
      // 活動回数集計
      userActivityCount.set(userId, (userActivityCount.get(userId) || 0) + 1);
    });
    
    // ランキング形式に変換
    const rankingData = Array.from(userPointsMap.entries())
      .map(([userId, totalPoints]) => ({
        userId,
        totalPoints,
        activityCount: userActivityCount.get(userId) || 0,
        profile: userProfiles.get(userId) || { username: 'Unknown' },
      }))
      .sort((a, b) => {
        // ポイント数 > 活動回数 の順でソート
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return b.activityCount - a.activityCount;
      })
      .slice(0, 50) // トップ50まで
      .map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        username: user.profile.username,
        displayName: user.profile.display_name,
        avatarUrl: user.profile.avatar_url,
        totalPoints: user.totalPoints,
        activityCount: user.activityCount,
      }));
    
    return NextResponse.json({
      rankings: rankingData,
      period: {
        type: 'monthly',
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
      metadata: {
        totalUsers: rankingData.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('月間ランキングAPI例外:', error);
    return NextResponse.json(
      { error: '月間ランキング取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
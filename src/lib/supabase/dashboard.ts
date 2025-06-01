import { DashboardData } from '@/types/dashboard';

interface Activity {
  activity_type: string;
  points_earned: number;
  created_at: string;
}

export async function getDashboardData(supabase: any, userId: string): Promise<{
  data: DashboardData | null;
  error: Error | null;
}> {
  try {
    // ユーザーの活動履歴から統計を集計
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('activity_type, points_earned, created_at')
      .eq('user_id', userId);

    let activitiesData: Activity[] = [];
    if (activitiesError) {
      console.error('活動履歴取得エラー:', activitiesError);
      // 活動履歴が空の場合もエラーとしない
      activitiesData = [];
    } else {
      activitiesData = activities || [];
    }

    // 活動統計を計算
    const createdMaterials = activitiesData.filter((a: Activity) => a.activity_type === 'material_created').length;
    const viewedMaterials = activitiesData.filter((a: Activity) => a.activity_type === 'material_viewed').length;

    // ユーザーポイントを取得
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();

    const totalPoints = pointsData?.points || 0;

    // モックデータでギバースコア履歴を生成（後でuser_giver_scoresテーブルから取得）
    const mockScoreData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score: Math.floor(Math.random() * 40) + 60, // 60-100のランダムスコア
    }));

    // モックデータで活動分布を生成
    const mockDistributionData = [
      { type: '教材作成', percentage: 40 },
      { type: 'クイズ完了', percentage: 30 },
      { type: '教材閲覧', percentage: 30 },
    ];

    return {
      data: {
        summary: {
          createdMaterials,
          earnedPoints: totalPoints,
          viewedMaterials,
        },
        giverScores: mockScoreData,
        activityDistribution: mockDistributionData,
        activities: activitiesData.map((a: Activity) => ({
          id: `activity-${Date.now()}-${Math.random()}`,
          type: a.activity_type,
          timestamp: a.created_at,
          details: {
            points: a.points_earned,
            activity_type: a.activity_type,
          },
        })),
      },
      error: null,
    };
  } catch (error) {
    console.error('ダッシュボードデータの取得に失敗:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('データの取得に失敗しました'),
    };
  }
} 
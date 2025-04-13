import { createClient } from '@supabase/supabase-js';
import { DashboardData } from '@/types/dashboard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getDashboardData(userId: string): Promise<{
  data: DashboardData | null;
  error: Error | null;
}> {
  try {
    // ユーザーの活動サマリーを取得
    const { data: summaryData, error: summaryError } = await supabase
      .from('user_activities')
      .select('created_materials_count, earned_points, viewed_materials_count')
      .eq('user_id', userId)
      .single();

    if (summaryError) throw summaryError;

    // ギバースコア履歴を取得
    const { data: scoreData, error: scoreError } = await supabase
      .from('giver_scores')
      .select('date, score')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .limit(7);

    if (scoreError) throw scoreError;

    // 活動分布を取得
    const { data: distributionData, error: distributionError } = await supabase
      .from('activity_distribution')
      .select('type, percentage')
      .eq('user_id', userId);

    if (distributionError) throw distributionError;

    return {
      data: {
        summary: {
          createdMaterials: summaryData.created_materials_count,
          earnedPoints: summaryData.earned_points,
          viewedMaterials: summaryData.viewed_materials_count,
        },
        giverScores: scoreData.map(score => ({
          date: score.date,
          score: score.score,
        })),
        activityDistribution: distributionData.map(activity => ({
          type: activity.type,
          percentage: activity.percentage,
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
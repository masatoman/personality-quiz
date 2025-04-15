import supabase from '@/lib/supabase';

export interface GiverScore {
  score: number;
  level: string;
  activities: number;
  contributions: number;
  lastUpdated: Date;
}

export async function getGiverScore(userId: string): Promise<GiverScore> {
  // スコアの取得
  const { data: scoreData, error: scoreError } = await supabase
    .from('giver_scores')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (scoreError) {
    console.error('Error fetching giver score:', scoreError);
    return {
      score: 0,
      level: 'Beginner',
      activities: 0,
      contributions: 0,
      lastUpdated: new Date(),
    };
  }

  // レベルの計算
  const level = calculateLevel(scoreData.score);

  return {
    score: scoreData.score,
    level,
    activities: scoreData.activities_count,
    contributions: scoreData.contributions_count,
    lastUpdated: new Date(scoreData.updated_at),
  };
}

function calculateLevel(score: number): string {
  if (score >= 1000) return 'Master';
  if (score >= 500) return 'Expert';
  if (score >= 200) return 'Advanced';
  if (score >= 100) return 'Intermediate';
  return 'Beginner';
} 
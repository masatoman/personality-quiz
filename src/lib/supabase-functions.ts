import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// ユーザーポイントを増加させる関数
export async function incrementUserPoints(userId: string, pointsToAdd: number) {
  try {
    const { data, error } = await supabase.rpc('increment_user_points', {
      user_id: userId,
      points_to_add: pointsToAdd
    });

    if (error) {
      console.error('ポイント追加エラー:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('ポイント追加エラー:', error);
    return { success: false, error };
  }
}

// ギバースコアを増加させる関数
export async function incrementGiverScore(userId: string, scoreToAdd: number) {
  try {
    const { data, error } = await supabase.rpc('increment_giver_score', {
      user_id: userId,
      score_to_add: scoreToAdd
    });

    if (error) {
      console.error('ギバースコア追加エラー:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('ギバースコア追加エラー:', error);
    return { success: false, error };
  }
}

// ギバーランキングを取得する関数
export async function getGiverRanking(period: 'weekly' | 'monthly') {
  try {
    const { data, error } = await supabase.rpc('get_giver_ranking', {
      period: period
    });

    if (error) {
      console.error('ランキング取得エラー:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('ランキング取得エラー:', error);
    return { success: false, error };
  }
}

// ユーザー情報の型定義
export interface UserRankingData {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  giver_score: number;
  rank: number;
} 
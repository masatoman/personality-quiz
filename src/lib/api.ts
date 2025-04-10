import supabase, { Database } from './supabase';
import { PersonalityType, TypeTotals, Stats } from '@/types/quiz';

// APIエンドポイントのベースパス
export const API_BASE = '/api';

// ユーザープロファイル関連の型定義
export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  personality_type: PersonalityType | null;
  giver_score: number;
  points: number;
};

// ユーザー活動の種類
export type ActivityType = 
  | 'CREATE_CONTENT'
  | 'PROVIDE_FEEDBACK' 
  | 'CONSUME_CONTENT'
  | 'RECEIVE_FEEDBACK'
  | 'SHARE_RESOURCE'
  | 'ASK_QUESTION';

// 活動ポイントの設定
export const ACTIVITY_POINTS = {
  CREATE_CONTENT: 10,
  PROVIDE_FEEDBACK: 3,
  CONSUME_CONTENT: 1,
  RECEIVE_FEEDBACK: 0,
  SHARE_RESOURCE: 2,
  ASK_QUESTION: 1,
};

// ユーザープロファイル関連の関数
export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    // プロファイル情報を取得
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('プロファイル取得エラー:', profileError);
      return null;
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('personality_type, giver_score, points')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('ユーザー情報取得エラー:', userError);
      return null;
    }

    // プロファイル情報とユーザー情報を結合
    return {
      ...profileData,
      personality_type: userData.personality_type as PersonalityType | null,
      giver_score: userData.giver_score,
      points: userData.points,
    };
  } catch (error) {
    console.error('プロファイル取得中にエラーが発生しました:', error);
    return null;
  }
}

// プロファイル作成・更新
export async function upsertProfile(
  userId: string,
  data: {
    display_name: string;
    avatar_url?: string;
    bio?: string;
    personality_type?: PersonalityType;
  }
): Promise<boolean> {
  try {
    // プロファイル情報を更新
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        display_name: data.display_name,
        avatar_url: data.avatar_url || null,
        bio: data.bio || null,
      });

    if (profileError) {
      console.error('プロファイル更新エラー:', profileError);
      return false;
    }

    // パーソナリティタイプが指定されている場合は、ユーザー情報も更新
    if (data.personality_type) {
      const { error: userError } = await supabase
        .from('users')
        .update({ personality_type: data.personality_type })
        .eq('id', userId);

      if (userError) {
        console.error('ユーザー情報更新エラー:', userError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('プロファイル更新中にエラーが発生しました:', error);
    return false;
  }
}

// 活動ログの記録
export async function logActivity(
  userId: string,
  activityType: ActivityType,
  referenceId?: string
): Promise<boolean> {
  try {
    const points = ACTIVITY_POINTS[activityType];

    // 活動ログを記録
    const { error: activityError } = await supabase.from('activities').insert({
      user_id: userId,
      activity_type: activityType,
      reference_id: referenceId || null,
      points,
    });

    if (activityError) {
      console.error('活動ログ記録エラー:', activityError);
      return false;
    }

    // ユーザーのポイントを更新
    const { error: pointsError } = await supabase.rpc('increment_user_points', {
      user_id: userId,
      points_to_add: points,
    });

    if (pointsError) {
      console.error('ポイント更新エラー:', pointsError);
      return false;
    }

    // ギバースコアの更新（特定のアクティビティタイプの場合）
    if (['CREATE_CONTENT', 'PROVIDE_FEEDBACK', 'SHARE_RESOURCE'].includes(activityType)) {
      // ギバースコアを更新する仕組み（将来実装）
      // 今はポイントの10%をギバースコアに加算する簡易的な実装
      const giverScoreIncrement = Math.round(points * 0.1);
      
      const { error: giverScoreError } = await supabase.rpc('increment_giver_score', {
        user_id: userId,
        score_to_add: giverScoreIncrement,
      });

      if (giverScoreError) {
        console.error('ギバースコア更新エラー:', giverScoreError);
        // ギバースコアの更新に失敗しても、活動ログとポイントの記録は成功とみなす
      }
    }

    return true;
  } catch (error) {
    console.error('活動ログ記録中にエラーが発生しました:', error);
    return false;
  }
}

// ユーザーの活動ログを取得
export async function getUserActivities(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('活動ログ取得エラー:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('活動ログ取得中にエラーが発生しました:', error);
    return [];
  }
} 
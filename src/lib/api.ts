import { PostgrestError } from '@supabase/supabase-js';
import supabase, { Database } from './supabase';
import { PersonalityType, TypeTotals, Stats } from '@/types/quiz';
import { ActivityType } from '@/types/learning';
import { DatabaseError } from '@/types/errors';
export type { ActivityType };

// APIエンドポイントのベースパス
export const API_BASE = '/api';

// ユーザープロファイル関連の型定義
export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  personality_type: PersonalityType | null;
  giver_score: number;
  points: number;
};

// 活動ポイントの設定
export const ACTIVITY_POINTS: Readonly<Record<ActivityType, number>> = {
  CREATE_CONTENT: 10,
  PROVIDE_FEEDBACK: 3,
  CONSUME_CONTENT: 1,
  RECEIVE_FEEDBACK: 0,
  SHARE_RESOURCE: 2,
  ASK_QUESTION: 1,
  COMPLETE_RESOURCE: 2,
  START_RESOURCE: 1,
  QUIZ_COMPLETE: 3,
  DAILY_LOGIN: 1
} as const;

// エラーメッセージの定義
const ERROR_MESSAGES = {
  MISSING_USER_ID: 'ユーザーIDが指定されていません',
  MISSING_REQUIRED_PARAMS: '必須パラメータが不足しています',
  PROFILE_NOT_FOUND: 'プロファイルが見つかりません',
  UNEXPECTED_ERROR: '予期せぬエラーが発生しました'
} as const;

/**
 * PostgrestErrorかどうかを判定する型ガード
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return error instanceof Error && 'code' in error && 'details' in error && 'hint' in error;
}

/**
 * エラーメッセージを生成する
 */
function createErrorMessage(error: unknown): string {
  if (isPostgrestError(error)) {
    return `${error.message} (Code: ${error.code})`;
  }
  return error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR;
}

/**
 * ユーザープロファイルを取得する
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  try {
    if (!userId) {
      throw new DatabaseError(ERROR_MESSAGES.MISSING_USER_ID);
    }

    // プロファイル情報を取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new DatabaseError(`プロファイル取得エラー: ${createErrorMessage(profileError)}`);
    }

    if (!profile) {
      throw new DatabaseError(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    // ユーザー情報を取得
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('personality_type, giver_score, points')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new DatabaseError(`ユーザー情報取得エラー: ${createErrorMessage(userError)}`);
    }

    return {
      ...profile,
      personality_type: user?.personality_type ?? null,
      giver_score: user?.giver_score ?? 0,
      points: user?.points ?? 0,
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(`プロファイル取得中に${ERROR_MESSAGES.UNEXPECTED_ERROR}: ${createErrorMessage(error)}`);
  }
}

/**
 * ユーザープロファイルを更新または作成する
 */
export async function upsertProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile> {
  try {
    if (!userId || !data.display_name) {
      throw new DatabaseError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMS);
    }

    const timestamp = new Date().toISOString();
    const profileData = {
      user_id: userId,
      display_name: data.display_name,
      avatar_url: data.avatar_url ?? null,
      bio: data.bio ?? null,
      updated_at: timestamp,
    };

    // プロファイルを更新または作成
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (profileError) {
      throw new DatabaseError(`プロファイル更新エラー: ${createErrorMessage(profileError)}`);
    }

    if (!profile) {
      throw new DatabaseError(ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    // パーソナリティタイプが指定されている場合、ユーザー情報も更新
    if (data.personality_type) {
      const { error: userError } = await supabase
        .from('users')
        .update({ personality_type: data.personality_type })
        .eq('id', userId);

      if (userError) {
        throw new DatabaseError(`ユーザー情報更新エラー: ${createErrorMessage(userError)}`);
      }
    }

    // 更新後のプロファイルを返す
    return await getProfile(userId);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(`プロファイル更新中に${ERROR_MESSAGES.UNEXPECTED_ERROR}: ${createErrorMessage(error)}`);
  }
}

/**
 * ユーザーの活動を記録する
 * @param userId - ユーザーID
 * @param activityType - 活動タイプ
 * @param referenceId - 関連するリソースのID（オプション）
 * @returns 記録成功時はtrue
 * @throws {DatabaseError} データベース操作に失敗した場合
 */
export async function logActivity(
  userId: string,
  activityType: ActivityType,
  referenceId?: string
): Promise<boolean> {
  try {
    if (!userId || !activityType) {
      throw new DatabaseError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMS);
    }

    const points = ACTIVITY_POINTS[activityType];
    if (points === undefined) {
      throw new DatabaseError(`不正なアクティビティタイプです: ${activityType}`);
    }

    // 活動ログを記録
    const { error: activityError } = await supabase.from('activities').insert({
      user_id: userId,
      activity_type: activityType,
      reference_id: referenceId ?? null,
      points,
    });

    if (activityError) {
      throw new DatabaseError(`活動ログ記録エラー: ${createErrorMessage(activityError)}`);
    }

    // ユーザーのポイントを更新
    const { error: pointsError } = await supabase.rpc('increment_user_points', {
      user_id: userId,
      points_to_add: points,
    });

    if (pointsError) {
      throw new DatabaseError(`ポイント更新エラー: ${createErrorMessage(pointsError)}`);
    }

    // ギバースコアの更新（特定のアクティビティタイプの場合）
    const giverActivities = ['CREATE_CONTENT', 'PROVIDE_FEEDBACK', 'SHARE_RESOURCE'] as const;
    if (giverActivities.includes(activityType)) {
      const giverScoreIncrement = Math.round(points * 0.1);
      
      const { error: giverScoreError } = await supabase.rpc('increment_giver_score', {
        user_id: userId,
        score_to_add: giverScoreIncrement,
      });

      if (giverScoreError) {
        throw new DatabaseError(`ギバースコア更新エラー: ${createErrorMessage(giverScoreError)}`);
      }
    }

    return true;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(`活動記録中に${ERROR_MESSAGES.UNEXPECTED_ERROR}: ${createErrorMessage(error)}`);
  }
}

export interface Activity {
  id: number;
  user_id: string;
  activity_type: ActivityType;
  reference_id: string | null;
  points: number;
  created_at: string;
}

/**
 * ユーザーの活動ログを取得する
 * @param userId - ユーザーID
 * @param limit - 取得する活動ログの最大数
 * @returns 活動ログの配列
 * @throws {DatabaseError} データベース操作に失敗した場合
 */
export async function getUserActivities(userId: string, limit = 10): Promise<Activity[]> {
  try {
    if (!userId) {
      throw new DatabaseError(ERROR_MESSAGES.MISSING_USER_ID);
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new DatabaseError(`活動ログ取得エラー: ${createErrorMessage(error)}`);
    }

    return data as Activity[] ?? [];
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(`活動ログ取得中に${ERROR_MESSAGES.UNEXPECTED_ERROR}: ${createErrorMessage(error)}`);
  }
}

export interface ActivityStat {
  total: number;
  change: number;
}

export interface ActivitySummaryData {
  contributions: ActivityStat;
  points: ActivityStat;
  streak: ActivityStat;
}

/**
 * アクティビティの統計情報を取得する
 */
export async function getActivityStats(): Promise<ActivitySummaryData> {
  try {
    // 全体の貢献数と前日比を取得
    const { data: contributionsData, error: contributionsError } = await supabase
      .rpc('get_contributions_stats');

    if (contributionsError) {
      throw new DatabaseError(`貢献統計取得エラー: ${createErrorMessage(contributionsError)}`);
    }

    // 全体のポイントと前日比を取得
    const { data: pointsData, error: pointsError } = await supabase
      .rpc('get_points_stats');

    if (pointsError) {
      throw new DatabaseError(`ポイント統計取得エラー: ${createErrorMessage(pointsError)}`);
    }

    // 連続ログイン日数と前日比を取得
    const { data: streakData, error: streakError } = await supabase
      .rpc('get_streak_stats');

    if (streakError) {
      throw new DatabaseError(`ストリーク統計取得エラー: ${createErrorMessage(streakError)}`);
    }

    return {
      contributions: {
        total: contributionsData?.total ?? 0,
        change: contributionsData?.change ?? 0
      },
      points: {
        total: pointsData?.total ?? 0,
        change: pointsData?.change ?? 0
      },
      streak: {
        total: streakData?.total ?? 0,
        change: streakData?.change ?? 0
      }
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(`統計情報取得中に${ERROR_MESSAGES.UNEXPECTED_ERROR}: ${createErrorMessage(error)}`);
  }
} 
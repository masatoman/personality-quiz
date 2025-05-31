import { getClient } from '@/lib/supabase/client';

export type ActivityType = 
  | 'quiz_completed'
  | 'material_created'
  | 'material_viewed'
  | 'material_shared'
  | 'teaching_session'
  | 'points_earned'
  | 'badge_earned'
  | 'login'
  | 'profile_updated';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  activity_data: Record<string, any>;
  points_earned: number;
  created_at: string;
}

export interface ActivityData {
  activity_type: ActivityType;
  activity_data?: Record<string, any>;
  points_earned?: number;
}

/**
 * ユーザー活動を記録する
 */
export async function recordActivity(
  userId: string,
  activityData: ActivityData
): Promise<{ data: UserActivity | null; error: Error | null }> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('user_activities')
      .insert([
        {
          user_id: userId,
          activity_type: activityData.activity_type,
          activity_data: activityData.activity_data || {},
          points_earned: activityData.points_earned || 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // ポイントを獲得した場合はポイントテーブルも更新
    if (activityData.points_earned && activityData.points_earned > 0) {
      await updateUserPoints(userId, activityData.points_earned);
    }

    return { data, error: null };
  } catch (error) {
    console.error('活動記録エラー:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('活動記録に失敗しました') 
    };
  }
}

/**
 * ユーザーのポイントを更新する
 */
export async function updateUserPoints(
  userId: string,
  pointsToAdd: number
): Promise<{ data: any; error: Error | null }> {
  try {
    const supabase = getClient();

    // ユーザーのポイント記録があるかチェック
    const { data: existingPoints, error: checkError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let result;
    if (existingPoints) {
      // 既存のポイントに加算
      const { data, error } = await supabase
        .from('user_points')
        .update({
          points: existingPoints.points + pointsToAdd,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // 新規ポイント記録を作成
      const { data, error } = await supabase
        .from('user_points')
        .insert([
          {
            user_id: userId,
            points: pointsToAdd,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return { data: result, error: null };
  } catch (error) {
    console.error('ポイント更新エラー:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('ポイント更新に失敗しました') 
    };
  }
}

/**
 * ユーザーの活動履歴を取得する
 */
export async function getUserActivities(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    activity_type?: ActivityType;
    start_date?: string;
    end_date?: string;
  }
): Promise<{ data: UserActivity[]; error: Error | null }> {
  try {
    const supabase = getClient();

    let query = supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.activity_type) {
      query = query.eq('activity_type', options.activity_type);
    }

    if (options?.start_date) {
      query = query.gte('created_at', options.start_date);
    }

    if (options?.end_date) {
      query = query.lte('created_at', options.end_date);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('活動履歴取得エラー:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('活動履歴の取得に失敗しました') 
    };
  }
}

/**
 * ユーザーの現在のポイントを取得する
 */
export async function getUserPoints(
  userId: string
): Promise<{ data: { points: number } | null; error: Error | null }> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { 
      data: data ? { points: data.points } : { points: 0 }, 
      error: null 
    };
  } catch (error) {
    console.error('ポイント取得エラー:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('ポイント取得に失敗しました') 
    };
  }
}

/**
 * 活動統計を取得する
 */
export async function getActivitySummary(
  userId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'week'
): Promise<{ data: any; error: Error | null }> {
  try {
    const supabase = getClient();

    // 期間の計算
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const { data, error } = await supabase
      .from('user_activities')
      .select('activity_type, points_earned, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // 統計の集計
    const summary = {
      totalActivities: data.length,
      totalPoints: data.reduce((sum, activity) => sum + (activity.points_earned || 0), 0),
      activitiesByType: data.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      pointsByType: data.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + (activity.points_earned || 0);
        return acc;
      }, {} as Record<string, number>),
    };

    return { data: summary, error: null };
  } catch (error) {
    console.error('活動統計取得エラー:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('活動統計の取得に失敗しました') 
    };
  }
} 
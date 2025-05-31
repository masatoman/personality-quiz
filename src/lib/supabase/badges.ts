import { getClient } from '@/lib/supabase/client';
import { ActivityType } from './user-activities';

export type BadgeType = 
  | 'first_quiz'
  | 'quiz_master'
  | 'first_material'
  | 'creator'
  | 'generous_sharer'
  | 'consistent_learner'
  | 'community_helper'
  | 'early_bird'
  | 'night_owl'
  | 'weekend_warrior';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: BadgeType;
  requirement: {
    activity_type?: ActivityType;
    count?: number;
    points?: number;
    condition?: string;
  };
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  acquired_at: string;
  badge?: Badge;
}

// バッジ定義（初期設定）
export const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'id' | 'created_at'>> = {
  first_quiz: {
    name: '初回診断完了',
    description: 'ギバー診断を初めて完了しました',
    icon: '🎯',
    type: 'first_quiz',
    requirement: {
      activity_type: 'quiz_completed',
      count: 1,
    },
  },
  quiz_master: {
    name: '診断マスター',
    description: 'ギバー診断を10回完了しました',
    icon: '🏆',
    type: 'quiz_master',
    requirement: {
      activity_type: 'quiz_completed',
      count: 10,
    },
  },
  first_material: {
    name: '初回投稿',
    description: '教材を初めて投稿しました',
    icon: '📝',
    type: 'first_material',
    requirement: {
      activity_type: 'material_created',
      count: 1,
    },
  },
  creator: {
    name: 'クリエイター',
    description: '教材を5つ投稿しました',
    icon: '✨',
    type: 'creator',
    requirement: {
      activity_type: 'material_created',
      count: 5,
    },
  },
  generous_sharer: {
    name: '寛大なシェアラー',
    description: '教材を20回シェアしました',
    icon: '🤝',
    type: 'generous_sharer',
    requirement: {
      activity_type: 'material_shared',
      count: 20,
    },
  },
  consistent_learner: {
    name: '継続学習者',
    description: '7日連続でログインしました',
    icon: '📚',
    type: 'consistent_learner',
    requirement: {
      activity_type: 'login',
      condition: 'consecutive_days',
    },
  },
  community_helper: {
    name: 'コミュニティヘルパー',
    description: '100ポイントを獲得しました',
    icon: '💫',
    type: 'community_helper',
    requirement: {
      points: 100,
    },
  },
  early_bird: {
    name: '早起きの鳥',
    description: '午前6時前にログインしました',
    icon: '🌅',
    type: 'early_bird',
    requirement: {
      activity_type: 'login',
      condition: 'early_morning',
    },
  },
  night_owl: {
    name: '夜のフクロウ',
    description: '午後10時以降にログインしました',
    icon: '🦉',
    type: 'night_owl',
    requirement: {
      activity_type: 'login',
      condition: 'late_night',
    },
  },
  weekend_warrior: {
    name: 'ウィークエンドウォリアー',
    description: '週末に5回以上活動しました',
    icon: '⚔️',
    type: 'weekend_warrior',
    requirement: {
      condition: 'weekend_activity',
    },
  },
};

/**
 * バッジをチェックして獲得可能なものを付与する
 */
export async function checkAndAwardBadges(
  userId: string,
  activityType?: ActivityType
): Promise<{ data: UserBadge[]; error: Error | null }> {
  try {
    const supabase = getClient();
    const awardedBadges: UserBadge[] = [];

    // 既に獲得済みのバッジを取得
    const { data: existingBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const existingBadgeIds = existingBadges?.map(b => b.badge_id) || [];

    // 全てのバッジ定義をチェック
    for (const [badgeType, definition] of Object.entries(BADGE_DEFINITIONS)) {
      // 既に獲得済みのバッジはスキップ
      if (existingBadgeIds.includes(badgeType)) {
        continue;
      }

      // 特定の活動タイプのみをチェックする場合
      if (activityType && definition.requirement.activity_type && 
          definition.requirement.activity_type !== activityType) {
        continue;
      }

      const isEligible = await checkBadgeEligibility(userId, definition);
      
      if (isEligible) {
        // バッジを付与
        const { data: newBadge, error } = await supabase
          .from('user_badges')
          .insert([
            {
              user_id: userId,
              badge_id: badgeType,
              acquired_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (!error && newBadge) {
          awardedBadges.push(newBadge);
          
          // バッジ獲得の活動記録を追加
          const { recordActivity } = await import('./user-activities');
          await recordActivity(userId, {
            activity_type: 'badge_earned',
            activity_data: { badge_id: badgeType, badge_name: definition.name },
            points_earned: 10, // バッジ獲得ボーナス
          });
        }
      }
    }

    return { data: awardedBadges, error: null };
  } catch (error) {
    console.error('バッジチェックエラー:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('バッジチェックに失敗しました') 
    };
  }
}

/**
 * バッジの獲得条件をチェックする
 */
async function checkBadgeEligibility(
  userId: string,
  badgeDefinition: Omit<Badge, 'id' | 'created_at'>
): Promise<boolean> {
  try {
    const supabase = getClient();
    const requirement = badgeDefinition.requirement;

    // ポイント数による条件
    if (requirement.points) {
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)
        .single();

      return (userPoints?.points || 0) >= requirement.points;
    }

    // 活動回数による条件
    if (requirement.activity_type && requirement.count) {
      const { data: activities } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_type', requirement.activity_type);

      return (activities?.length || 0) >= requirement.count;
    }

    // 特殊条件
    if (requirement.condition) {
      return await checkSpecialCondition(userId, requirement.condition);
    }

    return false;
  } catch (error) {
    console.error('バッジ獲得条件チェックエラー:', error);
    return false;
  }
}

/**
 * 特殊条件をチェックする
 */
async function checkSpecialCondition(
  userId: string,
  condition: string
): Promise<boolean> {
  try {
    const supabase = getClient();
    const now = new Date();

    switch (condition) {
      case 'consecutive_days': {
        // 7日連続ログインをチェック
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const { data: logins } = await supabase
          .from('user_activities')
          .select('created_at')
          .eq('user_id', userId)
          .eq('activity_type', 'login')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at');

        if (!logins || logins.length < 7) return false;

        // 連続性をチェック
        const loginDates = logins.map(l => new Date(l.created_at).toDateString());
        const uniqueDates = [...new Set(loginDates)];
        return uniqueDates.length >= 7;
      }

      case 'early_morning': {
        // 午前6時前のログインをチェック
        const { data: earlyLogins } = await supabase
          .from('user_activities')
          .select('created_at')
          .eq('user_id', userId)
          .eq('activity_type', 'login');

        return earlyLogins?.some(login => {
          const loginHour = new Date(login.created_at).getHours();
          return loginHour < 6;
        }) || false;
      }

      case 'late_night': {
        // 午後10時以降のログインをチェック
        const { data: lateLogins } = await supabase
          .from('user_activities')
          .select('created_at')
          .eq('user_id', userId)
          .eq('activity_type', 'login');

        return lateLogins?.some(login => {
          const loginHour = new Date(login.created_at).getHours();
          return loginHour >= 22;
        }) || false;
      }

      case 'weekend_activity': {
        // 週末の活動をチェック
        const weekendStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const { data: weekendActivities } = await supabase
          .from('user_activities')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', weekendStart.toISOString());

        const weekendActivityCount = weekendActivities?.filter(activity => {
          const day = new Date(activity.created_at).getDay();
          return day === 0 || day === 6; // 日曜日または土曜日
        }).length || 0;

        return weekendActivityCount >= 5;
      }

      default:
        return false;
    }
  } catch (error) {
    console.error('特殊条件チェックエラー:', error);
    return false;
  }
}

/**
 * ユーザーの獲得済みバッジを取得する
 */
export async function getUserBadges(
  userId: string
): Promise<{ data: UserBadge[]; error: Error | null }> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('acquired_at', { ascending: false });

    if (error) throw error;

    // バッジ定義を追加
    const badgesWithDetails = (data || []).map(userBadge => ({
      ...userBadge,
      badge: BADGE_DEFINITIONS[userBadge.badge_id as BadgeType],
    }));

    return { data: badgesWithDetails, error: null };
  } catch (error) {
    console.error('ユーザーバッジ取得エラー:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('ユーザーバッジの取得に失敗しました') 
    };
  }
}

/**
 * 利用可能な全バッジを取得する
 */
export function getAllBadges(): Badge[] {
  return Object.entries(BADGE_DEFINITIONS).map(([id, definition]) => ({
    id,
    ...definition,
    created_at: new Date().toISOString(),
  }));
} 
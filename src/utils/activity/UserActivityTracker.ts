import { SupabaseClient } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import { ActivityType } from '@/types/learning';

// 有効なアクティビティタイプの配列
const VALID_ACTIVITY_TYPES: ActivityType[] = [
  'COMPLETE_RESOURCE',
  'START_RESOURCE',
  'CREATE_CONTENT',
  'PROVIDE_FEEDBACK',
  'RECEIVE_FEEDBACK',
  'DAILY_LOGIN',
  'SHARE_RESOURCE',
  'QUIZ_COMPLETE',
  'ASK_QUESTION',
  'CONSUME_CONTENT'
];

/**
 * 活動タイプの列挙型
 */
export type ActivityType = ActivityType;

/**
 * 活動の詳細情報の基本インターフェース
 */
export interface BaseActivityDetails {
  timestamp: string;
  duration?: number;
  success?: boolean;
  errorMessage?: string;
}

/**
 * コンテンツ閲覧活動の詳細
 */
export interface ViewContentDetails extends BaseActivityDetails {
  contentId: string;
  contentType: 'lesson' | 'quiz' | 'article';
  progress?: number;
}

/**
 * クイズ活動の詳細
 */
export interface QuizActivityDetails extends BaseActivityDetails {
  quizId: string;
  score?: number;
  totalQuestions: number;
  completedQuestions: number;
}

/**
 * レッスン活動の詳細
 */
export interface LessonActivityDetails extends BaseActivityDetails {
  lessonId: string;
  progress: number;
  completed: boolean;
}

/**
 * 活動の詳細情報の型定義
 */
export type ActivityDetails = ViewContentDetails | QuizActivityDetails | LessonActivityDetails;

/**
 * ユーザー活動を表すインターフェイス
 */
export interface UserActivity<T extends ActivityDetails = ActivityDetails> {
  userId: string;
  activityType: ActivityType;
  timestamp: Date;
  details?: T;
}

/**
 * データベースの活動レコードの型定義
 */
interface ActivityRecord<T extends ActivityDetails = ActivityDetails> {
  user_id: string;
  activity_type: ActivityType;
  timestamp: string;
  details: T;
}

/**
 * 活動サマリーの型定義
 */
export interface ActivitySummary {
  counts: Record<ActivityType, number>;
  totalActivities: number;
  lastActivity?: {
    type: ActivityType;
    timestamp: Date;
  };
}

/**
 * ユーザー活動追跡ユーティリティクラス
 * ユーザーの行動を追跡し、そのデータを保存・分析するための機能を提供
 */
export class UserActivityTracker {
  private static readonly supabase: SupabaseClient = supabase;

  /**
   * 新しい活動を記録する
   * @param userId - ユーザーID
   * @param activityType - 記録する活動の種類
   * @param details - 活動の詳細情報（オプション）
   * @returns 記録された活動オブジェクト
   * @throws {Error} データベース操作に失敗した場合
   * @example
   * ```typescript
   * const activity = await UserActivityTracker.trackActivity(
   *   'user123',
   *   ActivityType.VIEW_CONTENT,
   *   { contentId: 'lesson1', contentType: 'lesson', progress: 0.5 }
   * );
   * ```
   */
  static async trackActivity<T extends ActivityDetails>(
    userId: string, 
    activityType: ActivityType, 
    details?: T
  ): Promise<UserActivity<T>> {
    if (!userId.trim()) {
      throw new Error('ユーザーIDは必須です');
    }

    if (!VALID_ACTIVITY_TYPES.includes(activityType)) {
      throw new Error(`無効な活動タイプです: ${activityType}`);
    }

    try {
      const timestamp = new Date();
      const activity: UserActivity<T> = {
        userId,
        activityType,
        timestamp,
        details
      };
      
      const { error } = await this.supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          timestamp: timestamp.toISOString(),
          details: details || {}
        });
      
      if (error) {
        throw new Error(`活動の記録に失敗しました: ${error.message}`);
      }
      
      return activity;
    } catch (error) {
      console.error('活動追跡中にエラーが発生:', error);
      throw error instanceof Error ? error : new Error('不明なエラーが発生しました');
    }
  }
  
  /**
   * ユーザーの活動履歴を取得する
   * @param userId - ユーザーID
   * @param fromDate - 取得開始日（オプション）
   * @param toDate - 取得終了日（オプション）
   * @returns 活動のリスト
   * @throws {Error} データベース操作に失敗した場合
   * @example
   * ```typescript
   * const activities = await UserActivityTracker.getUserActivities(
   *   'user123',
   *   new Date('2024-01-01'),
   *   new Date()
   * );
   * ```
   */
  static async getUserActivities<T extends ActivityDetails>(
    userId: string, 
    fromDate?: Date, 
    toDate?: Date
  ): Promise<UserActivity<T>[]> {
    if (!userId.trim()) {
      throw new Error('ユーザーIDは必須です');
    }

    if (fromDate && toDate && fromDate > toDate) {
      throw new Error('開始日は終了日より前である必要があります');
    }

    try {
      let query = this.supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (fromDate) {
        query = query.gte('timestamp', fromDate.toISOString());
      }
      
      if (toDate) {
        query = query.lte('timestamp', toDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`活動履歴の取得に失敗しました: ${error.message}`);
      }

      if (!data) {
        return [];
      }
      
      return (data as ActivityRecord<T>[]).map(item => ({
        userId: item.user_id,
        activityType: item.activity_type,
        timestamp: new Date(item.timestamp),
        details: item.details
      }));
    } catch (error) {
      console.error('活動履歴取得中にエラーが発生:', error);
      console.error('活動履歴取得中に例外が発生しました:', error);
      throw error instanceof Error ? error : new Error('不明なエラーが発生しました');
    }
  }
  
  /**
   * ユーザーの最新活動を取得する
   * @param userId - ユーザーID
   * @param activityType - フィルタリングする活動タイプ（オプション）
   * @returns 最新の活動、または見つからない場合はnull
   * @throws {Error} データベース操作に失敗した場合
   * @example
   * ```typescript
   * const latestActivity = await UserActivityTracker.getLatestActivity(
   *   'user123',
   *   ActivityType.COMPLETE_LESSON
   * );
   * ```
   */
  static async getLatestActivity<T extends ActivityDetails>(
    userId: string, 
    activityType?: ActivityType
  ): Promise<UserActivity<T> | null> {
    if (!userId.trim()) {
      throw new Error('ユーザーIDは必須です');
    }

    if (activityType && !VALID_ACTIVITY_TYPES.includes(activityType)) {
      throw new Error(`無効な活動タイプです: ${activityType}`);
    }

    try {
      let query = this.supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1);
      
      if (activityType) {
        query = query.eq('activity_type', activityType);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`最新活動の取得に失敗しました: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return null;
      }
      
      const item = data[0] as ActivityRecord<T>;
      return {
        userId: item.user_id,
        activityType: item.activity_type,
        timestamp: new Date(item.timestamp),
        details: item.details
      };
    } catch (error) {
      console.error('最新活動取得中にエラーが発生:', error);
      throw error instanceof Error ? error : new Error('不明なエラーが発生しました');
    }
  }
  
  /**
   * 特定タイプの活動の回数をカウントする
   * @param userId - ユーザーID
   * @param activityType - カウントする活動タイプ
   * @param fromDate - 開始日（オプション）
   * @param toDate - 終了日（オプション）
   * @returns 活動回数
   * @throws {Error} データベース操作に失敗した場合
   * @example
   * ```typescript
   * const count = await UserActivityTracker.getActivityCount(
   *   'user123',
   *   ActivityType.COMPLETE_LESSON,
   *   new Date('2024-01-01'),
   *   new Date()
   * );
   * ```
   */
  static async getActivityCount(
    userId: string, 
    activityType: ActivityType,
    fromDate?: Date,
    toDate?: Date
  ): Promise<number> {
    if (!userId.trim()) {
      throw new Error('ユーザーIDは必須です');
    }

    if (!VALID_ACTIVITY_TYPES.includes(activityType)) {
      throw new Error(`無効な活動タイプです: ${activityType}`);
    }

    if (fromDate && toDate && fromDate > toDate) {
      throw new Error('開始日は終了日より前である必要があります');
    }

    try {
      let query = this.supabase
        .from('user_activities')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('activity_type', activityType);
      
      if (fromDate) {
        query = query.gte('timestamp', fromDate.toISOString());
      }
      
      if (toDate) {
        query = query.lte('timestamp', toDate.toISOString());
      }
      
      const { count, error } = await query;
      
      if (error) {
        throw new Error(`活動回数の取得に失敗しました: ${error.message}`);
      }
      
      return count || 0;
    } catch (error) {
      console.error('活動カウント中にエラーが発生:', error);
      throw error instanceof Error ? error : new Error('不明なエラーが発生しました');
    }
  }
  
  /**
   * ユーザーの活動サマリーを取得する
   * @param userId - ユーザーID
   * @returns 活動タイプごとの集計情報
   * @throws {Error} データベース操作に失敗した場合
   * @example
   * ```typescript
   * const summary = await UserActivityTracker.getActivitySummary('user123');
   * console.log(`総活動数: ${summary.totalActivities}`);
   * console.log(`レッスン完了数: ${summary.counts[ActivityType.COMPLETE_LESSON]}`);
   * ```
   */
  static async getActivitySummary(userId: string): Promise<ActivitySummary> {
    if (!userId.trim()) {
      throw new Error('ユーザーIDは必須です');
    }

    try {
      const { data, error } = await this.supabase
        .from('user_activities')
        .select('activity_type, timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`活動サマリーの取得に失敗しました: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('予期しないデータ形式を受信しました');
      }

      const summary: ActivitySummary = {
        counts: VALID_ACTIVITY_TYPES.reduce((acc, type) => {
          acc[type] = 0;
          return acc;
        }, {} as Record<ActivityType, number>),
        totalActivities: 0
      };

      data.forEach((item: { activity_type: ActivityType; timestamp: string }) => {
        if (VALID_ACTIVITY_TYPES.includes(item.activity_type)) {
          summary.counts[item.activity_type] += 1;
          summary.totalActivities += 1;

          if (!summary.lastActivity || new Date(item.timestamp) > new Date(summary.lastActivity.timestamp)) {
            summary.lastActivity = {
              type: item.activity_type,
              timestamp: new Date(item.timestamp)
            };
          }
        } else {
          console.warn(`不明な活動タイプを検出: ${item.activity_type}`);
        }
      });

      return summary;
    } catch (error) {
      console.error('活動サマリー取得中にエラーが発生:', error);
      throw error instanceof Error ? error : new Error('不明なエラーが発生しました');
    }
  }

  /**
   * 特定期間の活動統計を取得する
   * @param userId - ユーザーID
   * @param fromDate - 開始日
   * @param toDate - 終了日
   * @returns 期間中の活動統計情報
   * @throws {Error} データベース操作に失敗した場合
   * @example
   * ```typescript
   * const stats = await UserActivityTracker.getActivityStats(
   *   'user123',
   *   new Date('2024-01-01'),
   *   new Date()
   * );
   * console.log(`日別アクティビティ: ${JSON.stringify(stats.dailyCount)}`);
   * console.log(`最も活動的な日: ${stats.mostActiveDay?.date}`);
   * ```
   */
  static async getActivityStats(
    userId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<{
    /** 日付ごとの活動回数 */
    dailyCount: Record<string, number>;
    /** 期間中の総活動回数 */
    totalCount: number;
    /** 1日あたりの平均活動回数 */
    averagePerDay: number;
    /** 最も活動的だった日の情報 */
    mostActiveDay?: {
      /** 日付（YYYY-MM-DD形式） */
      date: string;
      /** その日の活動回数 */
      count: number;
    };
  }> {
    if (!userId.trim()) {
      throw new Error('ユーザーIDは必須です');
    }

    if (!(fromDate instanceof Date) || isNaN(fromDate.getTime())) {
      throw new Error('開始日が無効です');
    }

    if (!(toDate instanceof Date) || isNaN(toDate.getTime())) {
      throw new Error('終了日が無効です');
    }

    if (fromDate > toDate) {
      throw new Error('開始日は終了日より前である必要があります');
    }

    try {
      const { data, error } = await this.supabase
        .from('user_activities')
        .select('timestamp')
        .eq('user_id', userId)
        .gte('timestamp', fromDate.toISOString())
        .lte('timestamp', toDate.toISOString());

      if (error) {
        throw new Error(`活動統計の取得に失敗しました: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('予期しないデータ形式を受信しました');
      }

      const dailyCount: Record<string, number> = {};
      let mostActiveDay: { date: string; count: number } | undefined;

      data.forEach((item: { timestamp: string }) => {
        const date = item.timestamp.split('T')[0];
        dailyCount[date] = (dailyCount[date] || 0) + 1;

        if (!mostActiveDay || dailyCount[date] > mostActiveDay.count) {
          mostActiveDay = { date, count: dailyCount[date] };
        }
      });

      const totalCount = Object.values(dailyCount).reduce((sum, count) => sum + count, 0);
      const dayCount = Object.keys(dailyCount).length || 1;

      return {
        dailyCount,
        totalCount,
        averagePerDay: totalCount / dayCount,
        mostActiveDay
      };
    } catch (error) {
      console.error('活動統計取得中にエラーが発生:', error);
      throw error instanceof Error ? error : new Error('不明なエラーが発生しました');
    }
  }
}

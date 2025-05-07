import { ActivityType } from '@/types/learning';
import supabase from '@/services/supabaseClient';

/**
 * ユーザー活動を表すインターフェイス
 */
export interface UserActivity {
  userId: string;
  activityType: ActivityType;
  timestamp: Date;
  details?: Record<string, any>;
}

/**
 * ユーザー活動追跡ユーティリティクラス
 * ユーザーの行動を追跡し、そのデータを保存・分析するための機能を提供
 */
export class UserActivityTracker {
  /**
   * 新しい活動を記録する
   * @param userId ユーザーID
   * @param activityType 活動タイプ
   * @param details 活動の詳細情報（任意）
   * @returns 記録された活動オブジェクト
   */
  static async trackActivity(
    userId: string, 
    activityType: ActivityType, 
    details?: Record<string, any>
  ): Promise<UserActivity> {
    try {
      const timestamp = new Date();
      const activity: UserActivity = {
        userId,
        activityType,
        timestamp,
        details
      };
      
      // 活動をデータベースに保存
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          timestamp: timestamp.toISOString(),
          details: details || {}
        });
      
      if (error) {
        console.error('活動追跡エラー:', error);
        throw new Error(`活動の記録に失敗しました: ${error.message}`);
      }
      
      return activity;
    } catch (error) {
      console.error('活動追跡中に例外が発生しました:', error);
      throw error;
    }
  }
  
  /**
   * ユーザーの活動履歴を取得する
   * @param userId ユーザーID
   * @param fromDate 開始日（任意）
   * @param toDate 終了日（任意）
   * @returns 活動のリスト
   */
  static async getUserActivities(
    userId: string, 
    fromDate?: Date, 
    toDate?: Date
  ): Promise<UserActivity[]> {
    try {
      // 基本クエリを構築
      let query = supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      // 日付範囲フィルターを追加（指定されている場合）
      if (fromDate) {
        query = query.gte('timestamp', fromDate.toISOString());
      }
      
      if (toDate) {
        query = query.lte('timestamp', toDate.toISOString());
      }
      
      // クエリを実行
      const { data, error } = await query;
      
      if (error) {
        console.error('活動取得エラー:', error);
        throw new Error(`活動履歴の取得に失敗しました: ${error.message}`);
      }
      
      // データベースの結果をUserActivity形式に変換
      return (data || []).map(item => ({
        userId: item.user_id,
        activityType: item.activity_type as ActivityType,
        timestamp: new Date(item.timestamp),
        details: item.details
      }));
    } catch (error) {
      console.error('活動履歴取得中に例外が発生しました:', error);
      throw error;
    }
  }
  
  /**
   * ユーザーの最新活動を取得する
   * @param userId ユーザーID
   * @param activityType 特定の活動タイプ（任意）
   * @returns 最新の活動、または見つからない場合はnull
   */
  static async getLatestActivity(
    userId: string, 
    activityType?: ActivityType
  ): Promise<UserActivity | null> {
    try {
      // 基本クエリを構築
      let query = supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1);
      
      // アクティビティタイプのフィルターを追加（指定されている場合）
      if (activityType) {
        query = query.eq('activity_type', activityType);
      }
      
      // クエリを実行
      const { data, error } = await query;
      
      if (error) {
        console.error('最新活動取得エラー:', error);
        throw new Error(`最新活動の取得に失敗しました: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return null;
      }
      
      // データベースの結果をUserActivity形式に変換
      const item = data[0];
      return {
        userId: item.user_id,
        activityType: item.activity_type as ActivityType,
        timestamp: new Date(item.timestamp),
        details: item.details
      };
    } catch (error) {
      console.error('最新活動取得中に例外が発生しました:', error);
      throw error;
    }
  }
  
  /**
   * 特定タイプの活動の回数をカウントする
   * @param userId ユーザーID
   * @param activityType 活動タイプ
   * @param fromDate 開始日（任意）
   * @param toDate 終了日（任意）
   * @returns 活動回数
   */
  static async getActivityCount(
    userId: string, 
    activityType: ActivityType,
    fromDate?: Date,
    toDate?: Date
  ): Promise<number> {
    try {
      // 基本クエリを構築
      let query = supabase
        .from('user_activities')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('activity_type', activityType);
      
      // 日付範囲フィルターを追加（指定されている場合）
      if (fromDate) {
        query = query.gte('timestamp', fromDate.toISOString());
      }
      
      if (toDate) {
        query = query.lte('timestamp', toDate.toISOString());
      }
      
      // クエリを実行
      const { count, error } = await query;
      
      if (error) {
        console.error('活動カウントエラー:', error);
        throw new Error(`活動回数の取得に失敗しました: ${error.message}`);
      }
      
      return count || 0;
    } catch (error) {
      console.error('活動カウント取得中に例外が発生しました:', error);
      throw error;
    }
  }
  
  /**
   * ユーザーの総活動量を集計する
   * @param userId ユーザーID
   * @returns 活動タイプ別の集計結果
   */
  static async getActivitySummary(userId: string): Promise<Record<string, any>> {
    try {
      // 各アクティビティタイプの集計を取得
      const activityTypes: ActivityType[] = [
        'complete_resource',
        'start_resource',
        'create_material',
        'provide_feedback',
        'daily_login',
        'share_resource',
        'quiz_complete'
      ];
      
      const summary: Record<string, any> = {};
      
      // 各アクティビティタイプのカウントを取得
      for (const type of activityTypes) {
        const count = await this.getActivityCount(userId, type);
        summary[`${type}_count`] = count;
      }
      
      // ストリーク（連続ログイン）の計算
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, max_streak')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        summary.current_streak = data.current_streak;
        summary.max_streak = data.max_streak;
      } else {
        summary.current_streak = 0;
        summary.max_streak = 0;
      }
      
      // その他の統計情報を追加
      // ユニークカテゴリ数
      const { data: resourceData, error: resourceError } = await supabase
        .from('user_resources')
        .select('category')
        .eq('user_id', userId)
        .eq('completed', true);
      
      if (!resourceError && resourceData) {
        const uniqueCategories = new Set(resourceData.map(item => item.category));
        summary.unique_categories_count = uniqueCategories.size;
      } else {
        summary.unique_categories_count = 0;
      }
      
      // 最後のクイズスコア
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_results')
        .select('score')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1);
      
      if (!quizError && quizData && quizData.length > 0) {
        summary.last_score = quizData[0].score;
      }
      
      return summary;
    } catch (error) {
      console.error('活動サマリー取得中に例外が発生しました:', error);
      throw error;
    }
  }
}

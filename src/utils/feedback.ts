import supabase from '@/services/supabaseClient';

/**
 * フィードバックデータ型定義
 */
export interface FeedbackData {
  materialId: string;
  userId: string;
  rating: number;
  comment: string;
}

/**
 * フィードバック統計情報型定義
 */
export interface FeedbackStatistics {
  averageRating: number;
  totalCount: number;
  ratingDistribution: { rating: number; count: number; percentage: number }[];
}

/**
 * レスポンス型定義
 */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * フィードバック関連の機能を提供するサービスクラス
 */
export class FeedbackService {
  /**
   * フィードバックを投稿する
   * @param data フィードバックデータ
   * @returns 投稿結果
   */
  static async submitFeedback(data: FeedbackData): Promise<ApiResponse<any>> {
    try {
      const { materialId, userId, rating, comment } = data;
      
      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .insert({
          materialId,
          userId,
          rating,
          comment,
          createdAt: new Date().toISOString()
        });
      
      if (error) throw error;
      
      return {
        success: true,
        data: feedbackData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 教材に対するフィードバック一覧を取得する
   * @param materialId 教材ID
   * @param limit 取得件数（デフォルト：10件）
   * @returns フィードバック一覧
   */
  static async getFeedbackForMaterial(materialId: string, limit: number = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          materialId,
          userId,
          users:userId (
            username:name
          ),
          rating,
          comment,
          createdAt
        `)
        .eq('materialId', materialId)
        .order('createdAt', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // ユーザー名を含むデータに整形
      const formattedData = data.map(item => ({
        ...item,
        userName: item.users ? item.users.username : '匿名ユーザー',
        users: undefined // ネストされたデータを削除
      }));
      
      return {
        success: true,
        data: formattedData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * ユーザーが提供したフィードバック一覧を取得する
   * @param userId ユーザーID
   * @param limit 取得件数（デフォルト：10件）
   * @returns フィードバック一覧
   */
  static async getUserFeedback(userId: string, limit: number = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          materialId,
          materials:materialId (
            title
          ),
          userId,
          rating,
          comment,
          createdAt
        `)
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // 教材タイトルを含むデータに整形
      const formattedData = data.map(item => ({
        ...item,
        materialTitle: item.materials ? item.materials.title : '削除された教材',
        materials: undefined // ネストされたデータを削除
      }));
      
      return {
        success: true,
        data: formattedData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 教材のフィードバック統計を取得する
   * @param materialId 教材ID
   * @returns フィードバック統計情報
   */
  static async getFeedbackStatistics(materialId: string): Promise<ApiResponse<FeedbackStatistics>> {
    try {
      // 教材に対する全レーティングを取得
      const { data, error } = await supabase
        .from('feedback')
        .select('rating')
        .eq('materialId', materialId);
      
      if (error) throw error;
      
      // 統計情報の計算
      const totalCount = data.length;
      
      if (totalCount === 0) {
        return {
          success: true,
          data: {
            averageRating: 0,
            totalCount: 0,
            ratingDistribution: [
              { rating: 5, count: 0, percentage: 0 },
              { rating: 4, count: 0, percentage: 0 },
              { rating: 3, count: 0, percentage: 0 },
              { rating: 2, count: 0, percentage: 0 },
              { rating: 1, count: 0, percentage: 0 }
            ]
          }
        };
      }
      
      // 平均評価を計算
      const sum = data.reduce((acc, item) => acc + item.rating, 0);
      const averageRating = Math.round((sum / totalCount) * 10) / 10; // 小数点第1位まで
      
      // 評価ごとの分布を計算
      const distribution = [5, 4, 3, 2, 1].map(rating => {
        const count = data.filter(item => item.rating === rating).length;
        const percentage = Math.round((count / totalCount) * 100);
        return { rating, count, percentage };
      });
      
      return {
        success: true,
        data: {
          averageRating,
          totalCount,
          ratingDistribution: distribution
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
} 
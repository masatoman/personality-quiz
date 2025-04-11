import { ActivityType as LearningActivityType } from '@/types/learning';
import { ActivityType as QuizActivityType, MaterialType } from '@/types/quiz';

/**
 * 活動タイプのユニオン型（learning.tsとquiz.tsの活動タイプを統合）
 */
export type ActivityType = LearningActivityType | QuizActivityType;

/**
 * 活動タイプのマッピング
 * learningとquizの型を相互に変換するために使用
 */
export const activityTypeMap: Record<string, ActivityType> = {
  // Learning型からのマッピング
  'complete_resource': 'CONSUME_CONTENT',
  'start_resource': 'CONSUME_CONTENT',
  'create_material': 'CREATE_CONTENT',
  'provide_feedback': 'PROVIDE_FEEDBACK',
  'daily_login': 'RECEIVE_FEEDBACK',
  'share_resource': 'SHARE_RESOURCE',
  'quiz_complete': 'CONSUME_CONTENT',
  
  // Quiz型からのマッピング
  'CREATE_CONTENT': 'create_material',
  'PROVIDE_FEEDBACK': 'provide_feedback',
  'CONSUME_CONTENT': 'complete_resource',
  'RECEIVE_FEEDBACK': 'daily_login',
  'SHARE_RESOURCE': 'share_resource',
  'ASK_QUESTION': 'start_resource'
};

/**
 * スコア変更オブジェクト
 */
export interface ScoreChange {
  giver: number;
  taker: number;
  matcher: number;
}

/**
 * ギバースコア集計用アクティビティインターフェイス
 */
export interface ScoreActivity {
  activityType: ActivityType;
  materialType?: MaterialType;
  timestamp: Date;
}

/**
 * パーソナリティタイプ
 */
export type PersonalityType = 'giver' | 'taker' | 'matcher';

/**
 * 活動タイプを変換する関数
 */
export function convertActivityType(
  type: string,
  targetFormat: 'learning' | 'quiz' = 'quiz'
): ActivityType {
  const mapped = activityTypeMap[type];
  if (!mapped) return type as ActivityType;
  
  if (targetFormat === 'learning') {
    // Quizフォーマットから学習フォーマットへ
    return mapped as LearningActivityType;
  } else {
    // 学習フォーマットからQuizフォーマットへ
    return mapped as QuizActivityType;
  }
} 
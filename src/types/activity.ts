// ユーザーアクティビティの型定義
import { ActivityType } from './learning';

export type { ActivityType };

export interface Activity {
  id: string;
  userId: string;
  activityType: ActivityType;
  referenceId?: string; // 関連コンテンツID
  points: number;
  createdAt: string;
}

// アクティビティポイントの設定
export const ACTIVITY_POINTS: Partial<Record<ActivityType, number>> = {
  CREATE_CONTENT: 10,    // コンテンツ作成は高ポイント
  PROVIDE_FEEDBACK: 5,   // フィードバック提供も価値が高い
  CONSUME_CONTENT: 1,    // コンテンツ消費は低ポイント
  SHARE_RESOURCE: 3,     // リソース共有は中程度
  ASK_QUESTION: 2,       // 質問も中低程度
  QUIZ_COMPLETE: 5,      // クイズ完了は中程度
  COMPLETE_RESOURCE: 3,  // リソース完了
  START_RESOURCE: 1,     // リソース開始
  RECEIVE_FEEDBACK: 2,   // フィードバック受領
  DAILY_LOGIN: 1        // デイリーログイン
};

// ギバースコアへの影響度
export const GIVER_IMPACT: Partial<Record<ActivityType, number>> = {
  CREATE_CONTENT: 1.0,    // 100%反映
  PROVIDE_FEEDBACK: 0.8,  // 80%反映
  CONSUME_CONTENT: 0.1,   // 10%反映
  SHARE_RESOURCE: 0.6,    // 60%反映
  ASK_QUESTION: 0.2,      // 20%反映
  QUIZ_COMPLETE: 0.4,     // 40%反映
  COMPLETE_RESOURCE: 0.3, // 30%反映
  START_RESOURCE: 0.1,    // 10%反映
  RECEIVE_FEEDBACK: 0.2,  // 20%反映
  DAILY_LOGIN: 0.1       // 10%反映
}; 
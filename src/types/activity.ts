// ユーザーアクティビティの型定義

export type ActivityType = 
  | 'CREATE_CONTENT'   // コンテンツ作成
  | 'PROVIDE_FEEDBACK' // フィードバック提供
  | 'CONSUME_CONTENT'  // コンテンツ消費
  | 'SHARE_RESOURCE'   // リソース共有
  | 'ASK_QUESTION'     // 質問
  | 'COMPLETE_QUIZ';   // クイズ完了

export interface Activity {
  id: string;
  userId: string;
  activityType: ActivityType;
  referenceId?: string; // 関連コンテンツID
  points: number;
  createdAt: string;
}

// アクティビティポイントの設定
export const ACTIVITY_POINTS: Record<ActivityType, number> = {
  CREATE_CONTENT: 10,    // コンテンツ作成は高ポイント
  PROVIDE_FEEDBACK: 5,   // フィードバック提供も価値が高い
  CONSUME_CONTENT: 1,    // コンテンツ消費は低ポイント
  SHARE_RESOURCE: 3,     // リソース共有は中程度
  ASK_QUESTION: 2,       // 質問も中低程度
  COMPLETE_QUIZ: 5       // クイズ完了は中程度
};

// ギバースコアへの影響度
export const GIVER_IMPACT: Record<ActivityType, number> = {
  CREATE_CONTENT: 1.0,    // 100%反映
  PROVIDE_FEEDBACK: 0.8,  // 80%反映
  CONSUME_CONTENT: 0.1,   // 10%反映
  SHARE_RESOURCE: 0.6,    // 60%反映
  ASK_QUESTION: 0.2,      // 20%反映
  COMPLETE_QUIZ: 0.4      // 40%反映
}; 
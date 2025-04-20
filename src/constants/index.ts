import { ActivityType } from '../types/learning';

// アクティビティごとのポイント配分
export const ACTIVITY_POINTS: Record<ActivityType, number> = {
  // リソース関連のアクティビティ
  COMPLETE_RESOURCE: 50,    // リソースの完了
  CREATE_CONTENT: 100,      // 新しいコンテンツの作成
  SHARE_RESOURCE: 30,       // リソースの共有
  
  // フィードバック関連のアクティビティ
  PROVIDE_FEEDBACK: 40,     // フィードバックの提供
  RECEIVE_FEEDBACK: 20,     // フィードバックの受領
  
  // 学習関連のアクティビティ
  START_LEARNING: 10,       // 学習の開始
  COMPLETE_QUIZ: 30,        // クイズの完了
  ACHIEVE_PERFECT_SCORE: 50,// 満点獲得
  
  // コミュニティ活動
  HELP_OTHERS: 60,         // 他者への支援
  PARTICIPATE_DISCUSSION: 25,// ディスカッションへの参加
  
  // 特別なアクティビティ
  DAILY_LOGIN: 5,          // 毎日のログイン
  WEEKLY_GOAL_ACHIEVED: 70 // 週間目標の達成
};

// レベルごとの必要ポイント閾値
export const ACHIEVEMENT_THRESHOLDS: number[] = [
  0,      // レベル1（初級）: 0ポイント
  500,    // レベル2（中級）: 500ポイント
  1500,   // レベル3（上級）: 1,500ポイント
  3000,   // レベル4（エキスパート）: 3,000ポイント
  6000,   // レベル5（マスター）: 6,000ポイント
  10000   // レベル6（グランドマスター）: 10,000ポイント
];

// レベルの名称
export const LEVEL_NAMES: string[] = [
  '初級',
  '中級',
  '上級',
  'エキスパート',
  'マスター',
  'グランドマスター'
];

// 通知タイプ
export const NOTIFICATION_TYPES = {
  POINTS_ADDED: 'POINTS_ADDED',
  LEVEL_UP: 'LEVEL_UP',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED'
} as const;

// アチーブメントの種類
export const ACHIEVEMENTS = {
  FIRST_CONTENT: 'FIRST_CONTENT',         // 最初のコンテンツ作成
  HELPFUL_MEMBER: 'HELPFUL_MEMBER',       // 10回の支援達成
  FEEDBACK_MASTER: 'FEEDBACK_MASTER',     // 50件のフィードバック提供
  CONSISTENT_LEARNER: 'CONSISTENT_LEARNER',// 30日連続ログイン
  PERFECT_SCORER: 'PERFECT_SCORER',       // 10回の満点獲得
  COMMUNITY_PILLAR: 'COMMUNITY_PILLAR'    // 100回のディスカッション参加
} as const; 
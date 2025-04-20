// 学習進捗関連の型定義

/**
 * 学習統計データを表す型
 */
export interface LearningStats {
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  totalPoints: number;
}

/**
 * 学習リソースを表す型
 */
export interface LearningResource {
  id: number | string;
  title: string;
  description?: string;
  resourceType: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  authorId?: string;
  isPublic?: boolean;
}

/**
 * 学習進捗データを表す型
 */
export interface LearningProgress {
  userId: string;
  resourceId: number | string;
  completionPercentage: number;
  lastUpdated: string;
  timeSpent?: number; // 学習に費やした総時間（秒）
  notes?: string;
  materials?: {
    id: number | string;
    title: string;
    thumbnail_url?: string | null;
    created_at: string;
  };
}

/**
 * ユーザーの最近のリソース（進捗情報付き）
 */
export interface RecentResource {
  id: number | string;
  title: string;
  thumbnailUrl?: string | null;
  completionPercentage: number;
  lastUpdated: string;
  resourceType?: string;
}

/**
 * 学習進捗のレベルを表す型
 */
export interface LearningLevel {
  number: number;
  title: string;
  requiredScore: number;
  benefits: string[];
}

// アクティビティの種類を定義
export type ActivityType =
  // リソース関連のアクティビティ
  | 'COMPLETE_RESOURCE'    // リソースの完了
  | 'CREATE_CONTENT'       // 新しいコンテンツの作成
  | 'SHARE_RESOURCE'       // リソースの共有
  
  // フィードバック関連のアクティビティ
  | 'PROVIDE_FEEDBACK'     // フィードバックの提供
  | 'RECEIVE_FEEDBACK'     // フィードバックの受領
  
  // 学習関連のアクティビティ
  | 'START_LEARNING'       // 学習の開始
  | 'COMPLETE_QUIZ'        // クイズの完了
  | 'ACHIEVE_PERFECT_SCORE'// 満点獲得
  
  // コミュニティ活動
  | 'HELP_OTHERS'         // 他者への支援
  | 'PARTICIPATE_DISCUSSION'// ディスカッションへの参加
  
  // 特別なアクティビティ
  | 'DAILY_LOGIN'         // 毎日のログイン
  | 'WEEKLY_GOAL_ACHIEVED'; // 週間目標の達成

// 通知タイプの定義
export type NotificationType = 
  | 'POINTS_ADDED'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED';

// アチーブメントの種類の定義
export type AchievementType =
  | 'FIRST_CONTENT'        // 最初のコンテンツ作成
  | 'HELPFUL_MEMBER'       // 10回の支援達成
  | 'FEEDBACK_MASTER'      // 50件のフィードバック提供
  | 'CONSISTENT_LEARNER'   // 30日連続ログイン
  | 'PERFECT_SCORER'       // 10回の満点獲得
  | 'COMMUNITY_PILLAR';    // 100回のディスカッション参加

// レベルの定義
export interface Level {
  id: number;
  name: string;
  requiredPoints: number;
  benefits: string[];
}

// アクティビティ履歴のインターフェース
export interface ActivityHistoryEntry {
  type: ActivityType;
  timestamp: Date;
  points: number;
  details?: {
    resourceId?: string;
    targetUserId?: string;
    achievementId?: string;
  };
}

/**
 * アクティビティごとの詳細情報を表す型
 */
export type ActivityDetails = {
  complete_resource: {
    resourceId: string | number;
    completionTime: number; // 秒単位
    score?: number;
  };
  start_resource: {
    resourceId: string | number;
    startTime: string;
  };
  create_material: {
    materialId: string | number;
    materialType: string;
    title: string;
  };
  provide_feedback: {
    targetId: string | number;
    targetType: 'resource' | 'material';
    rating: number;
    comment?: string;
  };
  daily_login: {
    loginStreak: number;
    bonusPoints?: number;
  };
  share_resource: {
    resourceId: string | number;
    platform: 'twitter' | 'facebook' | 'linkedin' | 'other';
    shareUrl?: string;
  };
  quiz_complete: {
    quizId: string | number;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number; // 秒単位
  };
};

/**
 * 学習アクティビティを表す型
 */
export interface LearningActivity {
  id: string;
  userId: string;
  activityType: ActivityType;
  referenceId?: string | number; // 関連リソースID
  points: number;
  createdAt: string;
  details?: ActivityDetails[keyof ActivityDetails];
}

/**
 * 学習コンテンツの難易度
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * 学習リソースの種類
 */
export type ResourceType = 'article' | 'video' | 'quiz' | 'exercise' | 'interactive' | 'other'; 
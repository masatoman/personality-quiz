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

/**
 * アクティビティタイプを表す型
 */
export type ActivityType = 
  | 'complete_resource' 
  | 'start_resource' 
  | 'create_material' 
  | 'provide_feedback' 
  | 'daily_login'
  | 'share_resource'
  | 'quiz_complete';

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
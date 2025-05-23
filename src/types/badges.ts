// バッジと達成システムの型定義

import { ActivityType } from './learning';

/**
 * バッジの種類を定義する型
 */
export type BadgeType = 
  | 'first_completion'
  | 'learning_streak'
  | 'multi_completion'
  | 'perfect_score'
  | 'fast_learner'
  | 'content_creator'
  | 'feedback_provider'
  | 'community_contributor'
  | 'diverse_learner'
  | 'giver_champion';

/**
 * バッジの要件を定義する型
 */
export interface BadgeRequirement {
  activityType: ActivityType;
  count: number;
  condition?: 'consecutive' | 'total';
  metadata?: {
    score?: number;
    time_limit?: number;
    unique_categories?: boolean;
    [key: string]: any;
  };
}

/**
 * バッジを定義する型
 */
export interface Badge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  iconUrl: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirements: BadgeRequirement[];
  progress: number;  // 0-100
  acquiredAt?: Date;
  isSecret?: boolean;
}

/**
 * ユーザーのバッジ獲得状況を定義する型
 */
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  acquired: boolean;
  acquiredAt: string | null;
  progress: number;
}

/**
 * 達成（アチーブメント）を定義する型
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  points: number;
  requirements: BadgeRequirement[];
  category: 'learning' | 'creation' | 'contribution' | 'social';
  isSecret?: boolean;
}

/**
 * ユーザーの達成状況を定義する型
 */
export interface UserAchievement {
  userId: string;
  achievementId: string;
  acquiredAt: Date;
  progress: number;  // 0-100
}

/**
 * イベントに基づくバッジ付与ルールを定義する型
 */
export interface BadgeRule {
  badgeType: BadgeType;
  condition: (activity: Record<string, any>, userStats: Record<string, any>) => boolean;
  priority: number;  // 優先度（高いほど先に評価）
}

/**
 * バッジ獲得通知を定義する型
 */
export interface BadgeNotification {
  userId: string;
  badge: Badge;
  acquiredAt: Date;
  isRead: boolean;
  message?: string;
} 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { BadgeRequirement, BadgeType, Badge } from '@/types/badges';
import { ActivityType } from '@/types/learning';
import { ActivitySummary } from '@/types/activitySummary';

/**
 * バッジ評価ユーティリティクラス
 * 様々な条件に基づいてバッジ要件を評価するための拡張可能なクラス
 */
export class BadgeEvaluator {
  private activitySummary: ActivitySummary;
  private currentActivityType: ActivityType;
  private badgeDefinitions: Partial<Record<BadgeType, Badge>> = {};

  constructor(
    activitySummary: ActivitySummary, 
    currentActivityType: ActivityType,
    badgeDefinitions: Partial<Record<BadgeType, Badge>> = {}
  ) {
    this.activitySummary = activitySummary;
    this.currentActivityType = currentActivityType;
    this.badgeDefinitions = badgeDefinitions;
  }

  public evaluateBadge(badgeType: BadgeType): boolean {
    const badgeDefinition = this.badgeDefinitions[badgeType];
    if (!badgeDefinition) {
      return false;
    }
    return this.evaluateAllRequirements(badgeDefinition.requirements);
  }

  private evaluateAllRequirements(requirements: BadgeRequirement[]): boolean {
    return requirements.every(req => this.evaluateRequirement(req));
  }

  private evaluateRequirement(requirement: BadgeRequirement): boolean {
    const activityCount = this.getActivityCount(requirement);
    return activityCount >= requirement.count;
  }

  private getActivityCount(requirement: BadgeRequirement): number {
    // ActivitySummary型の実際の構造に合わせてアクセス
    switch (requirement.activityType) {
      case 'complete_resource':
        return this.activitySummary.complete_resource_count || 0;
      case 'start_resource':
        return this.activitySummary.start_resource_count || 0;
      case 'create_material':
        return this.activitySummary.create_material_count || 0;
      case 'provide_feedback':
        return this.activitySummary.provide_feedback_count || 0;
      case 'daily_login':
        return this.activitySummary.daily_login_count || 0;
      case 'share_resource':
        return this.activitySummary.share_resource_count || 0;
      case 'quiz_complete':
        return this.activitySummary.quiz_complete_count || 0;
      default:
        return 0;
    }
  }

  /**
   * 特殊条件を持つかどうかを確認
   */
  private static hasSpecialCondition(requirement: BadgeRequirement): boolean {
    return !!requirement.condition;
  }

  /**
   * 特殊条件を評価
   */
  private static evaluateSpecialCondition(
    requirement: BadgeRequirement,
    activitySummary: Record<string, any>,
    currentActivityType?: ActivityType
  ): boolean {
    // 連続ログイン/アクティビティの評価
    if (requirement.condition === 'consecutive' && requirement.activityType === 'daily_login') {
      return (activitySummary.current_streak || 0) >= requirement.count;
    }

    // 他の特殊条件を追加可能
    return false;
  }

  /**
   * メタデータ条件を評価
   */
  private static evaluateMetadataCondition(
    requirement: BadgeRequirement,
    activitySummary: Record<string, any>,
    activityCount: number
  ): boolean {
    const { metadata } = requirement;
    
    if (!metadata) return false;

    // ユニークカテゴリ条件
    if (metadata.unique_categories && requirement.activityType === 'complete_resource') {
      const uniqueCategoriesCount = activitySummary.unique_categories_count || 0;
      return uniqueCategoriesCount >= requirement.count;
    }

    // 時間制限付きのアクティビティ
    if (metadata.time_limit && activitySummary.last_activity_time) {
      const activityTime = activitySummary.last_activity_time;
      return activityCount >= requirement.count && activityTime <= metadata.time_limit;
    }

    // スコア条件
    if (metadata.score !== undefined && activitySummary.last_score) {
      return activityCount >= requirement.count && activitySummary.last_score >= metadata.score;
    }

    // デフォルトはカウントベース
    return activityCount >= requirement.count;
  }
}
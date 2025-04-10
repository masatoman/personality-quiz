import { BadgeRequirement, BadgeType } from '@/types/badges';
import { ActivityType } from '@/types/learning';

/**
 * バッジ評価ユーティリティクラス
 * 様々な条件に基づいてバッジ要件を評価するための拡張可能なクラス
 */
export class BadgeEvaluator {
  /**
   * 特定の要件が満たされているかどうかを評価
   */
  static evaluateRequirement(
    requirement: BadgeRequirement, 
    activitySummary: Record<string, any>,
    currentActivityType?: ActivityType
  ): boolean {
    if (!activitySummary) return false;

    // アクティビティタイプに基づいたカウントを取得
    const activityTypeKey = `${requirement.activityType}_count`;
    const activityCount = activitySummary[activityTypeKey] || 0;

    // 特殊条件の評価
    if (this.hasSpecialCondition(requirement)) {
      return this.evaluateSpecialCondition(requirement, activitySummary, currentActivityType);
    }

    // メタデータ条件の評価
    if (requirement.metadata) {
      return this.evaluateMetadataCondition(requirement, activitySummary, activityCount);
    }

    // 標準的なカウントベースの評価
    return activityCount >= requirement.count;
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

  /**
   * すべての要件が満たされているかチェック
   */
  static evaluateAllRequirements(
    requirements: BadgeRequirement[],
    activitySummary: Record<string, any>,
    currentActivityType?: ActivityType
  ): boolean {
    return requirements.every(req => 
      this.evaluateRequirement(req, activitySummary, currentActivityType)
    );
  }
} 
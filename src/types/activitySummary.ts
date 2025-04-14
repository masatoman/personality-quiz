/**
 * アクティビティの統計情報を表すインターフェース
 */
export interface ActivityStats {
  createdMaterials: number;
  totalPoints: number;
  viewedMaterials: number;
  createdMaterialsChange: number;
  totalPointsChange: number;
  viewedMaterialsChange: number;
}

/**
 * アクティビティサマリーを表すインターフェース
 */
export interface ActivitySummary {
  // アクティビティタイプ別のカウント
  complete_resource_count: number;
  start_resource_count: number;
  create_material_count: number;
  provide_feedback_count: number;
  daily_login_count: number;
  share_resource_count: number;
  quiz_complete_count: number;

  // ストリーク情報
  current_streak: number;
  max_streak: number;

  // その他の統計情報
  unique_categories_count: number;
  last_score?: number;
}

/**
 * アクティビティカウントを表すインターフェース
 */
export interface ActivityCounts {
  CREATE_CONTENT: number;
  PROVIDE_FEEDBACK: number;
  CONSUME_CONTENT: number;
  COMPLETE_QUIZ: number;
} 
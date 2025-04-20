import { calculateScoreChange, recalculateScores, determinePersonalityType } from '@/utils/score';
import { UserActivityTracker } from '@/utils/activity/UserActivityTracker';
import { ActivityType as LearningActivityType } from '@/types/learning';
import { ActivityType as QuizActivityType } from '@/types/quiz';
import { ActivityType, ScoreActivity, convertActivityType } from '@/types/activity-score';

// UserActivityTrackerのモック
jest.mock('@/utils/activity/UserActivityTracker');

describe('GiverScoreCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ユーザー活動に基づくスコア計算', () => {
    it('活動履歴からギバースコアを計算できる', async () => {
      // モックの活動履歴を設定
      const mockActivities = [
        {
          userId: 'user123',
          activityType: 'create_material' as LearningActivityType,
          timestamp: new Date('2023-01-01'),
          details: { materialType: 'ARTICLE' }
        },
        {
          userId: 'user123',
          activityType: 'provide_feedback' as LearningActivityType,
          timestamp: new Date('2023-01-02'),
          details: { materialType: 'VIDEO' }
        },
        {
          userId: 'user123',
          activityType: 'complete_resource' as LearningActivityType,
          timestamp: new Date('2023-01-03'),
          details: { materialType: 'QUIZ' }
        }
      ];

      // UserActivityTrackerのgetUserActivitiesをモック
      (UserActivityTracker.getUserActivities as jest.Mock).mockResolvedValue(mockActivities);

      // 活動履歴を取得
      const userId = 'user123';
      const activities = await UserActivityTracker.getUserActivities(userId);

      // スコア計算用の活動データに変換
      const scoreActivities: ScoreActivity[] = activities.map(activity => ({
        activityType: convertActivityType(activity.activityType, 'quiz') as QuizActivityType,
        materialType: activity.details?.materialType || 'OTHER',
        timestamp: activity.timestamp
      }));

      // スコアを計算
      const scores = recalculateScores(scoreActivities);

      // 計算結果が期待どおりか検証
      expect(scores.giver).toBeGreaterThan(0);
      expect(scores.taker).toBeGreaterThan(0);
      expect(scores.matcher).toBeGreaterThan(0);

      // パーソナリティタイプを決定
      const personalityType = determinePersonalityType(
        scores.giver, 
        scores.taker, 
        scores.matcher
      );

      // タイプが有効な値か確認
      expect(['giver', 'taker', 'matcher']).toContain(personalityType);
    });

    it('活動タイプごとに適切なスコア変化が計算される', () => {
      // 各活動タイプのスコア変化をテスト
      const createMaterialScore = calculateScoreChange('CREATE_CONTENT' as QuizActivityType);
      const provideFeedbackScore = calculateScoreChange('PROVIDE_FEEDBACK' as QuizActivityType);
      const completeResourceScore = calculateScoreChange('CONSUME_CONTENT' as QuizActivityType);

      // 教材作成はギバースコアが高い
      expect(createMaterialScore.giver).toBeGreaterThan(createMaterialScore.taker);
      expect(createMaterialScore.giver).toBeGreaterThan(createMaterialScore.matcher);

      // フィードバック提供はマッチャースコアより高いギバースコア
      expect(provideFeedbackScore.giver).toBeGreaterThan(provideFeedbackScore.matcher);

      // リソース完了はテイカースコアが最も高い
      expect(completeResourceScore.taker).toBeGreaterThan(completeResourceScore.giver);
    });

    it('活動カウントからユーザーのタイプを予測できる', async () => {
      // 活動カウントのモック
      const mockSummary = {
        create_material_count: 10,  // ギバー活動が多い
        provide_feedback_count: 8,
        complete_resource_count: 5,
        daily_login_count: 20
      };

      // UserActivityTrackerのgetActivitySummaryをモック
      (UserActivityTracker.getActivitySummary as jest.Mock).mockResolvedValue(mockSummary);

      // 活動サマリーを取得
      const userId = 'user123';
      const summary = await UserActivityTracker.getActivitySummary(userId);

      // 活動カウントからスコアを推定
      const giverScore = summary.create_material_count * 5 + summary.provide_feedback_count * 3;
      const takerScore = summary.complete_resource_count * 2;
      const matcherScore = summary.create_material_count * 2 + summary.provide_feedback_count + summary.complete_resource_count;

      // 推定されたスコアに基づいてパーソナリティタイプを決定
      const personalityType = determinePersonalityType(giverScore, takerScore, matcherScore);

      // この活動パターンではギバータイプが予測される
      expect(personalityType).toBe('giver');
    });
  });
}); 
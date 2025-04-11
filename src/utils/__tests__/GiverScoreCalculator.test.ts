import { calculateScoreChange, recalculateScores, determinePersonalityType } from '@/utils/score';
import { UserActivityTracker } from '@/utils/activity/UserActivityTracker';
import { ActivityType as LearningActivityType } from '@/types/learning';
import { ActivityType as QuizActivityType } from '@/types/quiz';
import { ActivityType, ScoreActivity, convertActivityType } from '@/types/activity-score';
import { GIVER_IMPACT } from '@/types/activity';

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
      let giverScore = summary.create_material_count * 5 + summary.provide_feedback_count * 3;
      let takerScore = summary.complete_resource_count * 2;
      let matcherScore = summary.create_material_count * 2 + summary.provide_feedback_count + summary.complete_resource_count;

      // 推定されたスコアに基づいてパーソナリティタイプを決定
      const personalityType = determinePersonalityType(giverScore, takerScore, matcherScore);

      // この活動パターンではギバータイプが予測される
      expect(personalityType).toBe('giver');
    });
  });

  // app/__tests__/GiverScoreCalculator.test.tsから統合したテスト
  describe('活動タイプ別ギバーインパクト設定', () => {
    // テスト用の単純化した実装
    function calculateGiverScoreIncrement(activityType: ActivityType, basePoints: number): number {
      const impact = GIVER_IMPACT[activityType] || 0;
      return Math.round(basePoints * impact);
    }

    // ポイントの基本設定（仮定）
    const ACTIVITY_POINTS = {
      CREATE_CONTENT: 10,
      PROVIDE_FEEDBACK: 5,
      CONSUME_CONTENT: 1,
      SHARE_RESOURCE: 3,
      ASK_QUESTION: 2,
      COMPLETE_QUIZ: 5
    };

    it('コンテンツ作成は100%のギバースコアインパクトを持つ', () => {
      const activityType: ActivityType = 'CREATE_CONTENT';
      const basePoints = ACTIVITY_POINTS[activityType];
      const scoreIncrement = calculateGiverScoreIncrement(activityType, basePoints);
      
      // 100%反映なので、ベースポイントと同じ値になるはず
      expect(scoreIncrement).toBe(basePoints);
      expect(GIVER_IMPACT[activityType]).toBe(1.0);
    });

    it('フィードバック提供は80%のギバースコアインパクトを持つ', () => {
      const activityType: ActivityType = 'PROVIDE_FEEDBACK';
      const basePoints = ACTIVITY_POINTS[activityType];
      const scoreIncrement = calculateGiverScoreIncrement(activityType, basePoints);
      
      // 80%反映なので、ベースポイント×0.8の値に近くなるはず
      expect(scoreIncrement).toBe(Math.round(basePoints * 0.8));
      expect(GIVER_IMPACT[activityType]).toBe(0.8);
    });

    it('コンテンツ消費は10%のギバースコアインパクトを持つ', () => {
      const activityType: ActivityType = 'CONSUME_CONTENT';
      const basePoints = ACTIVITY_POINTS[activityType];
      const scoreIncrement = calculateGiverScoreIncrement(activityType, basePoints);
      
      // 10%反映なので、ベースポイント×0.1の値に近くなるはず
      expect(scoreIncrement).toBe(Math.round(basePoints * 0.1));
      expect(GIVER_IMPACT[activityType]).toBe(0.1);
    });

    it('リソース共有は60%のギバースコアインパクトを持つ', () => {
      const activityType: ActivityType = 'SHARE_RESOURCE';
      const basePoints = ACTIVITY_POINTS[activityType];
      const scoreIncrement = calculateGiverScoreIncrement(activityType, basePoints);
      
      // 60%反映なので、ベースポイント×0.6の値に近くなるはず
      expect(scoreIncrement).toBe(Math.round(basePoints * 0.6));
      expect(GIVER_IMPACT[activityType]).toBe(0.6);
    });

    it('全てのアクティビティタイプがギバーインパクト設定を持つ', () => {
      // 全ての活動タイプに対して設定があるか確認
      const activityTypes: ActivityType[] = [
        'CREATE_CONTENT',
        'PROVIDE_FEEDBACK',
        'CONSUME_CONTENT',
        'SHARE_RESOURCE',
        'ASK_QUESTION',
        'COMPLETE_QUIZ'
      ];
      
      activityTypes.forEach(type => {
        expect(GIVER_IMPACT[type]).toBeDefined();
        expect(typeof GIVER_IMPACT[type]).toBe('number');
        expect(GIVER_IMPACT[type]).toBeGreaterThanOrEqual(0);
        expect(GIVER_IMPACT[type]).toBeLessThanOrEqual(1);
      });
    });

    it('複数アクティビティの累積スコアが正しく計算される', () => {
      const activities: ActivityType[] = [
        'CREATE_CONTENT',
        'PROVIDE_FEEDBACK',
        'CONSUME_CONTENT',
        'SHARE_RESOURCE'
      ];
      
      let totalScore = 0;
      
      activities.forEach(activity => {
        const basePoints = ACTIVITY_POINTS[activity];
        const increment = calculateGiverScoreIncrement(activity, basePoints);
        totalScore += increment;
      });
      
      // 手動計算での期待値
      const expectedScore = 
        10 * 1.0 + // CREATE_CONTENT: 10ポイント × 100%
        5 * 0.8 +  // PROVIDE_FEEDBACK: 5ポイント × 80%
        1 * 0.1 +  // CONSUME_CONTENT: 1ポイント × 10%
        3 * 0.6;   // SHARE_RESOURCE: 3ポイント × 60%
      
      expect(totalScore).toBe(Math.round(expectedScore));
    });
  });
}); 
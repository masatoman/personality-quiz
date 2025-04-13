import { UserActivityTracker } from '@/utils/activity/UserActivityTracker';
import { calculateScoreChange, calculateGiverLevel } from '@/utils/score';
import { convertActivityType } from '@/types/activity-score';
import { ActivityType } from '@/types/learning';

// UserActivityTrackerのモック
jest.mock('@/utils/activity/UserActivityTracker');

// 仮のポイント計算関数（実際の実装に合わせて調整する）
function calculatePoints(activityType: ActivityType, details?: Record<string, any>): number {
  const basePoints: Record<ActivityType, number> = {
    'complete_resource': 5,
    'start_resource': 1,
    'create_material': 20,
    'provide_feedback': 10,
    'daily_login': 2,
    'share_resource': 3,
    'quiz_complete': 8
  };

  let points = basePoints[activityType] || 0;
  
  // 教材の難易度に応じたボーナス
  if (details?.difficulty === 'advanced') {
    points *= 1.5;
  } else if (details?.difficulty === 'intermediate') {
    points *= 1.2;
  }
  
  // クイズのスコアに応じたボーナス
  if (activityType === 'quiz_complete' && details?.score) {
    points += Math.floor(details.score / 10);
  }
  
  return Math.round(points);
}

// レベル計算関数（実際の実装に合わせて調整する）
function calculateLevel(totalPoints: number): number {
  if (totalPoints < 100) return 1;
  if (totalPoints < 300) return 2;
  if (totalPoints < 600) return 3;
  if (totalPoints < 1000) return 4;
  if (totalPoints < 1500) return 5;
  if (totalPoints < 2500) return 6;
  if (totalPoints < 4000) return 7;
  if (totalPoints < 6000) return 8;
  if (totalPoints < 10000) return 9;
  return 10;
}

describe('PointsCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('活動ポイント計算', () => {
    it('基本的な活動タイプごとに正しいポイントが計算される', () => {
      // 各活動タイプのポイントをテスト
      expect(calculatePoints('complete_resource')).toBe(5);
      expect(calculatePoints('create_material')).toBe(20);
      expect(calculatePoints('provide_feedback')).toBe(10);
      expect(calculatePoints('daily_login')).toBe(2);
    });

    it('難易度に応じたボーナスが適用される', () => {
      // 難易度がない場合
      const basePoints = calculatePoints('complete_resource');
      
      // 中級難易度（20%ボーナス）
      const intermediatePoints = calculatePoints('complete_resource', { difficulty: 'intermediate' });
      expect(intermediatePoints).toBe(Math.round(basePoints * 1.2));
      
      // 上級難易度（50%ボーナス）
      const advancedPoints = calculatePoints('complete_resource', { difficulty: 'advanced' });
      expect(advancedPoints).toBe(Math.round(basePoints * 1.5));
    });

    it('クイズスコアに応じたボーナスが適用される', () => {
      // 基本ポイント
      const basePoints = calculatePoints('quiz_complete');
      
      // 80点のクイズ（+8ポイント）
      const goodScorePoints = calculatePoints('quiz_complete', { score: 80 });
      expect(goodScorePoints).toBe(basePoints + 8);
      
      // 100点のクイズ（+10ポイント）
      const perfectScorePoints = calculatePoints('quiz_complete', { score: 100 });
      expect(perfectScorePoints).toBe(basePoints + 10);
    });
  });

  describe('ポイントとギバースコアの連携', () => {
    it('活動がポイントとギバースコアの両方に反映される', async () => {
      const userId = 'user123';
      const activityType: ActivityType = 'create_material';
      const details = { materialType: 'ARTICLE', difficulty: 'intermediate' };
      
      // 活動をトラッキング
      await UserActivityTracker.trackActivity(userId, activityType, details);
      
      // ポイントを計算
      const points = calculatePoints(activityType, details);
      expect(points).toBe(24); // 20 * 1.2 = 24（切り上げ）
      
      // 対応するギバースコアの変化を計算
      const quizActivityType = convertActivityType(activityType, 'quiz');
      const scoreChange = calculateScoreChange(quizActivityType);
      
      // ギバースコアに反映されることを確認
      expect(scoreChange.giver).toBeGreaterThan(0);
    });

    it('ギバースコアとレベルの関係が正しい', () => {
      // サンプルのギバースコア
      const giverScores = [0, 50, 150, 350, 950, 2000];
      
      // 対応する期待されるレベル
      const expectedLevels = [1, 1, 2, 4, 10, 10];
      
      // 各スコアに対するレベルをテスト
      giverScores.forEach((score, index) => {
        expect(calculateGiverLevel(score)).toBe(expectedLevels[index]);
      });
    });
  });

  describe('活動履歴と総ポイント', () => {
    it('活動履歴から総ポイントを正確に計算できる', async () => {
      // モックの活動履歴
      const mockActivities = [
        {
          userId: 'user123',
          activityType: 'daily_login' as ActivityType,
          timestamp: new Date('2023-01-01')
        },
        {
          userId: 'user123',
          activityType: 'complete_resource' as ActivityType,
          timestamp: new Date('2023-01-02'),
          details: { difficulty: 'beginner' }
        },
        {
          userId: 'user123',
          activityType: 'provide_feedback' as ActivityType,
          timestamp: new Date('2023-01-03'),
          details: { difficulty: 'intermediate' }
        }
      ];
      
      // UserActivityTrackerのgetUserActivitiesをモック
      (UserActivityTracker.getUserActivities as jest.Mock).mockResolvedValue(mockActivities);
      
      // 活動履歴を取得
      const userId = 'user123';
      const activities = await UserActivityTracker.getUserActivities(userId);
      
      // 総ポイントを計算
      let totalPoints = 0;
      activities.forEach(activity => {
        totalPoints += calculatePoints(activity.activityType, activity.details);
      });
      
      // 期待値: 日次ログイン(2) + リソース完了(5) + フィードバック(10*1.2=12) = 19
      expect(totalPoints).toBe(19);
      
      // このポイントでのレベルを計算
      const level = calculateLevel(totalPoints);
      expect(level).toBe(1); // 19ポイントはレベル1
    });

    it('レベルアップの条件が適切に設定されている', () => {
      // さまざまなポイントに対するレベルをテスト
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(299)).toBe(2);
      expect(calculateLevel(300)).toBe(3);
      expect(calculateLevel(9999)).toBe(9);
      expect(calculateLevel(10000)).toBe(10);
      expect(calculateLevel(20000)).toBe(10); // 最大レベル
    });
  });
}); 
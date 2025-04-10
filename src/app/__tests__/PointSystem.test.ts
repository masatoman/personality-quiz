import { ACTIVITY_POINTS } from '../../lib/api';
import { ActivityType } from '../../types/activity';

// テスト用にポイント計算機能を単純化した実装
const calculatePointsForActivity = (activityType: ActivityType): number => {
  return ACTIVITY_POINTS[activityType] || 0;
};

// ポイント使用処理のシミュレーション
const simulatePointsUsage = (
  availablePoints: number, 
  pointCost: number
): { success: boolean; remainingPoints: number } => {
  if (availablePoints < pointCost) {
    return { success: false, remainingPoints: availablePoints };
  }
  return { success: true, remainingPoints: availablePoints - pointCost };
};

describe('ポイントシステム', () => {
  describe('ポイント獲得機能', () => {
    it('教材作成では10ポイント獲得できる', () => {
      const points = calculatePointsForActivity('CREATE_CONTENT');
      expect(points).toBe(10);
    });

    it('フィードバック提供では3ポイント獲得できる', () => {
      const points = calculatePointsForActivity('PROVIDE_FEEDBACK');
      expect(points).toBe(3);
    });

    it('コンテンツ消費では1ポイント獲得できる', () => {
      const points = calculatePointsForActivity('CONSUME_CONTENT');
      expect(points).toBe(1);
    });

    it('質問投稿では1ポイント獲得できる', () => {
      const points = calculatePointsForActivity('ASK_QUESTION');
      expect(points).toBe(1);
    });

    it('複数のアクティビティによる累積ポイントが正しく計算される', () => {
      const activityTypes: ActivityType[] = [
        'CREATE_CONTENT',
        'PROVIDE_FEEDBACK',
        'CONSUME_CONTENT',
        'ASK_QUESTION'
      ];
      
      const totalPoints = activityTypes.reduce((sum, type) => {
        return sum + calculatePointsForActivity(type);
      }, 0);
      
      // 手動計算: 10 + 3 + 1 + 1 = 15
      expect(totalPoints).toBe(15);
    });

    it('未定義のアクティビティでは0ポイント獲得となる', () => {
      // @ts-ignore - テスト用に意図的に不正な値を使用
      const points = calculatePointsForActivity('INVALID_ACTIVITY');
      expect(points).toBe(0);
    });
  });

  describe('ポイント使用機能', () => {
    it('十分なポイントがある場合は使用に成功する', () => {
      const availablePoints = 100;
      const pointCost = 50;
      
      const result = simulatePointsUsage(availablePoints, pointCost);
      
      expect(result.success).toBe(true);
      expect(result.remainingPoints).toBe(50);
    });

    it('ポイントが不足している場合は使用に失敗する', () => {
      const availablePoints = 30;
      const pointCost = 50;
      
      const result = simulatePointsUsage(availablePoints, pointCost);
      
      expect(result.success).toBe(false);
      expect(result.remainingPoints).toBe(30); // 変化なし
    });

    it('ちょうどのポイント数でも使用に成功する', () => {
      const availablePoints = 50;
      const pointCost = 50;
      
      const result = simulatePointsUsage(availablePoints, pointCost);
      
      expect(result.success).toBe(true);
      expect(result.remainingPoints).toBe(0);
    });

    it('連続使用の場合、残りポイントが正確に計算される', () => {
      let currentPoints = 100;
      
      // 1回目の使用: 30ポイント
      const firstUsage = simulatePointsUsage(currentPoints, 30);
      expect(firstUsage.success).toBe(true);
      currentPoints = firstUsage.remainingPoints;
      expect(currentPoints).toBe(70);
      
      // 2回目の使用: 50ポイント
      const secondUsage = simulatePointsUsage(currentPoints, 50);
      expect(secondUsage.success).toBe(true);
      currentPoints = secondUsage.remainingPoints;
      expect(currentPoints).toBe(20);
      
      // 3回目の使用: 30ポイント（失敗するはず）
      const thirdUsage = simulatePointsUsage(currentPoints, 30);
      expect(thirdUsage.success).toBe(false);
      currentPoints = thirdUsage.remainingPoints;
      expect(currentPoints).toBe(20); // 変化なし
    });
  });
}); 
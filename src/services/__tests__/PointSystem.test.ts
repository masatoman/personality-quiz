import { PointSystem } from '../PointSystem';
import { ActivityType } from '../../types/learning';

describe('PointSystem', () => {
  let pointSystem: PointSystem;

  beforeEach(() => {
    pointSystem = new PointSystem();
  });

  describe('基本的なポイント操作', () => {
    test('初期ポイントは0である', () => {
      expect(pointSystem.getTotalPoints()).toBe(0);
    });

    test('アクティビティ完了でポイントが加算される', () => {
      pointSystem.addPoints('COMPLETE_RESOURCE', 10);
      expect(pointSystem.getTotalPoints()).toBe(10);
    });

    test('複数のアクティビティでポイントが累積される', () => {
      pointSystem.addPoints('COMPLETE_RESOURCE', 10);
      pointSystem.addPoints('PROVIDE_FEEDBACK', 5);
      expect(pointSystem.getTotalPoints()).toBe(15);
    });
  });

  describe('アクティビティ履歴', () => {
    test('アクティビティ履歴が正しく記録される', () => {
      const activity1: ActivityType = 'COMPLETE_RESOURCE';
      const activity2: ActivityType = 'PROVIDE_FEEDBACK';

      pointSystem.addPoints(activity1, 10);
      pointSystem.addPoints(activity2, 5);

      const history = pointSystem.getActivityHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toEqual(expect.objectContaining({
        type: activity1,
        points: 10
      }));
      expect(history[1]).toEqual(expect.objectContaining({
        type: activity2,
        points: 5
      }));
    });
  });

  describe('レベル計算', () => {
    test('初期レベルは1である', () => {
      expect(pointSystem.getCurrentLevel()).toBe(1);
    });

    test('ポイントに応じて正しいレベルが計算される', () => {
      // レベル2になるのに必要なポイントを加算
      pointSystem.addPoints('COMPLETE_RESOURCE', 100);
      expect(pointSystem.getCurrentLevel()).toBe(2);

      // レベル3になるのに必要なポイントを加算
      pointSystem.addPoints('PROVIDE_FEEDBACK', 150);
      expect(pointSystem.getCurrentLevel()).toBe(3);
    });

    test('次のレベルまでの必要ポイントが正しく計算される', () => {
      pointSystem.addPoints('COMPLETE_RESOURCE', 50);
      const pointsNeeded = pointSystem.getPointsToNextLevel();
      expect(pointsNeeded).toBeGreaterThan(0);
      expect(typeof pointsNeeded).toBe('number');
    });
  });
}); 
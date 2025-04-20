import { PointsSystem, INotificationService, IAchievementService } from '../PointsSystem';
import { ActivityType } from '../../types/learning';
import { ACTIVITY_POINTS, ACHIEVEMENT_THRESHOLDS } from '../../constants/points';

describe('PointsSystem', () => {
  let pointsSystem: PointsSystem;
  let originalDate: DateConstructor;

  beforeAll(() => {
    originalDate = global.Date;
  });

  beforeEach(() => {
    pointsSystem = new PointsSystem();
    // 日時をモック
    global.Date = class extends Date {
      constructor() {
        super();
        return new originalDate('2024-01-01T10:00:00Z');
      }
    } as DateConstructor;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  describe('基本的なポイント操作', () => {
    test('初期ポイントは0である', () => {
      expect(pointsSystem.getTotalPoints()).toBe(0);
    });

    test('アクティビティ完了でポイントが加算される', async () => {
      const points = await pointsSystem.addPoints('COMPLETE_RESOURCE');
      expect(points).toBe(ACTIVITY_POINTS.COMPLETE_RESOURCE);
      expect(pointsSystem.getTotalPoints()).toBe(ACTIVITY_POINTS.COMPLETE_RESOURCE);
    });

    test('複数のアクティビティでポイントが累積される', async () => {
      await pointsSystem.addPoints('COMPLETE_RESOURCE');
      await pointsSystem.addPoints('PROVIDE_FEEDBACK');
      expect(pointsSystem.getTotalPoints()).toBe(
        ACTIVITY_POINTS.COMPLETE_RESOURCE + ACTIVITY_POINTS.PROVIDE_FEEDBACK
      );
    });

    test('未定義のアクティビティタイプは0ポイントを返す', async () => {
      const points = await pointsSystem.addPoints('UNKNOWN_ACTIVITY' as ActivityType);
      expect(points).toBe(0);
      expect(pointsSystem.getTotalPoints()).toBe(0);
    });
  });

  describe('アクティビティ履歴', () => {
    test('アクティビティ履歴が正しく記録される', async () => {
      await pointsSystem.addPoints('COMPLETE_RESOURCE');
      await pointsSystem.addPoints('PROVIDE_FEEDBACK');

      const history = pointsSystem.getActivityHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toEqual({
        type: 'COMPLETE_RESOURCE',
        points: ACTIVITY_POINTS.COMPLETE_RESOURCE,
        timestamp: new Date('2024-01-01T10:00:00Z')
      });
      expect(history[1]).toEqual({
        type: 'PROVIDE_FEEDBACK',
        points: ACTIVITY_POINTS.PROVIDE_FEEDBACK,
        timestamp: new Date('2024-01-01T10:00:00Z')
      });
    });

    test('履歴の取得は元のデータに影響を与えない', async () => {
      await pointsSystem.addPoints('COMPLETE_RESOURCE');
      const history1 = pointsSystem.getActivityHistory();
      const history2 = pointsSystem.getActivityHistory();

      expect(history1).not.toBe(history2); // 異なるインスタンス
      expect(history1).toEqual(history2); // 同じ内容
    });
  });

  describe('レベル計算とイベント', () => {
    test('初期レベルはNOVICEである', () => {
      expect(pointsSystem.getCurrentLevel()).toBe('NOVICE');
    });

    test('ポイントに応じて正しいレベルが計算される', async () => {
      while (pointsSystem.getTotalPoints() < ACHIEVEMENT_THRESHOLDS.BEGINNER) {
        await pointsSystem.addPoints('CREATE_CONTENT');
      }
      expect(pointsSystem.getCurrentLevel()).toBe('BEGINNER');

      while (pointsSystem.getTotalPoints() < ACHIEVEMENT_THRESHOLDS.INTERMEDIATE) {
        await pointsSystem.addPoints('CREATE_CONTENT');
      }
      expect(pointsSystem.getCurrentLevel()).toBe('INTERMEDIATE');
    });

    test('レベルアップ時にイベントが発火される', async () => {
      const mockCallback = jest.fn() as jest.MockedFunction<(event: {
        oldLevel: string;
        newLevel: string;
        totalPoints: number;
      }) => void>;
      pointsSystem.on('levelUp', mockCallback);

      while (pointsSystem.getTotalPoints() < ACHIEVEMENT_THRESHOLDS.BEGINNER) {
        await pointsSystem.addPoints('CREATE_CONTENT');
      }

      expect(mockCallback).toHaveBeenCalledWith({
        oldLevel: 'NOVICE',
        newLevel: 'BEGINNER',
        totalPoints: pointsSystem.getTotalPoints()
      });
    });
  });

  describe('外部サービス連携', () => {
    const mockNotificationService = {
      notify: jest.fn().mockResolvedValue(undefined)
    } as unknown as INotificationService;

    const mockAchievementService = {
      unlockAchievement: jest.fn().mockResolvedValue(undefined)
    } as unknown as IAchievementService;

    beforeEach(() => {
      pointsSystem.setNotificationService(mockNotificationService);
      pointsSystem.setAchievementService(mockAchievementService);
      jest.clearAllMocks();
    });

    test('レベルアップ時に外部サービスに通知される', async () => {
      while (pointsSystem.getTotalPoints() < ACHIEVEMENT_THRESHOLDS.BEGINNER) {
        await pointsSystem.addPoints('CREATE_CONTENT');
      }

      expect(mockNotificationService.notify).toHaveBeenCalledWith({
        type: 'LEVEL_UP',
        oldLevel: 'NOVICE',
        newLevel: 'BEGINNER'
      });

      expect(mockAchievementService.unlockAchievement).toHaveBeenCalledWith({
        type: 'UNLOCK_ACHIEVEMENT',
        achievement: 'BEGINNER_LEVEL_REACHED'
      });
    });

    test('外部サービスのエラーが処理を中断しない', async () => {
      (mockNotificationService.notify as jest.Mock).mockRejectedValueOnce(
        new Error('Service unavailable')
      );

      await expect(async () => {
        while (pointsSystem.getTotalPoints() < ACHIEVEMENT_THRESHOLDS.BEGINNER) {
          await pointsSystem.addPoints('CREATE_CONTENT');
        }
      }).not.toThrow();

      expect(pointsSystem.getCurrentLevel()).toBe('BEGINNER');
    });
  });
}); 
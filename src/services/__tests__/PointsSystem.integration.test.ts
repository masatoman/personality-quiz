import { PointsSystem } from '../PointsSystem';
import { ACTIVITY_POINTS, ACHIEVEMENT_THRESHOLDS } from '../../constants';
import { IActivityService, IUserService, INotificationService, IActivity } from '../interfaces';

describe('PointsSystem Integration Tests', () => {
  const userId = 'test-user-123';
  const fixedDate = new Date('2024-01-01T00:00:00Z');
  let pointsSystem: PointsSystem;
  let activityService: jest.Mocked<IActivityService>;
  let userService: jest.Mocked<IUserService>;
  let notificationService: jest.Mocked<INotificationService>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);

    activityService = {
      setPointsSystem: jest.fn(),
      completeActivity: jest.fn().mockResolvedValue(undefined),
      getUserActivityHistory: jest.fn().mockResolvedValue([])
    };

    userService = {
      setPointsSystem: jest.fn(),
      getUserPoints: jest.fn().mockResolvedValue(0)
    };

    notificationService = {
      notify: jest.fn().mockResolvedValue(undefined)
    };

    pointsSystem = new PointsSystem();
    pointsSystem.setNotificationService(notificationService);
    pointsSystem.setActivityService(activityService);
    pointsSystem.setUserService(userService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should add points and update user info when activity is completed', async () => {
    const activity: IActivity = {
      userId,
      type: 'COMPLETE_RESOURCE',
      resourceId: 'resource-123'
    };

    await pointsSystem.addPoints(userId, ACTIVITY_POINTS[activity.type], activity);

    expect(userService.getUserPoints).toHaveBeenCalledWith(userId);
    expect(activityService.completeActivity).toHaveBeenCalledWith(activity);
    expect(notificationService.notify).toHaveBeenCalledWith({
      type: 'POINTS_ADDED',
      oldLevel: '1',
      newLevel: '1'
    });
  });

  it('should handle multiple activities and level-ups correctly', async () => {
    const activities: IActivity[] = [
      { userId, type: 'COMPLETE_RESOURCE', resourceId: 'resource-1' },
      { userId, type: 'PROVIDE_FEEDBACK', resourceId: 'resource-2' },
      { userId, type: 'SHARE_RESOURCE', resourceId: 'resource-3' }
    ];

    for (const activity of activities) {
      await pointsSystem.addPoints(userId, ACTIVITY_POINTS[activity.type], activity);
    }

    const totalPoints = activities.reduce((sum, activity) => sum + ACTIVITY_POINTS[activity.type], 0);
    expect(await pointsSystem.getPoints(userId)).toBe(totalPoints);
  });

  it('should maintain point calculation integrity during concurrent activities', async () => {
    const activities: IActivity[] = [
      { userId, type: 'COMPLETE_RESOURCE', resourceId: 'resource-1' },
      { userId, type: 'COMPLETE_RESOURCE', resourceId: 'resource-2' }
    ];

    await Promise.all(
      activities.map(activity => 
        pointsSystem.addPoints(userId, ACTIVITY_POINTS[activity.type], activity)
      )
    );

    const expectedPoints = ACTIVITY_POINTS['COMPLETE_RESOURCE'] * 2;
    expect(await pointsSystem.getPoints(userId)).toBe(expectedPoints);
  });

  it('should handle notification errors gracefully', async () => {
    notificationService.notify.mockRejectedValueOnce(new Error('Notification failed'));

    const activity: IActivity = {
      userId,
      type: 'COMPLETE_RESOURCE',
      resourceId: 'resource-123'
    };

    await expect(
      pointsSystem.addPoints(userId, ACTIVITY_POINTS[activity.type], activity)
    ).resolves.not.toThrow();

    expect(await pointsSystem.getPoints(userId)).toBe(ACTIVITY_POINTS[activity.type]);
  });

  it('should handle level up notifications correctly', async () => {
    userService.getUserPoints.mockResolvedValueOnce(ACHIEVEMENT_THRESHOLDS[1] - 10);
    
    const activity: IActivity = {
      userId,
      type: 'COMPLETE_RESOURCE',
      resourceId: 'resource-123'
    };

    const points = ACTIVITY_POINTS[activity.type];
    await pointsSystem.addPoints(userId, points, activity);

    expect(notificationService.notify).toHaveBeenCalledWith({
      type: 'LEVEL_UP',
      oldLevel: '1',
      newLevel: '2'
    });
  });

  it('should handle invalid activity types gracefully', async () => {
    const invalidActivity: IActivity = {
      userId,
      type: 'INVALID_TYPE' as ActivityType,
      resourceId: 'resource-123'
    };

    await expect(
      pointsSystem.addPoints(userId, 0, invalidActivity)
    ).rejects.toThrow('Invalid activity type');
  });

  it('should prevent negative points', async () => {
    const activity: IActivity = {
      userId,
      type: 'COMPLETE_RESOURCE',
      resourceId: 'resource-123'
    };

    await expect(
      pointsSystem.addPoints(userId, -10, activity)
    ).rejects.toThrow('Points cannot be negative');
  });

  it('should handle service initialization errors', async () => {
    const uninitializedPointsSystem = new PointsSystem();
    const activity: IActivity = {
      userId,
      type: 'COMPLETE_RESOURCE',
      resourceId: 'resource-123'
    };

    await expect(
      uninitializedPointsSystem.addPoints(userId, ACTIVITY_POINTS[activity.type], activity)
    ).rejects.toThrow('Services not properly initialized');
  });

  it('should maintain activity history correctly', async () => {
    const activity: IActivity = {
      userId,
      type: 'COMPLETE_RESOURCE',
      resourceId: 'resource-123'
    };

    const mockHistory = [
      { ...activity, points: ACTIVITY_POINTS[activity.type], timestamp: fixedDate }
    ];
    activityService.getUserActivityHistory.mockResolvedValueOnce(mockHistory);

    const history = await pointsSystem.getActivityHistory(userId);
    expect(history).toEqual(mockHistory);
    expect(activityService.getUserActivityHistory).toHaveBeenCalledWith(userId);
  });

  describe('User Activity Flow Integration', () => {
    it('should handle a complete learning session flow', async () => {
      const activities: IActivity[] = [
        { userId, type: 'START_LEARNING', resourceId: 'course-1' },
        { userId, type: 'COMPLETE_QUIZ', resourceId: 'quiz-1' },
        { userId, type: 'ACHIEVE_PERFECT_SCORE', resourceId: 'quiz-1' },
        { userId, type: 'PROVIDE_FEEDBACK', resourceId: 'course-1' }
      ];

      let accumulatedPoints = 0;
      for (const activity of activities) {
        const points = ACTIVITY_POINTS[activity.type];
        accumulatedPoints += points;
        userService.getUserPoints.mockResolvedValueOnce(accumulatedPoints - points);
        
        await pointsSystem.addPoints(userId, points, activity);
        
        expect(activityService.completeActivity).toHaveBeenCalledWith(activity);
      }

      expect(await pointsSystem.getPoints(userId)).toBe(accumulatedPoints);
    });

    it('should track daily login streak correctly', async () => {
      const loginActivity: IActivity = {
        userId,
        type: 'DAILY_LOGIN',
        resourceId: 'login'
      };

      // 3日連続ログインをシミュレート
      for (let i = 0; i < 3; i++) {
        const currentDate = new Date(fixedDate);
        currentDate.setDate(currentDate.getDate() + i);
        jest.setSystemTime(currentDate);

        const points = ACTIVITY_POINTS[loginActivity.type];
        userService.getUserPoints.mockResolvedValueOnce(points * i);
        
        await pointsSystem.addPoints(userId, points, loginActivity);
      }

      const history = await pointsSystem.getActivityHistory(userId);
      expect(history.length).toBe(3);
      expect(history.every(entry => entry.type === 'DAILY_LOGIN')).toBe(true);
    });

    it('should handle community participation flow', async () => {
      const communityActivities: IActivity[] = [
        { userId, type: 'HELP_OTHERS', resourceId: 'question-1' },
        { userId, type: 'PARTICIPATE_DISCUSSION', resourceId: 'discussion-1' },
        { userId, type: 'SHARE_RESOURCE', resourceId: 'resource-1' }
      ];

      let totalPoints = 0;
      const activityHistory: any[] = [];

      for (const activity of communityActivities) {
        const points = ACTIVITY_POINTS[activity.type];
        totalPoints += points;
        
        activityHistory.push({
          ...activity,
          points,
          timestamp: new Date()
        });

        userService.getUserPoints.mockResolvedValueOnce(totalPoints - points);
        activityService.getUserActivityHistory.mockResolvedValueOnce([...activityHistory]);

        await pointsSystem.addPoints(userId, points, activity);
      }

      const history = await pointsSystem.getActivityHistory(userId);
      expect(history).toHaveLength(communityActivities.length);
      expect(await pointsSystem.getPoints(userId)).toBe(totalPoints);
    });

    it('should handle content creation and feedback cycle', async () => {
      const contentActivities: IActivity[] = [
        { userId, type: 'CREATE_CONTENT', resourceId: 'content-1' },
        { userId, type: 'RECEIVE_FEEDBACK', resourceId: 'content-1' },
        { userId, type: 'PROVIDE_FEEDBACK', resourceId: 'content-2' }
      ];

      let currentPoints = 0;
      for (const activity of contentActivities) {
        const points = ACTIVITY_POINTS[activity.type];
        userService.getUserPoints.mockResolvedValueOnce(currentPoints);
        currentPoints += points;

        await pointsSystem.addPoints(userId, points, activity);
      }

      expect(notificationService.notify).toHaveBeenCalledTimes(contentActivities.length);
      expect(await pointsSystem.getPoints(userId)).toBe(currentPoints);
    });

    it('should handle weekly goal achievement flow', async () => {
      const weeklyActivity: IActivity = {
        userId,
        type: 'WEEKLY_GOAL_ACHIEVED',
        resourceId: 'week-1'
      };

      userService.getUserPoints.mockResolvedValueOnce(ACHIEVEMENT_THRESHOLDS[1] - ACTIVITY_POINTS[weeklyActivity.type]);

      await pointsSystem.addPoints(userId, ACTIVITY_POINTS[weeklyActivity.type], weeklyActivity);

      expect(notificationService.notify).toHaveBeenCalledWith({
        type: 'LEVEL_UP',
        oldLevel: '1',
        newLevel: '2'
      });
    });
  });
}); 
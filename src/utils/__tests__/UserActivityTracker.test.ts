import { ActivityType } from '@/types/learning';
import { UserActivityTracker, UserActivity } from '../activity/UserActivityTracker';

jest.mock('@/lib/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  then: jest.fn().mockImplementation((callback) => callback({ data: [], error: null }))
}));

describe('UserActivityTracker', () => {
  beforeEach(() => {
    jest.spyOn(UserActivityTracker, 'trackActivity');
    jest.spyOn(UserActivityTracker, 'getUserActivities').mockResolvedValue([]);
    jest.spyOn(UserActivityTracker, 'getLatestActivity').mockResolvedValue(null);
    jest.spyOn(UserActivityTracker, 'getActivityCount').mockResolvedValue(0);
    
    // 日付を固定
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01'));
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  
  describe('trackActivity', () => {
    it('正しいユーザー活動データを作成する', async () => {
      const userId = 'user123';
      const activityType: ActivityType = 'complete_resource';
      const details = { resourceId: 'resource456', completionTime: 300 };
      
      const result = await UserActivityTracker.trackActivity(userId, activityType, details);
      
      expect(result).toEqual({
        userId,
        activityType,
        timestamp: new Date('2023-01-01'),
        details
      });
      
      expect(UserActivityTracker.trackActivity).toHaveBeenCalledWith(
        userId, 
        activityType, 
        details
      );
    });
    
    it('詳細情報なしでも活動を追跡できる', async () => {
      const userId = 'user123';
      const activityType: ActivityType = 'daily_login';
      
      const result = await UserActivityTracker.trackActivity(userId, activityType);
      
      expect(result).toEqual({
        userId,
        activityType,
        timestamp: new Date('2023-01-01'),
        details: undefined
      });
    });
  });
  
  describe('getUserActivities', () => {
    it('ユーザーの活動履歴を取得する', async () => {
      const userId = 'user123';
      const activities: UserActivity[] = [
        {
          userId,
          activityType: 'daily_login',
          timestamp: new Date('2023-01-01')
        },
        {
          userId,
          activityType: 'complete_resource',
          timestamp: new Date('2023-01-01'),
          details: { resourceId: 'resource456' }
        }
      ];
      
      (UserActivityTracker.getUserActivities as jest.Mock).mockResolvedValueOnce(activities);
      
      const result = await UserActivityTracker.getUserActivities(userId);
      
      expect(result).toEqual(activities);
      expect(UserActivityTracker.getUserActivities).toHaveBeenCalledWith(userId);
    });
    
    it('日付範囲を指定して活動履歴を取得する', async () => {
      const userId = 'user123';
      const fromDate = new Date('2022-12-01');
      const toDate = new Date('2022-12-31');
      
      await UserActivityTracker.getUserActivities(userId, fromDate, toDate);
      
      expect(UserActivityTracker.getUserActivities).toHaveBeenCalledWith(userId, fromDate, toDate);
    });
  });
  
  describe('getLatestActivity', () => {
    it('ユーザーの最新活動を取得する', async () => {
      const userId = 'user123';
      const latestActivity: UserActivity = {
        userId,
        activityType: 'complete_resource',
        timestamp: new Date('2023-01-01'),
        details: { resourceId: 'resource789' }
      };
      
      (UserActivityTracker.getLatestActivity as jest.Mock).mockResolvedValueOnce(latestActivity);
      
      const result = await UserActivityTracker.getLatestActivity(userId);
      
      expect(result).toEqual(latestActivity);
      expect(UserActivityTracker.getLatestActivity).toHaveBeenCalledWith(userId);
    });
    
    it('特定タイプの最新活動を取得する', async () => {
      const userId = 'user123';
      const activityType: ActivityType = 'daily_login';
      
      await UserActivityTracker.getLatestActivity(userId, activityType);
      
      expect(UserActivityTracker.getLatestActivity).toHaveBeenCalledWith(userId, activityType);
    });
  });
  
  describe('getActivityCount', () => {
    it('特定タイプの活動回数をカウントする', async () => {
      const userId = 'user123';
      const activityType: ActivityType = 'complete_resource';
      const count = 5;
      
      (UserActivityTracker.getActivityCount as jest.Mock).mockResolvedValueOnce(count);
      
      const result = await UserActivityTracker.getActivityCount(userId, activityType);
      
      expect(result).toBe(count);
      expect(UserActivityTracker.getActivityCount).toHaveBeenCalledWith(
        userId, 
        activityType
      );
    });
    
    it('日付範囲を指定して活動回数をカウントする', async () => {
      const userId = 'user123';
      const activityType: ActivityType = 'provide_feedback';
      const fromDate = new Date('2022-12-01');
      const toDate = new Date('2022-12-31');
      
      await UserActivityTracker.getActivityCount(userId, activityType, fromDate, toDate);
      
      expect(UserActivityTracker.getActivityCount).toHaveBeenCalledWith(
        userId, 
        activityType, 
        fromDate, 
        toDate
      );
    });
  });

  describe('getActivitySummary', () => {
    it('ユーザーの活動サマリーを取得する', async () => {
      const userId = 'user123';
      const summary = {
        complete_resource_count: 5,
        create_material_count: 2,
        provide_feedback_count: 3,
        current_streak: 7,
        unique_categories_count: 4
      };
      
      jest.spyOn(UserActivityTracker, 'getActivitySummary').mockResolvedValueOnce(summary);
      
      const result = await UserActivityTracker.getActivitySummary(userId);
      
      expect(result).toEqual(summary);
      expect(UserActivityTracker.getActivitySummary).toHaveBeenCalledWith(userId);
    });
  });
}); 
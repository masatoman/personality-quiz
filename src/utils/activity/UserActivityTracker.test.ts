import { SupabaseClient } from '@supabase/supabase-js';
import { UserActivityTracker, ActivityType, UserActivity, ActivityDetails, LessonActivityDetails } from './UserActivityTracker';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// モックチェーンの型定義
interface MockChain {
  select: Mock<[], MockChain>;
  eq: Mock<[string, any], MockChain>;
  order: Mock<[string, { ascending: boolean }], MockChain>;
  gte: Mock<[string, string], MockChain>;
  lte: Mock<[string, string], MockChain>;
  single: Mock<[], Promise<{ data: UserActivity<LessonActivityDetails> | null, error: null }>>;
  insert: Mock<[Partial<ActivityRecord>], Promise<{ data: { id: number } | null, error: null }>>;
}

// モックSupabaseClientの型定義
interface MockSupabaseClient {
  from: Mock<[string], MockChain>;
}

// データベースレコードの型定義
interface ActivityRecord {
  user_id: string;
  activity_type: ActivityType;
  timestamp: string;
  details?: LessonActivityDetails;
}

describe('UserActivityTracker', () => {
  let mockSupabaseClient: MockSupabaseClient;
  let mockChain: MockChain;

  const mockUserId = 'test-user-123';
  const mockTimestamp = new Date('2024-01-01T12:00:00Z');
  
  const validActivityTypes: ActivityType[] = [
    'COMPLETE_RESOURCE',
    'START_RESOURCE',
    'CREATE_CONTENT',
    'PROVIDE_FEEDBACK',
    'RECEIVE_FEEDBACK',
    'DAILY_LOGIN',
    'SHARE_RESOURCE',
    'QUIZ_COMPLETE',
    'ASK_QUESTION',
    'CONSUME_CONTENT'
  ];

  beforeEach(() => {
    mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null })
    } as unknown as MockChain;

    mockSupabaseClient = {
      from: vi.fn(() => mockChain)
    } as unknown as MockSupabaseClient;

    // @ts-ignore - プライベートフィールドへのアクセス
    UserActivityTracker.supabase = mockSupabaseClient;

    vi.clearAllMocks();
  });

  describe('trackActivity', () => {
    it('有効な活動タイプで活動を記録できる', async () => {
      for (const activityType of validActivityTypes) {
        const activity = await UserActivityTracker.trackActivity(
          mockUserId,
          activityType,
          { timestamp: mockTimestamp.toISOString() }
        );

        expect(activity).toEqual({
          userId: mockUserId,
          activityType,
          timestamp: mockTimestamp,
          details: { timestamp: mockTimestamp.toISOString() }
        });
      }
    });

    it('無効な活動タイプでエラーが発生する', async () => {
      // @ts-expect-error - 意図的に無効な活動タイプを使用
      await expect(UserActivityTracker.trackActivity(
        mockUserId,
        'INVALID_ACTIVITY',
        { timestamp: mockTimestamp.toISOString() }
      )).rejects.toThrow('無効な活動タイプです');
    });

    it('should handle errors when tracking activity fails', async () => {
      const userId = '1';
      const activityType = ActivityType.LOGIN;
      const details: ActivityDetails = { type: activityType, sessionId: '123' };
      const error = new Error('Database error');

      const mockChain = createMockChain();
      mockChain.insert.mockResolvedValue({ data: null, error });
      mockSupabaseClient.from.mockReturnValue(mockChain);

      await expect(UserActivityTracker.trackActivity(userId, activityType, details))
        .rejects.toThrow('Failed to track user activity');
    });

    it('正常に活動を記録できること', async () => {
      const userId = 'test-user';
      const activityType = ActivityType.COMPLETE_LESSON;
      const details: LessonActivityDetails = {
        lessonId: '123',
        progress: 1,
        completed: true,
        timestamp: new Date().toISOString()
      };

      mockSupabaseClient.from = jest.fn().mockImplementation(() => ({
        ...createMockChain(),
        insert: jest.fn().mockResolvedValue({ error: null }),
      }));

      const result = await UserActivityTracker.trackActivity(userId, activityType, details);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_activities');
      expect(mockSupabaseClient.from('user_activities').insert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: userId,
        activity_type: activityType,
        details
      }));
      expect(result).toEqual(expect.objectContaining({
        userId,
        activityType,
        details
      }));
    });

    it('エラー時に例外をスローすること', async () => {
      const userId = 'test-user';
      const activityType = ActivityType.COMPLETE_LESSON;
      const details: LessonActivityDetails = {
        lessonId: '123',
        progress: 0,
        completed: false,
        timestamp: new Date().toISOString()
      };

      mockSupabaseClient.from = jest.fn().mockImplementation(() => ({
        ...createMockChain(),
        insert: jest.fn().mockResolvedValue({ error: new Error('DB error') }),
      }));

      await expect(
        UserActivityTracker.trackActivity(userId, activityType, details)
      ).rejects.toThrow('Failed to track user activity');
    });
  });

  describe('getActivityHistory', () => {
    it('should return activity history for a user', async () => {
      const userId = '1';
      const mockActivities = [
        {
          id: 1,
          user_id: userId,
          activity_type: ActivityType.LOGIN,
          details: { sessionId: '123' },
          timestamp: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from = jest.fn().mockImplementation(() => ({
        ...createMockChain(),
        select: jest.fn().mockResolvedValue({ data: mockActivities, error: null }),
      }));

      const result = await UserActivityTracker.getActivityHistory(userId);
      expect(result).toEqual(mockActivities);
    });
  });

  describe('getActivitySummary', () => {
    it('should return activity summary for a user', async () => {
      const userId = '1';
      const mockActivities = [
        {
          id: 1,
          user_id: userId,
          activity_type: ActivityType.LOGIN,
          details: { sessionId: '123' },
          timestamp: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from = jest.fn().mockImplementation(() => ({
        ...createMockChain(),
        select: jest.fn().mockResolvedValue({ data: mockActivities, error: null }),
      }));

      const result = await UserActivityTracker.getActivitySummary(userId);
      expect(result).toEqual({
        totalActivities: 1,
        activityCounts: {
          [ActivityType.LOGIN]: 1,
        },
        lastActivity: mockActivities[0],
      });
    });
  });

  describe('getLatestActivity', () => {
    it('should return the latest activity', async () => {
      const mockActivity: UserActivity<LessonActivityDetails> = {
        id: 1,
        user_id: 'test-user',
        activity_type: ActivityType.LOGIN,
        timestamp: new Date().toISOString(),
        details: {
          lessonId: 'lesson-1',
          progress: 0,
          completed: false,
          timestamp: new Date().toISOString()
        }
      };

      (mockChain.single as jest.Mock).mockResolvedValueOnce({ data: mockActivity, error: null });

      const result = await UserActivityTracker.getLatestActivity('test-user');

      expect(result).toEqual(mockActivity);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_activities');
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user');
      expect(mockChain.order).toHaveBeenCalledWith('timestamp', { ascending: false });
      expect(mockChain.single).toHaveBeenCalled();
    });

    it('活動が見つからない場合nullを返すこと', async () => {
      mockSupabaseClient.from = jest.fn().mockImplementation(() => ({
        ...createMockChain(),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      }));

      const result = await UserActivityTracker.getLatestActivity('test-user');
      expect(result).toBeNull();
    });
  });
});

function createMockChain(): MockChain {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null })
  };
} 
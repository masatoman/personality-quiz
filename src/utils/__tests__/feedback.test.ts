import { FeedbackService } from '../feedback';
import supabase from '@/lib/supabase';

// モックの設定
jest.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn(),
    limit: jest.fn().mockReturnThis(),
  };
  return mockSupabase;
});

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('フィードバックを正常に送信できる', async () => {
      // モックの戻り値を設定
      const mockInsertResponse = {
        data: {
          id: 'feedback-123',
          materialId: 'material-456',
          userId: 'user-789',
          rating: 5,
          comment: 'とても役立つ内容でした！',
          createdAt: new Date().toISOString()
        },
        error: null
      };
      
      (supabase.insert as jest.Mock).mockResolvedValue(mockInsertResponse);

      const feedbackData = {
        materialId: 'material-456',
        userId: 'user-789',
        rating: 5,
        comment: 'とても役立つ内容でした！'
      };

      const result = await FeedbackService.submitFeedback(feedbackData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', 'feedback-123');
      expect(supabase.from).toHaveBeenCalledWith('feedback');
      expect(supabase.insert).toHaveBeenCalledWith({
        ...feedbackData,
        createdAt: expect.any(String)
      });
    });

    it('エラー発生時は適切なエラーメッセージを返す', async () => {
      // エラーを返すようにモックを設定
      const mockErrorResponse = {
        data: null,
        error: { message: 'データベース接続エラー' }
      };
      
      (supabase.insert as jest.Mock).mockResolvedValue(mockErrorResponse);

      const feedbackData = {
        materialId: 'material-456',
        userId: 'user-789',
        rating: 5,
        comment: 'とても役立つ内容でした！'
      };

      const result = await FeedbackService.submitFeedback(feedbackData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('データベース接続エラー');
    });
  });

  describe('getFeedbackForMaterial', () => {
    it('教材に対するフィードバック一覧を取得できる', async () => {
      // モックの戻り値を設定
      const mockOrderResponse = {
        data: [
          {
            id: 'feedback-123',
            materialId: 'material-456',
            userId: 'user-789',
            users: { username: 'テストユーザー1' },
            rating: 5,
            comment: 'とても役立つ内容でした！',
            createdAt: new Date().toISOString()
          },
          {
            id: 'feedback-124',
            materialId: 'material-456',
            userId: 'user-790',
            users: { username: 'テストユーザー2' },
            rating: 4,
            comment: '参考になりました',
            createdAt: new Date().toISOString()
          }
        ],
        error: null
      };
      
      (supabase.order as jest.Mock).mockResolvedValue(mockOrderResponse);

      const materialId = 'material-456';
      const result = await FeedbackService.getFeedbackForMaterial(materialId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toHaveProperty('id', 'feedback-123');
      expect(supabase.from).toHaveBeenCalledWith('feedback');
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('materialId', materialId);
      expect(supabase.order).toHaveBeenCalledWith('createdAt', { ascending: false });
    });

    it('エラー発生時は適切なエラーメッセージを返す', async () => {
      // エラーを返すようにモックを設定
      const mockErrorResponse = {
        data: null,
        error: { message: 'データベース接続エラー' }
      };
      
      (supabase.order as jest.Mock).mockResolvedValue(mockErrorResponse);

      const materialId = 'material-456';
      const result = await FeedbackService.getFeedbackForMaterial(materialId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('データベース接続エラー');
    });
  });

  describe('getUserFeedback', () => {
    it('ユーザーが提供したフィードバック一覧を取得できる', async () => {
      // モックの戻り値を設定
      const mockOrderResponse = {
        data: [
          {
            id: 'feedback-123',
            materialId: 'material-456',
            materials: { title: '初級英語文法' },
            userId: 'user-789',
            rating: 5,
            comment: 'とても役立つ内容でした！',
            createdAt: new Date().toISOString()
          },
          {
            id: 'feedback-125',
            materialId: 'material-457',
            materials: { title: 'ビジネス英語講座' },
            userId: 'user-789',
            rating: 4,
            comment: '実務で使える内容でした',
            createdAt: new Date().toISOString()
          }
        ],
        error: null
      };
      
      (supabase.order as jest.Mock).mockResolvedValue(mockOrderResponse);

      const userId = 'user-789';
      const result = await FeedbackService.getUserFeedback(userId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toHaveProperty('materialTitle', '初級英語文法');
      expect(supabase.from).toHaveBeenCalledWith('feedback');
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('userId', userId);
      expect(supabase.order).toHaveBeenCalledWith('createdAt', { ascending: false });
    });

    it('エラー発生時は適切なエラーメッセージを返す', async () => {
      // エラーを返すようにモックを設定
      const mockErrorResponse = {
        data: null,
        error: { message: 'データベース接続エラー' }
      };
      
      (supabase.order as jest.Mock).mockResolvedValue(mockErrorResponse);

      const userId = 'user-789';
      const result = await FeedbackService.getUserFeedback(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('データベース接続エラー');
    });
  });

  describe('getFeedbackStatistics', () => {
    it('教材のフィードバック統計を取得できる', async () => {
      // モックの戻り値を設定
      const mockEqResponse = {
        data: [
          { rating: 5 },
          { rating: 5 },
          { rating: 4 },
          { rating: 4 },
          { rating: 3 }
        ],
        error: null
      };
      
      (supabase.eq as jest.Mock).mockResolvedValue(mockEqResponse);

      const materialId = 'material-456';
      const result = await FeedbackService.getFeedbackStatistics(materialId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('averageRating');
      expect(result.data).toHaveProperty('totalCount');
      expect(result.data).toHaveProperty('ratingDistribution');
      expect(result.data?.ratingDistribution).toHaveLength(5);
      expect(supabase.from).toHaveBeenCalledWith('feedback');
    });

    it('エラー発生時は適切なエラーメッセージを返す', async () => {
      // エラーを返すようにモックを設定
      const mockErrorResponse = {
        data: null,
        error: { message: 'データベース接続エラー' }
      };
      
      (supabase.eq as jest.Mock).mockResolvedValue(mockErrorResponse);

      const materialId = 'material-456';
      const result = await FeedbackService.getFeedbackStatistics(materialId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('データベース接続エラー');
    });
  });
}); 
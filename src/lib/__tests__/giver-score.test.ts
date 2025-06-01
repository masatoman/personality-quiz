/**
 * ギバースコア関数テスト
 * src/lib/giver-score.ts の関数群をテスト
 */

import { getGiverScore } from '../giver-score';

// Supabaseクライアントのモック
jest.mock('@/services/supabaseClient', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

import supabase from '@/services/supabaseClient';

describe('ギバースコア関数', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGiverScore関数', () => {
    test('正常なデータが返される場合', async () => {
      const mockData = {
        score: 250,
        activities_count: 15,
        contributions_count: 8,
        updated_at: '2024-01-15T10:00:00Z'
      };

      // Supabaseのモックレスポンスを設定
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockData,
              error: null
            })
          })
        })
      });

      const result = await getGiverScore('test-user-id');

      expect(result).toEqual({
        score: 250,
        level: 'Advanced',
        activities: 15,
        contributions: 8,
        lastUpdated: new Date('2024-01-15T10:00:00Z')
      });
    });

    test('データが見つからない場合はデフォルト値を返す', async () => {
      // Supabaseのエラーレスポンスを設定
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'No data found' }
            })
          })
        })
      });

      const result = await getGiverScore('non-existent-user');

      expect(result.score).toBe(0);
      expect(result.level).toBe('Beginner');
      expect(result.activities).toBe(0);
      expect(result.contributions).toBe(0);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    test('データベースエラーが発生した場合はデフォルト値を返す', async () => {
      // Supabaseのエラーレスポンスを設定
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' }
            })
          })
        })
      });

      const result = await getGiverScore('test-user-id');

      expect(result.score).toBe(0);
      expect(result.level).toBe('Beginner');
      expect(result.activities).toBe(0);
      expect(result.contributions).toBe(0);
    });
  });

  describe('レベル計算ロジック', () => {
    test('各スコア範囲で正しいレベルが返される', async () => {
      const testCases = [
        { score: 0, expectedLevel: 'Beginner' },
        { score: 50, expectedLevel: 'Beginner' },
        { score: 99, expectedLevel: 'Beginner' },
        { score: 100, expectedLevel: 'Intermediate' },
        { score: 150, expectedLevel: 'Intermediate' },
        { score: 199, expectedLevel: 'Intermediate' },
        { score: 200, expectedLevel: 'Advanced' },
        { score: 350, expectedLevel: 'Advanced' },
        { score: 499, expectedLevel: 'Advanced' },
        { score: 500, expectedLevel: 'Expert' },
        { score: 750, expectedLevel: 'Expert' },
        { score: 999, expectedLevel: 'Expert' },
        { score: 1000, expectedLevel: 'Master' },
        { score: 1500, expectedLevel: 'Master' },
        { score: 9999, expectedLevel: 'Master' }
      ];

      for (const testCase of testCases) {
        const mockData = {
          score: testCase.score,
          activities_count: 10,
          contributions_count: 5,
          updated_at: '2024-01-15T10:00:00Z'
        };

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockData,
                error: null
              })
            })
          })
        });

        const result = await getGiverScore('test-user-id');
        expect(result.level).toBe(testCase.expectedLevel);
      }
    });
  });

  describe('データ型の検証', () => {
    test('返される値の型が正しい', async () => {
      const mockData = {
        score: 300,
        activities_count: 20,
        contributions_count: 12,
        updated_at: '2024-01-15T10:00:00Z'
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockData,
              error: null
            })
          })
        })
      });

      const result = await getGiverScore('test-user-id');

      expect(typeof result.score).toBe('number');
      expect(typeof result.level).toBe('string');
      expect(typeof result.activities).toBe('number');
      expect(typeof result.contributions).toBe('number');
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    test('スコアが負の値の場合も適切に処理される', async () => {
      const mockData = {
        score: -10,
        activities_count: 0,
        contributions_count: 0,
        updated_at: '2024-01-15T10:00:00Z'
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockData,
              error: null
            })
          })
        })
      });

      const result = await getGiverScore('test-user-id');

      expect(result.score).toBe(-10);
      expect(result.level).toBe('Beginner'); // 負の値でもBeginnerレベル
    });
  });

  describe('エラーハンドリング', () => {
    test('コンソールエラーが適切に出力される', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Test error' }
            })
          })
        })
      });

      await getGiverScore('test-user-id');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching giver score:',
        { message: 'Test error' }
      );

      consoleSpy.mockRestore();
    });
  });
}); 
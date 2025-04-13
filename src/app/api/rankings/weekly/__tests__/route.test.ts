import { GET } from '../route';
import { pool, initPool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getCache, setCache } from '@/lib/cache';

// キャッシュのモック
jest.mock('@/lib/cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn()
}));

// データベースのモック
jest.mock('@/lib/db', () => ({
  pool: {
    query: jest.fn(),
  },
  initPool: jest.fn(),
}));

// next/cacheのモック
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn),
}));

// テスト環境のセットアップ
describe('週間ランキングAPI', () => {
  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    
    // 基本的なモックレスポンスの設定
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ now: new Date() }] })  // データベース接続テスト
      .mockResolvedValueOnce({ rows: [{ exists: true }] })     // テーブル存在確認
      .mockResolvedValueOnce({ rows: [{ exists: true }] });    // インデックス確認
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('初期化テスト', () => {
    it('データベース接続の初期化が行われる', async () => {
      await GET();
      expect(initPool).toHaveBeenCalledTimes(1);
    });
  });

  describe('正常系テスト', () => {
    it('ランキングデータを正しい形式で取得できる', async () => {
      const mockRankingResult = {
        rows: [
          { user_id: '1', username: 'user1', total_score: 100 },
          { user_id: '2', username: 'user2', total_score: 90 },
        ],
        rowCount: 2,
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ now: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce(mockRankingResult);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual({
        data: [
          { id: '1', username: 'user1', score: 100, rank: 1 },
          { id: '2', username: 'user2', score: 90, rank: 2 },
        ],
        timestamp: expect.any(String)
      });
    });

    it('空のランキングデータを正しく処理できる', async () => {
      const mockRankingResult = {
        rows: [],
        rowCount: 0,
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ now: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce(mockRankingResult);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual({
        data: [],
        message: 'ランキングデータが存在しません',
        timestamp: expect.any(String)
      });
    });
  });

  describe('異常系テスト', () => {
    it('テーブルが存在しない場合、適切なエラーメッセージを返す', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ now: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ exists: false }] });

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual({
        error: 'ランキングの取得に失敗しました',
        details: 'quiz_resultsテーブルが存在しません',
        timestamp: expect.any(String)
      });
    });

    it('データベース接続エラー時、適切なエラーメッセージを返す', async () => {
      const dbError = new Error('データベース接続エラー');
      (pool.query as jest.Mock).mockRejectedValue(dbError);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual({
        error: 'ランキングの取得に失敗しました',
        details: 'データベース接続エラー',
        timestamp: expect.any(String)
      });
    });
  });

  describe('キャッシュ機能テスト', () => {
    it('キャッシュが正しく設定される', async () => {
      const mockRankingResult = {
        rows: [{ user_id: '1', username: 'user1', total_score: 100 }],
        rowCount: 1,
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ now: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce(mockRankingResult);

      await GET();
      
      expect(unstable_cache).toHaveBeenCalledWith(
        expect.any(Function),
        ['weekly-rankings'],
        { revalidate: 300, tags: ['rankings'] }
      );
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のランキングデータを1秒以内に処理できる', async () => {
      const mockRows = Array.from({ length: 1000 }, (_, i) => ({
        user_id: `${i}`,
        username: `user${i}`,
        total_score: 1000 - i,
      }));

      const mockRankingResult = {
        rows: mockRows,
        rowCount: 1000,
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ now: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce(mockRankingResult);

      const startTime = Date.now();
      const response = await GET();
      const endTime = Date.now();
      const data = await response.json();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(data.data).toHaveLength(1000);
      expect(data.data[0].rank).toBe(1);
      expect(data.data[999].rank).toBe(1000);
    });
  });

  describe('エッジケーステスト', () => {
    it('同点の場合、同じランクが割り当てられる', async () => {
      const mockRankingResult = {
        rows: [
          { user_id: '1', username: 'user1', total_score: 100 },
          { user_id: '2', username: 'user2', total_score: 100 },
          { user_id: '3', username: 'user3', total_score: 90 },
        ],
        rowCount: 3,
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ now: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce(mockRankingResult);

      const response = await GET();
      const data = await response.json();

      expect(data.data[0].rank).toBe(1);
      expect(data.data[1].rank).toBe(1);
      expect(data.data[2].rank).toBe(3);
    });
  });
}); 
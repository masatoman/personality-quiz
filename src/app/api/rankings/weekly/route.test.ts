import { GET } from './route';
import { pool, initPool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

// モックの設定
jest.mock('@/lib/db', () => ({
  pool: {
    query: jest.fn(),
  },
  initPool: jest.fn(),
}));

jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn),
}));

describe('週間ランキングAPI', () => {
  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
  });

  describe('初期化テスト', () => {
    it('データベース接続の初期化が行われる', async () => {
      // API呼び出し
      await GET();
      
      // initPoolが呼び出されたことを確認
      expect(initPool).toHaveBeenCalledTimes(1);
    });
  });

  describe('正常系テスト', () => {
    it('ランキングデータを正しい形式で取得できる', async () => {
      // モックデータの設定
      const mockTestResult = { rows: [{ now: new Date() }] };
      const mockTableCheck = { rows: [{ exists: true }] };
      const mockIndexCheck = { rows: [{ exists: true }] };
      const mockRankingResult = {
        rows: [
          { user_id: '1', username: 'user1', total_score: 100 },
          { user_id: '2', username: 'user2', total_score: 90 },
        ],
        rowCount: 2,
      };

      // モックの実装
      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockTestResult)
        .mockResolvedValueOnce(mockTableCheck)
        .mockResolvedValueOnce(mockIndexCheck)
        .mockResolvedValueOnce(mockRankingResult);

      // API呼び出し
      const response = await GET();
      const data = await response.json();

      // アサーション
      expect(response).toBeInstanceOf(NextResponse);
      expect(data).toEqual([
        { id: '1', username: 'user1', score: 100, rank: 1 },
        { id: '2', username: 'user2', score: 90, rank: 2 },
      ]);
    });

    it('空のランキングデータを正しく処理できる', async () => {
      // モックデータの設定
      const mockTestResult = { rows: [{ now: new Date() }] };
      const mockTableCheck = { rows: [{ exists: true }] };
      const mockIndexCheck = { rows: [{ exists: true }] };
      const mockRankingResult = {
        rows: [],
        rowCount: 0,
      };

      // モックの実装
      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockTestResult)
        .mockResolvedValueOnce(mockTableCheck)
        .mockResolvedValueOnce(mockIndexCheck)
        .mockResolvedValueOnce(mockRankingResult);

      // API呼び出し
      const response = await GET();
      const data = await response.json();

      // アサーション
      expect(response).toBeInstanceOf(NextResponse);
      expect(data).toEqual([]);
    });
  });

  describe('異常系テスト', () => {
    it('テーブルが存在しない場合、適切な日本語エラーメッセージを返す', async () => {
      // モックデータの設定
      const mockTestResult = { rows: [{ now: new Date() }] };
      const mockTableCheck = { rows: [{ exists: false }] };

      // モックの実装
      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockTestResult)
        .mockResolvedValueOnce(mockTableCheck);

      // API呼び出し
      const response = await GET();
      const data = await response.json();

      // アサーション
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      expect(data.error).toBe('ランキングの取得に失敗しました');
      expect(data.details).toBe('quiz_resultsテーブルが存在しません');
    });

    it('データベース接続エラー時、適切な日本語エラーメッセージを返す', async () => {
      // モックの実装
      (pool.query as jest.Mock).mockRejectedValue(new Error('データベース接続エラー'));

      // API呼び出し
      const response = await GET();
      const data = await response.json();

      // アサーション
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      expect(data.error).toBe('ランキングの取得に失敗しました');
      expect(data.details).toBe('データベース接続エラー');
    });
  });

  describe('キャッシュ機能テスト', () => {
    it('キャッシュが正しく設定される', async () => {
      // API呼び出し
      await GET();
      
      // キャッシュ設定の確認
      expect(unstable_cache).toHaveBeenCalledWith(
        expect.any(Function),
        ['weekly-rankings'],
        { revalidate: 300 }
      );
    });

    it('キャッシュ期間内は再クエリが実行されない', async () => {
      const mockTestResult = { rows: [{ now: new Date() }] };
      const mockTableCheck = { rows: [{ exists: true }] };
      const mockIndexCheck = { rows: [{ exists: true }] };
      const mockRankingResult = {
        rows: [{ user_id: '1', username: 'user1', total_score: 100 }],
        rowCount: 1,
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockTestResult)
        .mockResolvedValueOnce(mockTableCheck)
        .mockResolvedValueOnce(mockIndexCheck)
        .mockResolvedValueOnce(mockRankingResult);

      // 1回目の呼び出し
      await GET();
      
      // 2回目の呼び出し
      await GET();

      // クエリは1回目の呼び出しでのみ実行される
      expect(pool.query).toHaveBeenCalledTimes(4);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のランキングデータを処理できる', async () => {
      // 1000件のモックデータを生成
      const mockRows = Array.from({ length: 1000 }, (_, i) => ({
        user_id: `${i}`,
        username: `user${i}`,
        total_score: 1000 - i,
      }));

      const mockTestResult = { rows: [{ now: new Date() }] };
      const mockTableCheck = { rows: [{ exists: true }] };
      const mockIndexCheck = { rows: [{ exists: true }] };
      const mockRankingResult = {
        rows: mockRows,
        rowCount: 1000,
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockTestResult)
        .mockResolvedValueOnce(mockTableCheck)
        .mockResolvedValueOnce(mockIndexCheck)
        .mockResolvedValueOnce(mockRankingResult);

      const startTime = Date.now();
      const response = await GET();
      const endTime = Date.now();
      const data = await response.json();

      // 処理時間が1秒未満であることを確認
      expect(endTime - startTime).toBeLessThan(1000);
      expect(data.length).toBe(1000);
      expect(data[0].rank).toBe(1);
      expect(data[999].rank).toBe(1000);
    });
  });
}); 
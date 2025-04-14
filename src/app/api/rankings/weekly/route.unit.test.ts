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
      // モックデータの設定
      const mockTestResult = { rows: [{ now: new Date() }] };
      const mockTableCheck = { rows: [{ exists: true }] };
      const mockIndexCheck = { rows: [{ exists: true }] };
      const mockRankingResult = { rows: [], rowCount: 0 };

      // モックの実装
      (pool.query as jest.Mock)
        .mockResolvedValueOnce(mockTestResult)
        .mockResolvedValueOnce(mockTableCheck)
        .mockResolvedValueOnce(mockIndexCheck)
        .mockResolvedValueOnce(mockRankingResult);

      // API呼び出し
      await GET();
      
      // initPoolが呼び出されたことを確認
      expect(initPool).toHaveBeenCalledTimes(1);
    });

    it('接続タイムアウトが発生した場合、適切なエラーを返す', async () => {
      // タイムアウトをシミュレート
      (initPool as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 31000))
      );

      // API呼び出し
      const response = await GET();
      const data = await response.json();

      // アサーション
      expect(response.status).toBe(504);
      expect(data.error).toBe('データベース接続がタイムアウトしました');
      expect(data.status).toBe('error');
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
          { 
            user_id: '1', 
            username: 'user1', 
            total_score: 100,
            activity_count: 5,
            last_activity: '2024-03-20T10:00:00Z'
          },
          { 
            user_id: '2', 
            username: 'user2', 
            total_score: 90,
            activity_count: 4,
            last_activity: '2024-03-19T15:00:00Z'
          },
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
      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data).toEqual([
        { 
          id: '1', 
          username: 'user1', 
          score: 100, 
          rank: 1,
          activityCount: 5,
          lastActive: '2024-03-20T10:00:00Z'
        },
        { 
          id: '2', 
          username: 'user2', 
          score: 90, 
          rank: 2,
          activityCount: 4,
          lastActive: '2024-03-19T15:00:00Z'
        },
      ]);
      expect(data.totalUsers).toBe(2);
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
      expect(response.status).toBe(200);
      expect(data.status).toBe('empty');
      expect(data.data).toEqual([]);
      expect(data.message).toBe('ランキングデータが存在しません');
    });

    it('100件以上のデータがある場合、上位100件のみを返す', async () => {
      // 150件のモックデータを生成
      const mockRows = Array.from({ length: 150 }, (_, i) => ({
        user_id: `${i}`,
        username: `user${i}`,
        total_score: 1000 - i,
        activity_count: Math.floor(Math.random() * 10) + 1,
        last_activity: new Date(Date.now() - i * 3600000).toISOString()
      }));

      const mockTestResult = { rows: [{ now: new Date() }] };
      const mockTableCheck = { rows: [{ exists: true }] };
      const mockIndexCheck = { rows: [{ exists: true }] };
      const mockRankingResult = {
        rows: mockRows,
        rowCount: 150,
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
      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.length).toBe(100);
      expect(data.data[0].score).toBe(1000);
      expect(data.data[99].score).toBe(901);
      expect(data.totalUsers).toBe(100);
      
      // 追加フィールドの存在確認
      expect(data.data[0]).toHaveProperty('activityCount');
      expect(data.data[0]).toHaveProperty('lastActive');
    });
  });

  describe('異常系テスト', () => {
    it('テーブルが存在しない場合、適切なエラーメッセージを返す', async () => {
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
      expect(response.status).toBe(503);
      expect(data.status).toBe('error');
      expect(data.error).toBe('データベースの準備ができていません');
      expect(data.details).toBe('quiz_resultsテーブルが存在しません');
    });

    it('データベース接続エラー時、適切なエラーメッセージを返す', async () => {
      // モックの実装
      (pool.query as jest.Mock).mockRejectedValue(new Error('データベース接続エラー'));

      // API呼び出し
      const response = await GET();
      const data = await response.json();

      // アサーション
      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
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
        { 
          revalidate: 300,
          tags: ['rankings']
        }
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
    it('大量のランキングデータを1秒以内に処理できる', async () => {
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
      // 上位100件のみ返されることを確認
      expect(data.data.length).toBe(100);
    });
  });
}); 
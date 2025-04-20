import { saveResult, getStats, initDatabase, query } from '../db';
import fs from 'fs';
import { Pool, PoolClient } from 'pg';

interface MockClient extends PoolClient {
  query: jest.Mock;
  release: jest.Mock;
}

interface MockPool extends Pool {
  connect: jest.Mock<Promise<MockClient>>;
  on: jest.Mock;
}

// fsをモック
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn()
}));

// pgをモック
jest.mock('pg', () => {
  const mockClient: MockClient = {
    query: jest.fn(),
    release: jest.fn()
  } as unknown as MockClient;
  
  const mockPool: MockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
    on: jest.fn()
  } as unknown as MockPool;
  
  return {
    Pool: jest.fn(() => mockPool)
  };
});

describe('Database Utilities', () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    jest.clearAllMocks();
  });
  
  describe('initDatabase', () => {
    it('データディレクトリが存在しない場合に作成する', () => {
      // データディレクトリが存在しないと設定
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      // 関数を実行
      const result = initDatabase();
      
      // ディレクトリが作成されたことを確認
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
      expect(result).toBe(true);
    });
    
    it('結果ファイルが存在しない場合に作成する', () => {
      // データディレクトリは存在するが結果ファイルは存在しないと設定
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true)    // データディレクトリ
        .mockReturnValueOnce(false);  // 結果ファイル
      
      // 関数を実行
      initDatabase();
      
      // 結果ファイルが作成されたことを確認
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),  // ファイルパス
        '[]',                // 初期データ（空配列）
        expect.any(Object)   // オプション
      );
    });
    
    it('統計ファイルが存在しない場合に作成する', () => {
      // すべてのディレクトリとファイルが存在するが統計ファイルは存在しないと設定
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true)   // データディレクトリ
        .mockReturnValueOnce(true)   // 結果ファイル
        .mockReturnValueOnce(false); // 統計ファイル
      
      // 関数を実行
      initDatabase();
      
      // 統計ファイルが作成されたことを確認（3回目の呼び出し）
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),  // ファイルパス
        expect.stringContaining('"total":0'),  // 初期統計データ
        expect.any(Object)   // オプション
      );
    });
  });
  
  describe('saveResult', () => {
    it('新しい結果を保存し統計を更新する', () => {
      // ファイルの存在チェック
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      // ファイル読み込みの戻り値を設定
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce('[]')  // 結果ファイル（空配列）
        .mockReturnValueOnce(JSON.stringify({  // 統計ファイル
          giver: { count: 10, percentage: 34 },
          matcher: { count: 7, percentage: 25 },
          taker: { count: 12, percentage: 41 },
          total: 29
        }));
      
      // 関数を実行
      const result = saveResult('giver');
      
      // 結果の確認
      expect(result).toBe(true);
      
      // ファイルへの書き込みが行われたことを確認
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      
      // 結果ファイルへの書き込み（1回目の呼び出し）
      expect(fs.writeFileSync).toHaveBeenNthCalledWith(
        1,
        expect.any(String),  // ファイルパス
        expect.stringContaining('"type":"giver"'),  // ギバータイプの結果
        expect.any(Object)   // オプション
      );
      
      // 統計ファイルへの書き込み（2回目の呼び出し）
      expect(fs.writeFileSync).toHaveBeenNthCalledWith(
        2,
        expect.any(String),  // ファイルパス
        expect.stringContaining('"count":11'),  // ギバーのカウントが1増加
        expect.any(Object)   // オプション
      );
    });
    
    it('メモリ内モックデータにフォールバックする', () => {
      // ファイル読み込みでエラーを発生させる
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('ファイル読み込みエラー');
      });
      
      // 関数を実行
      const result = saveResult('taker');
      
      // 結果の確認
      expect(result).toBe(true);
      
      // 何度かリトライしてファイル書き込みを試みることを確認
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
  
  describe('getStats', () => {
    it('統計データを取得する', () => {
      // 統計ファイルが存在し、データを含むと設定
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      const mockStats = {
        giver: { count: 10, percentage: 34 },
        matcher: { count: 7, percentage: 25 },
        taker: { count: 12, percentage: 41 },
        total: 29
      };
      
      // ファイル読み込みの戻り値を設定
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockStats));
      
      // 関数を実行
      const stats = getStats();
      
      // 結果の確認
      expect(stats).toEqual(mockStats);
      expect(stats.giver.count).toBe(10);
      expect(stats.matcher.count).toBe(7);
      expect(stats.taker.count).toBe(12);
      expect(stats.total).toBe(29);
    });
    
    it('ファイル読み込みに失敗した場合デフォルト値を返す', () => {
      // ファイル読み込みでエラーを発生させる
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('ファイル読み込みエラー');
      });
      
      // 関数を実行
      const stats = getStats();
      
      // デフォルト値を返すことを確認
      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('query', () => {
    it('PostgreSQLクエリを実行する', async () => {
      // モッククライアントのクエリ関数に戻り値を設定
      const mockResult = { rows: [{ id: 1, name: 'Test' }] };
      const mockClient = (await (new Pool() as MockPool).connect());
      mockClient.query.mockResolvedValue(mockResult);
      
      // テストクエリとパラメータ
      const testQuery = 'SELECT * FROM users WHERE id = $1';
      const testParams = [1];
      
      // 関数を実行
      const result = await query(testQuery, testParams);
      
      // 結果の確認
      expect(result).toEqual(mockResult);
      
      // クエリが呼ばれたことを確認
      expect(mockClient.query).toHaveBeenCalledWith(testQuery, testParams);
      
      // クライアントがリリースされたことを確認
      expect(mockClient.release).toHaveBeenCalled();
    });
    
    it('クエリ実行中にエラーが発生した場合例外を投げる', async () => {
      // モッククライアントのクエリ関数にエラーを設定
      const mockClient = (new Pool() as any).connect();
      mockClient.query.mockRejectedValue(new Error('データベースエラー'));
      
      // 関数を実行して例外を確認
      await expect(query('SELECT * FROM users')).rejects.toThrow('データベースエラー');
      
      // クライアントがリリースされたことを確認
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
}); 
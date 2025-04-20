import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';
import { DatabaseError, FileSystemError } from '@/types/errors';
import { executeSqlFile } from '../db-deploy';

// モックの設定
jest.mock('fs');
jest.mock('path');
jest.mock('@supabase/supabase-js');
jest.mock('dotenv');

// 型定義
interface MockEnvironment {
  NODE_ENV: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  DB_MIGRATIONS_PATH: string;
  DB_FUNCTIONS_PATH: string;
}

interface MockSupabaseClient extends Partial<SupabaseClient> {
  rpc: jest.Mock;
  from: jest.Mock;
}

interface MockResponse<T = unknown> {
  data: T | null;
  error: PostgrestError | null;
}

describe('データベースデプロイツール', () => {
  // テスト用の環境変数
  const mockEnv: Readonly<MockEnvironment> = {
    NODE_ENV: 'test',
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_KEY: 'test-key',
    DB_MIGRATIONS_PATH: '/test/migrations',
    DB_FUNCTIONS_PATH: '/test/functions'
  };

  // テスト用のモックデータ
  const mockSqlContent = `
    CREATE TABLE test_table (id SERIAL PRIMARY KEY);
    INSERT INTO test_table (id) VALUES (1);
  `;

  let mockSupabase: MockSupabaseClient;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    // 環境変数のモック
    process.env = { ...mockEnv };

    // fsモックの設定
    (fs.existsSync as jest.Mock).mockImplementation(() => true);
    (fs.readFileSync as jest.Mock).mockReturnValue(mockSqlContent);
    (fs.readdirSync as jest.Mock).mockReturnValue(['test.sql']);

    // pathモックの設定
    (path.join as jest.Mock).mockImplementation((...args: string[]) => args.join('/'));

    // Supabaseクライアントのモック
    mockSupabase = {
      rpc: jest.fn().mockResolvedValue({ data: null, error: null } as MockResponse),
      from: jest.fn()
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // コンソール出力のモック
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('環境変数の検証', () => {
    test('必要な環境変数が設定されていない場合、エラーで終了する', async () => {
      // Arrange
      process.env = {};
      
      // Act & Assert
      await expect(executeSqlFile('test.sql')).rejects.toThrow(
        expect.stringContaining('環境変数が設定されていません')
      );
    });

    test('すべての環境変数が正しく設定されている場合、処理を続行する', async () => {
      // Act & Assert
      await expect(executeSqlFile('test.sql')).resolves.not.toThrow();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });

  describe('マイグレーション実行', () => {
    test('マイグレーションファイルが正常に実行される', async () => {
      // Arrange
      const mockResponse: MockResponse = {
        data: null,
        error: null
      };
      mockSupabase.rpc.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(executeSqlFile('migrations/test.sql')).resolves.not.toThrow();
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('migrations/test.sql'),
        'utf8'
      );
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        { sql: mockSqlContent }
      );
    });

    test('マイグレーションディレクトリが存在しない場合、FileSystemErrorをスローする', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Act & Assert
      await expect(executeSqlFile('migrations/test.sql')).rejects.toThrow(FileSystemError);
      await expect(executeSqlFile('migrations/test.sql')).rejects.toThrow('ファイルが見つかりません');
    });

    test('SQLの実行中にエラーが発生した場合、DatabaseErrorをスローする', async () => {
      // Arrange
      const mockError: PostgrestError = {
        message: 'SQL構文エラー',
        details: 'テーブルが存在しません',
        hint: 'テーブルを作成してください',
        code: '42P01'
      };
      const mockResponse: MockResponse = {
        data: null,
        error: mockError
      };
      mockSupabase.rpc.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(executeSqlFile('migrations/test.sql')).rejects.toThrow(DatabaseError);
      await expect(executeSqlFile('migrations/test.sql')).rejects.toThrow(
        expect.stringContaining('SQLの実行に失敗しました')
      );
    });
  });

  describe('データベース関数のデプロイ', () => {
    test('データベース関数が正常にデプロイされる', async () => {
      // Arrange
      const mockResponse: MockResponse = {
        data: null,
        error: null
      };
      mockSupabase.rpc.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(executeSqlFile('functions/test.sql')).resolves.not.toThrow();
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('functions/test.sql'),
        'utf8'
      );
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'execute_sql',
        { sql: mockSqlContent }
      );
    });

    test('関数ディレクトリが存在しない場合、FileSystemErrorをスローする', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Act & Assert
      await expect(executeSqlFile('functions/test.sql')).rejects.toThrow(FileSystemError);
      await expect(executeSqlFile('functions/test.sql')).rejects.toThrow('ファイルが見つかりません');
    });

    test('関数のデプロイ中にエラーが発生した場合、DatabaseErrorをスローする', async () => {
      // Arrange
      const mockError: PostgrestError = {
        message: '関数の作成に失敗',
        details: '構文エラー',
        hint: '関数の定義を確認してください',
        code: '42601'
      };
      const mockResponse: MockResponse = {
        data: null,
        error: mockError
      };
      mockSupabase.rpc.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(executeSqlFile('functions/test.sql')).rejects.toThrow(DatabaseError);
      await expect(executeSqlFile('functions/test.sql')).rejects.toThrow(
        expect.stringContaining('SQLの実行に失敗しました')
      );
    });
  });
}); 
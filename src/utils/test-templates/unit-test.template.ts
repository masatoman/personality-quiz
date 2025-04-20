/**
 * ユニットテストのテンプレート
 * 
 * 使用方法：
 * 1. このファイルを適切なディレクトリにコピー
 * 2. ファイル名を "[テスト対象].unit.test.ts" に変更
 * 3. テスト対象の機能に合わせてテストケースを実装
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { DatabaseError, FileSystemError, ValidationError } from '@/types/errors';
import { formatDate, validateInput, generateId } from '@/lib/utils';
// FIXME: テスト対象のモジュールをインポート
// import { functionToTest } from '../path-to-module';

interface TestData {
  id: string;
  name: string;
  points: number;
  createdAt: Date;
}

// モックサービスの型定義
interface MockService {
  getData: (id: string) => Promise<TestData>;
  saveData: (data: TestData) => Promise<void>;
  updatePoints: (id: string, points: number) => Promise<void>;
}

describe('ユーティリティ関数テスト', () => {
  // テスト用のモックサービス
  const mockService = mockDeep<MockService>();
  
  // テストデータ
  const testData: TestData = {
    id: generateId(),
    name: 'テストユーザー',
    points: 100,
    createdAt: new Date()
  };

  beforeEach(() => {
    // モックのリセットと初期設定
    mockReset(mockService);
    mockService.getData.mockResolvedValue(testData);
    mockService.saveData.mockResolvedValue();
    mockService.updatePoints.mockResolvedValue();
  });

  afterEach(() => {
    // クリーンアップ
    jest.clearAllMocks();
  });

  describe('データ取得機能のテスト', () => {
    it('正常系: 指定したIDのデータが取得できること', async () => {
      const result = await mockService.getData(testData.id);
      
      expect(result).toEqual(testData);
      expect(mockService.getData).toHaveBeenCalledWith(testData.id);
      expect(mockService.getData).toHaveBeenCalledTimes(1);
      expect(result.points).toBeGreaterThanOrEqual(0);
      expect(formatDate(result.createdAt)).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
    });

    it('異常系: 存在しないIDの場合はエラーを投げること', async () => {
      const invalidId = 'non-existent-id';
      mockService.getData.mockRejectedValue(
        new DatabaseError('指定されたIDのデータが見つかりません')
      );

      await expect(mockService.getData(invalidId))
        .rejects
        .toThrow('指定されたIDのデータが見つかりません');
      
      expect(mockService.getData).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('データ保存機能のテスト', () => {
    it('正常系: 有効なデータが保存できること', async () => {
      const validData: TestData = {
        ...testData,
        name: '新規ユーザー',
        points: 50
      };

      await expect(mockService.saveData(validData)).resolves.not.toThrow();
      expect(mockService.saveData).toHaveBeenCalledWith(validData);
      expect(validateInput(validData.name)).toBe(true);
    });

    it('異常系: 無効なデータの場合はバリデーションエラーを投げること', async () => {
      const invalidData = {
        ...testData,
        name: '',  // 空文字は無効
        points: -1 // 負の値は無効
      };

      mockService.saveData.mockRejectedValue(
        new ValidationError('入力値が無効です')
      );

      await expect(mockService.saveData(invalidData as TestData))
        .rejects
        .toThrow('入力値が無効です');
    });
  });

  describe('ポイント更新機能のテスト', () => {
    it('正常系: ポイントが正しく更新されること', async () => {
      const newPoints = 150;
      await mockService.updatePoints(testData.id, newPoints);

      expect(mockService.updatePoints).toHaveBeenCalledWith(testData.id, newPoints);
      expect(mockService.updatePoints).toHaveBeenCalledTimes(1);
    });

    it('異常系: ファイルシステムエラーの場合', async () => {
      mockService.updatePoints.mockRejectedValue(
        new FileSystemError('ポイント更新中にエラーが発生しました')
      );

      await expect(mockService.updatePoints(testData.id, 200))
        .rejects
        .toThrow('ポイント更新中にエラーが発生しました');
    });

    it('異常系: 不正なポイント値の場合', async () => {
      const invalidPoints = -100;
      mockService.updatePoints.mockRejectedValue(
        new ValidationError('ポイントは0以上の値である必要があります')
      );

      await expect(mockService.updatePoints(testData.id, invalidPoints))
        .rejects
        .toThrow('ポイントは0以上の値である必要があります');
    });
  });

  describe('バリデーション機能のテスト', () => {
    it('正常系: 有効な入力値の検証', () => {
      const validInputs = {
        id: generateId(),
        name: '有効な名前',
        points: 100
      };

      expect(validateInput(validInputs.name)).toBe(true);
      expect(validInputs.points).toBeGreaterThanOrEqual(0);
      expect(validInputs.id).toMatch(/^[a-z0-9]+$/);
    });

    it('異常系: 無効な入力値の検証', () => {
      const _invalidInputs = {
        id: '',
        name: '   ',
        points: -1
      };

      expect(validateInput(_invalidInputs.name)).toBe(false);
      expect(_invalidInputs.points).toBeLessThan(0);
      expect(validateInput(_invalidInputs.id)).toBe(false);
    });
  });

  // 非同期処理のテスト
  it('非同期処理: データが正しく取得できること', async () => {
    // テストの準備
    const expectedData: TestData = { id: generateId(), name: 'test', points: 100, createdAt: new Date() };
    const mockFetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(expectedData),
      ok: true,
      status: 200
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    // テスト実行
    const response = await fetch('test-url');
    const result = await response.json();

    // 検証
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(result).toEqual(expectedData);
    expect(mockFetch).toHaveBeenCalledWith('test-url');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // モック関数のテスト
  it('コールバック: 正しく呼び出されること', () => {
    // テストの準備
    const mockCallback = jest.fn();
    const testValue = 'test';

    // テスト実行
    mockCallback(testValue);

    // 検証
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(testValue);
    expect(mockCallback).not.toHaveBeenCalledWith('wrong-value');
  });
}); 
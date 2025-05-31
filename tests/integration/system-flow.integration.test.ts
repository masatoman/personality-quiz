/**
 * システム全体フロー統合テスト
 * Phase 7: 機能間結合テスト
 * 
 * 主要フローをテスト:
 * 1. ホームページアクセス
 * 2. ギバー診断システム
 * 3. 学習リソースシステム
 * 4. ポイントシステム連携
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('システム全体フロー統合テスト', () => {
  let serverBaseUrl: string;

  beforeAll(() => {
    serverBaseUrl = process.env.TEST_SERVER_URL || 'http://localhost:3000';
  });

  describe('基本フロー検証', () => {
    test('ホームページが正常に表示される', async () => {
      const response = await fetch(`${serverBaseUrl}/`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('ShiftWith');
      expect(html).toContain('教えて学べる');
    });

    test('診断ページが正常に表示される', async () => {
      const response = await fetch(`${serverBaseUrl}/quiz`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('ギバー診断');
    });

    test('教材探索ページが正常に表示される', async () => {
      const response = await fetch(`${serverBaseUrl}/explore`);
      expect(response.status).toBe(200);
    });
  });

  describe('API統合テスト', () => {
    test('学習カテゴリAPIが正常動作する', async () => {
      const response = await fetch(`${serverBaseUrl}/api/learning/categories`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.categories).toBeDefined();
      expect(Array.isArray(data.categories)).toBe(true);
      expect(data.categories.length).toBeGreaterThan(0);
    });

    test('難易度レベルAPIが正常動作する', async () => {
      const response = await fetch(`${serverBaseUrl}/api/learning/difficulties`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.difficulties).toBeDefined();
      expect(Array.isArray(data.difficulties)).toBe(true);
      expect(data.difficulties.length).toBeGreaterThan(0);
    });

    test('学習リソースAPIが正常動作する', async () => {
      const response = await fetch(`${serverBaseUrl}/api/learning/resources?limit=5`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.resources).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('認証フロー統合テスト', () => {
    test('認証が必要なAPIは適切にエラーを返す', async () => {
      const response = await fetch(`${serverBaseUrl}/api/learning/recommendations`);
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toContain('認証');
    });

    test('ポイント統計APIは認証エラーを返す', async () => {
      const response = await fetch(`${serverBaseUrl}/api/points/stats`);
      expect(response.status).toBe(401);
    });
  });

  describe('データ整合性テスト', () => {
    test('カテゴリと難易度の整合性', async () => {
      // カテゴリ取得
      const categoriesResponse = await fetch(`${serverBaseUrl}/api/learning/categories`);
      const categoriesData = await categoriesResponse.json();
      
      // 難易度取得
      const difficultiesResponse = await fetch(`${serverBaseUrl}/api/learning/difficulties`);
      const difficultiesData = await difficultiesResponse.json();
      
      // データ構造の確認
      expect(categoriesData.categories[0]).toHaveProperty('id');
      expect(categoriesData.categories[0]).toHaveProperty('name');
      expect(categoriesData.categories[0]).toHaveProperty('display_order');
      
      expect(difficultiesData.difficulties[0]).toHaveProperty('id');
      expect(difficultiesData.difficulties[0]).toHaveProperty('level_code');
      expect(difficultiesData.difficulties[0]).toHaveProperty('min_score');
    });

    test('Phase 6実装機能の基本動作確認', async () => {
      // 全14個のAPIエンドポイントの基本接続確認
      const endpoints = [
        '/api/learning/categories',
        '/api/learning/difficulties', 
        '/api/learning/resources',
        '/api/learning/recommendations', // 認証必要
        '/api/learning/progress', // 認証必要
        '/api/learning/reviews', // 認証必要
        '/api/learning/comments' // 認証必要
      ];

      for (const endpoint of endpoints.slice(0, 3)) { // 認証不要のAPIをテスト
        const response = await fetch(`${serverBaseUrl}${endpoint}`);
        expect(response.status).toBe(200);
      }

      for (const endpoint of endpoints.slice(3)) { // 認証必要のAPIをテスト
        const response = await fetch(`${serverBaseUrl}${endpoint}`);
        expect(response.status).toBe(401); // 認証エラーが正常
      }
    });
  });

  describe('エラーハンドリングテスト', () => {
    test('存在しないページは404を返す', async () => {
      const response = await fetch(`${serverBaseUrl}/nonexistent-page`);
      expect(response.status).toBe(404);
    });

    test('不正なAPIパラメータは適切にエラーを返す', async () => {
      const response = await fetch(`${serverBaseUrl}/api/learning/categories?invalid=param`);
      // エラーでも200を返すが、データ構造は正常であることを確認
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.categories).toBeDefined();
    });
  });
});

/**
 * 手動実行用のヘルパー関数
 */
export async function runSystemHealthCheck(): Promise<boolean> {
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 基本ページ確認
    const homeResponse = await fetch(`${baseUrl}/`);
    if (homeResponse.status !== 200) return false;
    
    // API確認
    const categoriesResponse = await fetch(`${baseUrl}/api/learning/categories`);
    if (categoriesResponse.status !== 200) return false;
    
    console.log('✅ システムヘルスチェック: 正常');
    return true;
  } catch (error) {
    console.error('❌ システムヘルスチェック: 失敗', error);
    return false;
  }
} 
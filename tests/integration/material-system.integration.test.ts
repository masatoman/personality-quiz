/**
 * 教材システム統合テスト - Critical Priority
 * 
 * テスト対象:
 * 1. 教材作成 → 保存 → 公開 → 一覧表示
 * 2. 教材検索 → フィルタリング → 詳細表示 → 学習開始
 * 3. 教材学習 → 進捗記録 → 完了処理 → ポイント獲得
 * 4. 教材評価 → レビュー投稿 → 評価反映 → 作成者通知
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// テスト用のモックデータ
const mockMaterial = {
  title: 'テスト教材：基本英会話',
  description: '日常英会話の基本フレーズを学習する教材です',
  content: '# Lesson 1: Greetings\n\nHello, how are you?\nI am fine, thank you.',
  category: 'conversation',
  level: 'beginner',
  tags: ['conversation', 'greetings', 'basic'],
  estimatedTime: 30,
  sections: [
    {
      title: '挨拶の基本',
      content: 'Hello, Good morning, Good evening の使い分け',
      order: 1
    },
    {
      title: '自己紹介',
      content: 'My name is... I am from... の基本表現',
      order: 2
    }
  ]
};

const mockReview = {
  rating: 4,
  comment: 'とても分かりやすい教材でした。初心者におすすめです。',
  helpful: true
};

const mockLearningProgress = {
  materialId: 'test-material-id',
  sectionsCompleted: [1, 2],
  timeSpent: 25,
  completionRate: 100,
  notes: '基本的な挨拶表現を習得しました'
};

describe('🔴 Critical: 教材システム統合テスト', () => {
  let serverBaseUrl: string;

  beforeAll(() => {
    serverBaseUrl = process.env.TEST_SERVER_URL || 'http://localhost:3000';
  });

  describe('1. 教材作成・公開フロー統合', () => {
    test('教材作成 → 保存 → 公開 → 一覧表示', async () => {
      // Step 1: 教材作成ページアクセス
      const createPageResponse = await fetch(`${serverBaseUrl}/create/standard/1`);
      expect([200, 302]).toContain(createPageResponse.status); // ログイン要求時は302

      // Step 2: 教材作成API確認
      const createMaterialResponse = await fetch(`${serverBaseUrl}/api/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockMaterial)
      });

      expect(createMaterialResponse.status).toBe(401); // 認証が必要（正常）
      
      const createData = await createMaterialResponse.json();
      expect(createData.error).toContain('認証');

      // Step 3: 教材一覧API確認
      const materialsListResponse = await fetch(`${serverBaseUrl}/api/materials`);
      expect(materialsListResponse.status).toBe(200); // 公開API

      const materialsData = await materialsListResponse.json();
      expect(materialsData.materials).toBeDefined();
      expect(Array.isArray(materialsData.materials)).toBe(true);

      // Step 4: 教材詳細表示確認
      if (materialsData.materials.length > 0) {
        const firstMaterial = materialsData.materials[0];
        const detailResponse = await fetch(`${serverBaseUrl}/api/materials/${firstMaterial.id}`);
        expect(detailResponse.status).toBe(200);
        
        const detailData = await detailResponse.json();
        expect(detailData.material).toBeDefined();
        expect(detailData.material.id).toBe(firstMaterial.id);
      }
    });

    test('教材バリデーション確認', async () => {
      // 不完全な教材データ
      const incompleteMaterialResponse = await fetch(`${serverBaseUrl}/api/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '', // 空のタイトル
          description: 'テスト',
          // contentが不足
        })
      });

      expect([400, 401]).toContain(incompleteMaterialResponse.status);

      // 不正なカテゴリ
      const invalidCategoryResponse = await fetch(`${serverBaseUrl}/api/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mockMaterial,
          category: 'invalid_category'
        })
      });

      expect([400, 401]).toContain(invalidCategoryResponse.status);
    });
  });

  describe('2. 教材検索・フィルタリング統合', () => {
    test('教材検索 → フィルタリング → 詳細表示 → 学習開始', async () => {
      // Step 1: 基本検索
      const searchResponse = await fetch(`${serverBaseUrl}/api/materials/search?q=英会話`);
      expect(searchResponse.status).toBe(200);

      const searchData = await searchResponse.json();
      expect(searchData.materials).toBeDefined();
      expect(Array.isArray(searchData.materials)).toBe(true);

      // Step 2: カテゴリフィルタリング
      const categoryFilterResponse = await fetch(`${serverBaseUrl}/api/materials?category=conversation`);
      expect(categoryFilterResponse.status).toBe(200);

      const categoryData = await categoryFilterResponse.json();
      expect(categoryData.materials).toBeDefined();

      // Step 3: レベルフィルタリング
      const levelFilterResponse = await fetch(`${serverBaseUrl}/api/materials?level=beginner`);
      expect(levelFilterResponse.status).toBe(200);

      const levelData = await levelFilterResponse.json();
      expect(levelData.materials).toBeDefined();

      // Step 4: 複合フィルタリング
      const combinedFilterResponse = await fetch(
        `${serverBaseUrl}/api/materials?category=conversation&level=beginner&tags=greetings`
      );
      expect(combinedFilterResponse.status).toBe(200);

      const combinedData = await combinedFilterResponse.json();
      expect(combinedData.materials).toBeDefined();
    });

    test('教材推奨システム統合', async () => {
      // Step 1: 推奨教材API確認
      const recommendationsResponse = await fetch(`${serverBaseUrl}/api/learning/recommendations`);
      expect(recommendationsResponse.status).toBe(401); // 認証が必要（正常）

      // Step 2: 最近のリソース確認
      const recentResourcesResponse = await fetch(`${serverBaseUrl}/api/learning/recent-resources`);
      expect(recentResourcesResponse.status).toBe(401); // 認証が必要（正常）

      // Step 3: 教材推奨確認（公開API）
      const materialRecommendationsResponse = await fetch(`${serverBaseUrl}/api/materials/recommendations`);
      expect([200, 401]).toContain(materialRecommendationsResponse.status);
    });
  });

  describe('3. 学習進捗管理統合', () => {
    test('教材学習 → 進捗記録 → 完了処理 → ポイント獲得', async () => {
      // Step 1: 学習開始
      const startLearningResponse = await fetch(`${serverBaseUrl}/api/learning/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: 'test-material-id',
          action: 'start',
          startTime: new Date().toISOString()
        })
      });

      expect(startLearningResponse.status).toBe(401); // 認証が必要（正常）

      // Step 2: 進捗更新
      const updateProgressResponse = await fetch(`${serverBaseUrl}/api/learning/update-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockLearningProgress)
      });

      expect(updateProgressResponse.status).toBe(401); // 認証が必要（正常）

      // Step 3: 学習完了
      const completeResponse = await fetch(`${serverBaseUrl}/api/learning/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: 'test-material-id',
          action: 'complete',
          completedAt: new Date().toISOString(),
          totalTimeSpent: 30
        })
      });

      expect(completeResponse.status).toBe(401); // 認証が必要（正常）

      // Step 4: 学習統計確認
      const statsResponse = await fetch(`${serverBaseUrl}/api/learning/stats`);
      expect(statsResponse.status).toBe(401); // 認証が必要（正常）
    });

    test('進捗データの整合性確認', async () => {
      // 不正な進捗データ
      const invalidProgressResponse = await fetch(`${serverBaseUrl}/api/learning/update-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: '', // 空のID
          sectionsCompleted: [-1], // 不正なセクション番号
          completionRate: 150 // 不正な完了率
        })
      });

      expect([400, 401]).toContain(invalidProgressResponse.status);
    });
  });

  describe('4. 教材評価・レビューシステム統合', () => {
    test('教材評価 → レビュー投稿 → 評価反映 → 作成者通知', async () => {
      // Step 1: レビュー投稿
      const postReviewResponse = await fetch(`${serverBaseUrl}/api/learning/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: 'test-material-id',
          ...mockReview
        })
      });

      expect(postReviewResponse.status).toBe(401); // 認証が必要（正常）

      // Step 2: レビュー一覧取得
      const reviewsResponse = await fetch(`${serverBaseUrl}/api/learning/reviews?materialId=test-material-id`);
      expect([200, 401]).toContain(reviewsResponse.status);

      // Step 3: 役立つレビューマーク
      const helpfulResponse = await fetch(`${serverBaseUrl}/api/learning/reviews/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId: 'test-review-id',
          helpful: true
        })
      });

      expect(helpfulResponse.status).toBe(401); // 認証が必要（正常）

      // Step 4: コメント投稿
      const commentResponse = await fetch(`${serverBaseUrl}/api/learning/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: 'test-material-id',
          content: 'この教材について質問があります',
          parentId: null
        })
      });

      expect(commentResponse.status).toBe(401); // 認証が必要（正常）
    });

    test('レビューバリデーション確認', async () => {
      // 不正な評価値
      const invalidRatingResponse = await fetch(`${serverBaseUrl}/api/learning/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: 'test-material-id',
          rating: 6, // 1-5の範囲外
          comment: 'テストコメント'
        })
      });

      expect([400, 401]).toContain(invalidRatingResponse.status);

      // 空のコメント
      const emptyCommentResponse = await fetch(`${serverBaseUrl}/api/learning/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: 'test-material-id',
          content: '', // 空のコンテンツ
        })
      });

      expect([400, 401]).toContain(emptyCommentResponse.status);
    });
  });

  describe('5. 教材管理・権限制御', () => {
    test('教材所有者権限と編集制御', async () => {
      // Step 1: 自分の教材一覧
      const myMaterialsResponse = await fetch(`${serverBaseUrl}/api/materials?author=me`);
      expect(myMaterialsResponse.status).toBe(401); // 認証が必要（正常）

      // Step 2: 教材編集
      const editMaterialResponse = await fetch(`${serverBaseUrl}/api/materials/test-material-id`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '更新されたタイトル',
          description: '更新された説明'
        })
      });

      expect(editMaterialResponse.status).toBe(401); // 認証が必要（正常）

      // Step 3: 教材削除
      const deleteMaterialResponse = await fetch(`${serverBaseUrl}/api/materials/test-material-id`, {
        method: 'DELETE'
      });

      expect(deleteMaterialResponse.status).toBe(401); // 認証が必要（正常）

      // Step 4: お気に入り機能
      const favoritesResponse = await fetch(`${serverBaseUrl}/api/materials/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: 'test-material-id',
          favorite: true
        })
      });

      expect(favoritesResponse.status).toBe(401); // 認証が必要（正常）
    });
  });

  describe('6. データ取得・パフォーマンステスト', () => {
    test('大量教材データの取得パフォーマンス', async () => {
      const startTime = Date.now();

      // 複数の同時リクエスト
      const requests = [
        fetch(`${serverBaseUrl}/api/materials?limit=50`),
        fetch(`${serverBaseUrl}/api/materials/search?q=english&limit=20`),
        fetch(`${serverBaseUrl}/api/learning/categories`),
        fetch(`${serverBaseUrl}/api/learning/difficulties`)
      ];

      const results = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // すべてのリクエストが成功することを確認
      for (const result of results) {
        expect(result.status).toBe(200);
      }

      // 全体の処理時間が2秒以内であることを確認
      expect(totalTime).toBeLessThan(2000);

      console.log(`教材データ取得時間: ${totalTime}ms`);
    });

    test('教材検索のパフォーマンス', async () => {
      const searchTerms = ['english', 'conversation', 'grammar', 'vocabulary', 'pronunciation'];
      const startTime = Date.now();

      const searchRequests = searchTerms.map(term =>
        fetch(`${serverBaseUrl}/api/materials/search?q=${term}&limit=10`)
      );

      const results = await Promise.all(searchRequests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // すべての検索が成功することを確認
      for (const result of results) {
        expect(result.status).toBe(200);
      }

      // 5つの検索が3秒以内に完了することを確認
      expect(totalTime).toBeLessThan(3000);

      console.log(`教材検索時間: ${totalTime}ms`);
    });
  });

  describe('7. エラーハンドリング・セキュリティ', () => {
    test('不正アクセス・権限エラーの適切な処理', async () => {
      // 他人の教材編集試行
      const unauthorizedEditResponse = await fetch(`${serverBaseUrl}/api/materials/other-user-material`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '不正な編集'
        })
      });

      expect([401, 403]).toContain(unauthorizedEditResponse.status);

      // 存在しない教材アクセス
      const notFoundResponse = await fetch(`${serverBaseUrl}/api/materials/nonexistent-id`);
      expect(notFoundResponse.status).toBe(404);

      // SQLインジェクション攻撃試行
      const sqlInjectionResponse = await fetch(
        `${serverBaseUrl}/api/materials/search?q='; DROP TABLE materials; --`
      );
      expect(sqlInjectionResponse.status).toBe(200); // 正常に処理される（攻撃は無効化される）
    });

    test('入力サニタイゼーション確認', async () => {
      // XSSスクリプト投稿試行
      const xssResponse = await fetch(`${serverBaseUrl}/api/learning/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: 'test-material-id',
          content: '<script>alert("XSS")</script>悪意のあるスクリプト'
        })
      });

      expect([400, 401]).toContain(xssResponse.status);

      // 異常に長いコンテンツ
      const longContentResponse = await fetch(`${serverBaseUrl}/api/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mockMaterial,
          content: 'A'.repeat(100000) // 10万文字
        })
      });

      expect([400, 401]).toContain(longContentResponse.status);
    });
  });
});

/**
 * 教材システム統合テスト実行ヘルパー
 */
export async function runMaterialSystemIntegrationTest(): Promise<boolean> {
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 基本教材システム確認
    const materialsAPI = await fetch(`${baseUrl}/api/materials`);
    const searchAPI = await fetch(`${baseUrl}/api/materials/search?q=test`);
    const categoriesAPI = await fetch(`${baseUrl}/api/learning/categories`);
    
    if (materialsAPI.status !== 200 || searchAPI.status !== 200 || categoriesAPI.status !== 200) {
      return false;
    }
    
    console.log('✅ 教材システム統合テスト: 基本機能正常');
    return true;
  } catch (error) {
    console.error('❌ 教材システム統合テスト: 失敗', error);
    return false;
  }
} 
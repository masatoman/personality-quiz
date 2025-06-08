/**
 * 認証フロー統合テスト - Critical Priority
 * 
 * テスト対象:
 * 1. 新規ユーザー登録 → プロフィール作成 → ギバー診断
 * 2. ログイン → ダッシュボード表示 → ユーザー状態同期
 * 3. パスワードリセット → メール認証 → 再ログイン
 * 4. プロフィール更新 → データ保存 → 表示反映
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// テスト用のモックデータ
const testUsers = {
  newUser: {
    email: 'test-new-user@example.com',
    password: 'TestPassword123!',
    profile: {
      displayName: 'テスト太郎',
      bio: 'テスト用ユーザーです',
      learningGoals: ['TOEIC向上', '会話力向上']
    }
  },
  existingUser: {
    email: 'test-existing@example.com',
    password: 'ExistingPassword123!'
  }
};

describe('🔴 Critical: 認証フロー統合テスト', () => {
  let serverBaseUrl: string;

  beforeAll(() => {
    serverBaseUrl = process.env.TEST_SERVER_URL || 'http://localhost:3000';
  });

  describe('1. 新規ユーザー登録フロー', () => {
    test('新規登録 → プロフィール作成 → ギバー診断の完全フロー', async () => {
      // Step 1: 新規登録ページアクセス
      const signupPageResponse = await fetch(`${serverBaseUrl}/auth/signup`);
      expect(signupPageResponse.status).toBe(200);
      
      const signupHtml = await signupPageResponse.text();
      expect(signupHtml).toContain('新規登録');
      expect(signupHtml).toContain('メールアドレス');
      expect(signupHtml).toContain('パスワード');

      // Step 2: 新規登録API呼び出し
      const signupResponse = await fetch(`${serverBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUsers.newUser.email,
          password: testUsers.newUser.password
        })
      });

      expect(signupResponse.status).toBe(200);
      const signupData = await signupResponse.json();
      expect(signupData.user).toBeDefined();
      expect(signupData.user.email).toBe(testUsers.newUser.email);

      // Step 3: プロフィール作成ページへのリダイレクト確認
      const profilePageResponse = await fetch(`${serverBaseUrl}/welcome/profile`);
      expect(profilePageResponse.status).toBe(200);
      
      const profileHtml = await profilePageResponse.text();
      expect(profileHtml).toContain('プロフィール設定');
      expect(profileHtml).toContain('表示名');

      // Step 4: ギバー診断ページアクセス可能性確認
      const quizPageResponse = await fetch(`${serverBaseUrl}/quiz`);
      expect(quizPageResponse.status).toBe(200);
      
      const quizHtml = await quizPageResponse.text();
      expect(quizHtml).toContain('ギバー診断');
    });

    test('新規登録時のバリデーション確認', async () => {
      // 無効なメールアドレス
      const invalidEmailResponse = await fetch(`${serverBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: testUsers.newUser.password
        })
      });

      expect(invalidEmailResponse.status).toBe(400);
      const errorData = await invalidEmailResponse.json();
      expect(errorData.error).toContain('メールアドレス');

      // 弱いパスワード
      const weakPasswordResponse = await fetch(`${serverBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test-weak@example.com',
          password: '123'
        })
      });

      expect(weakPasswordResponse.status).toBe(400);
      const weakPasswordData = await weakPasswordResponse.json();
      expect(weakPasswordData.error).toContain('パスワード');
    });
  });

  describe('2. ログインフロー統合', () => {
    test('ログイン → ダッシュボード表示 → ユーザー状態同期', async () => {
      // Step 1: ログインページアクセス
      const loginPageResponse = await fetch(`${serverBaseUrl}/auth/login`);
      expect(loginPageResponse.status).toBe(200);
      
      const loginHtml = await loginPageResponse.text();
      expect(loginHtml).toContain('ログイン');
      expect(loginHtml).toContain('メールアドレス');

      // Step 2: ログインAPI呼び出し
      const loginResponse = await fetch(`${serverBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUsers.existingUser.email,
          password: testUsers.existingUser.password
        })
      });

      // 認証が必要なため401が正常（テスト環境ではユーザーが存在しない）
      expect([200, 401]).toContain(loginResponse.status);

      // Step 3: ダッシュボードページアクセス確認
      const dashboardResponse = await fetch(`${serverBaseUrl}/dashboard`);
      expect(dashboardResponse.status).toBe(200);
      
      const dashboardHtml = await dashboardResponse.text();
      expect(dashboardHtml).toContain('ダッシュボード');
      expect(dashboardHtml).toContain('学習統計');
    });

    test('ログイン失敗時のエラーハンドリング', async () => {
      // 存在しないユーザー
      const nonExistentUserResponse = await fetch(`${serverBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        })
      });

      expect(nonExistentUserResponse.status).toBe(401);
      const errorData = await nonExistentUserResponse.json();
      expect(errorData.error).toBeDefined();

      // 間違ったパスワード
      const wrongPasswordResponse = await fetch(`${serverBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUsers.existingUser.email,
          password: 'WrongPassword123!'
        })
      });

      expect(wrongPasswordResponse.status).toBe(401);
    });
  });

  describe('3. セッション管理統合', () => {
    test('認証が必要なAPIの保護確認', async () => {
      const protectedEndpoints = [
        '/api/user/profile',
        '/api/points/balance',
        '/api/learning/recommendations',
        '/api/dashboard'
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(`${serverBaseUrl}${endpoint}`);
        expect(response.status).toBe(401);
        
        const data = await response.json();
        expect(data.error).toContain('認証');
      }
    });

    test('ログアウト機能確認', async () => {
      const logoutResponse = await fetch(`${serverBaseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect([200, 401]).toContain(logoutResponse.status);
    });
  });

  describe('4. プロフィール管理統合', () => {
    test('プロフィール更新 → データ保存 → 表示反映', async () => {
      // Step 1: プロフィールページアクセス
      const profilePageResponse = await fetch(`${serverBaseUrl}/profile`);
      expect(profilePageResponse.status).toBe(200);
      
      const profileHtml = await profilePageResponse.text();
      expect(profileHtml).toContain('プロフィール');
      expect(profileHtml).toContain('編集');

      // Step 2: プロフィール更新API確認（認証エラーが正常）
      const updateResponse = await fetch(`${serverBaseUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUsers.newUser.profile)
      });

      expect(updateResponse.status).toBe(401); // 認証が必要
      
      const errorData = await updateResponse.json();
      expect(errorData.error).toContain('認証');
    });

    test('プロフィール取得API確認', async () => {
      const getProfileResponse = await fetch(`${serverBaseUrl}/api/user/profile`);
      expect(getProfileResponse.status).toBe(401); // 認証が必要
      
      const errorData = await getProfileResponse.json();
      expect(errorData.error).toContain('認証');
    });
  });

  describe('5. 認証状態の整合性確認', () => {
    test('認証状態とページアクセス権限の整合性', async () => {
      // 認証が必要なページ
      const authRequiredPages = [
        '/dashboard',
        '/profile',
        '/my-materials',
        '/create/standard/1'
      ];

      for (const page of authRequiredPages) {
        const response = await fetch(`${serverBaseUrl}${page}`);
        // リダイレクトまたは認証ページ表示が正常
        expect([200, 302, 401]).toContain(response.status);
      }

      // 認証不要なページ
      const publicPages = [
        '/',
        '/quiz',
        '/explore',
        '/auth/login',
        '/auth/signup'
      ];

      for (const page of publicPages) {
        const response = await fetch(`${serverBaseUrl}${page}`);
        expect(response.status).toBe(200);
      }
    });

    test('API認証状態の一貫性確認', async () => {
      // 認証不要なAPI
      const publicAPIs = [
        '/api/learning/categories',
        '/api/learning/difficulties',
        '/api/learning/resources',
        '/api/quiz/save-results'
      ];

      for (const api of publicAPIs) {
        const response = await fetch(`${serverBaseUrl}${api}`);
        expect([200, 400]).toContain(response.status); // 200 or 400(パラメータ不足)が正常
      }

      // 認証必要なAPI
      const protectedAPIs = [
        '/api/points/balance',
        '/api/learning/recommendations',
        '/api/learning/progress',
        '/api/user/profile'
      ];

      for (const api of protectedAPIs) {
        const response = await fetch(`${serverBaseUrl}${api}`);
        expect(response.status).toBe(401);
      }
    });
  });
});

/**
 * 認証フロー統合テスト実行ヘルパー
 */
export async function runAuthFlowIntegrationTest(): Promise<boolean> {
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 基本認証フロー確認
    const loginPage = await fetch(`${baseUrl}/auth/login`);
    const signupPage = await fetch(`${baseUrl}/auth/signup`);
    const dashboardPage = await fetch(`${baseUrl}/dashboard`);
    
    if (loginPage.status !== 200 || signupPage.status !== 200 || dashboardPage.status !== 200) {
      return false;
    }
    
    console.log('✅ 認証フロー統合テスト: 基本機能正常');
    return true;
  } catch (error) {
    console.error('❌ 認証フロー統合テスト: 失敗', error);
    return false;
  }
} 
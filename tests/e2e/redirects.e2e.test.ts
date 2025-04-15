import { test, expect } from '@playwright/test';

// MCPサーバーのベースURL
const BASE_URL = 'http://localhost:3000';

// テストユーザー情報
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123'
};

test.describe('リダイレクト処理テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  // 認証が必要なページへの未認証アクセステスト
  test('認証必須ページへの未認証アクセス', async ({ page }) => {
    const protectedPages = [
      { path: '/dashboard', name: 'ダッシュボード' },
      { path: '/settings', name: 'ユーザー設定' },
      { path: '/materials/create', name: '教材作成' },
      { path: '/profile/edit', name: 'プロフィール編集' }
    ];

    for (const { path, name } of protectedPages) {
      // 未認証状態でアクセス
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');

      // ログインページへのリダイレクトを確認
      await expect(page).toHaveURL(`${BASE_URL}/login`);
      
      // リダイレクト後のメッセージを確認
      await expect(page.locator('.alert-message')).toContainText('ログインが必要です');
      
      // リダイレクト元のURLがクエリパラメータとして保持されているか確認
      const url = new URL(page.url());
      expect(url.searchParams.get('redirect')).toBe(path);
    }
  });

  // ログイン後のリダイレクトテスト
  test('ログイン後の元ページへのリダイレクト', async ({ page }) => {
    // ダッシュボードへアクセス（未認証）
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // ログインページへリダイレクトされることを確認
    await expect(page).toHaveURL(`${BASE_URL}/login?redirect=/dashboard`);

    // ログインフォームに入力
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // 元のページ（ダッシュボード）にリダイレクトされることを確認
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  // ログイン済みユーザーのアクセス制御テスト
  test('ログイン済みユーザーのアクセス制御', async ({ page }) => {
    // ログイン処理
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // ログイン・登録ページへのアクセス試行
    const authPages = [
      { path: '/login', redirectTo: '/dashboard' },
      { path: '/register', redirectTo: '/dashboard' }
    ];

    for (const { path, redirectTo } of authPages) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');
      
      // ダッシュボードにリダイレクトされることを確認
      await expect(page).toHaveURL(`${BASE_URL}${redirectTo}`);
    }
  });

  // ギバー診断フローのリダイレクトテスト
  test('ギバー診断フローのリダイレクト', async ({ page }) => {
    // 新規登録
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', `new-user-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'newpass123');
    await page.click('button[type="submit"]');
    
    // ギバー診断ページにリダイレクトされることを確認
    await expect(page).toHaveURL(`${BASE_URL}/quiz`);
    
    // 診断をスキップしようとしてダッシュボードにアクセス
    await page.goto(`${BASE_URL}/dashboard`);
    
    // 診断ページに戻されることを確認
    await expect(page).toHaveURL(`${BASE_URL}/quiz`);
    await expect(page.locator('.alert-message')).toContainText('ギバー診断を完了してください');
  });

  // 外部リンクからの戻りリダイレクトテスト
  test('外部認証後の戻りリダイレクト', async ({ page }) => {
    // OAuth認証をシミュレート
    await page.goto(`${BASE_URL}/auth/google/callback?code=test-code`);
    await page.waitForLoadState('networkidle');
    
    // 初回ログインの場合はギバー診断へ
    await expect(page).toHaveURL(`${BASE_URL}/quiz`);
    
    // 既存ユーザーの場合はダッシュボードへ
    await page.goto(`${BASE_URL}/auth/google/callback?code=existing-user`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  // エラー時のリダイレクトテスト
  test('エラー時の適切なリダイレクト', async ({ page }) => {
    // 無効なトークンでのAPI呼び出し
    await page.goto(`${BASE_URL}/api/user/profile`);
    await page.waitForLoadState('networkidle');
    
    // ログインページへリダイレクト
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    // セッション切れをシミュレート
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
    });
    await page.goto(`${BASE_URL}/dashboard`);
    
    // ログインページへリダイレクト
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.locator('.alert-message')).toContainText('セッションが切れました');
  });
}); 
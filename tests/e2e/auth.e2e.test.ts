import { test, expect } from '@playwright/test';

/**
 * 認証機能のE2Eテスト
 * 優先度: P0（認証は重要な基幹機能のため）
 * 
 * 前提条件:
 * - テスト用データベースが初期化されていること
 * - テストユーザーが作成されていること
 * - アプリケーションサーバーが起動していること
 * 
 * テスト環境:
 * - ブラウザ: Chromium
 * - 画面サイズ: 1280x720
 */
test.describe('認証機能のE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000/login');
  });

  // 基本的な認証フロー (P0)
  test('メールアドレスとパスワードでログインできる @smoke', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  test('Googleアカウントでログインできる @smoke', async ({ page }) => {
    await page.click('[data-testid="google-login-button"]');
    // Googleログインフローのモック
    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  test('GitHubアカウントでログインできる @smoke', async ({ page }) => {
    await page.click('[data-testid="github-login-button"]');
    // GitHubログインフローのモック
    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  // エラーケース (P0)
  test('無効な認証情報でログインに失敗する', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    const errorMessage = page.getByText('メールアドレスまたはパスワードが正しくありません');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('連続した失敗でレート制限が適用される', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
    }

    const errorMessage = page.getByText('ログイン試行回数が制限を超えました');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  // セッション管理 (P1)
  test('セッションが正しく持続する', async ({ page, context }) => {
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="remember-me"]');
    await page.click('[data-testid="login-button"]');

    // 新しいページを開いてセッションが維持されているか確認
    const newPage = await context.newPage();
    await newPage.goto('http://localhost:3000/dashboard');
    await expect(newPage.getByText('ダッシュボード')).toBeVisible();
  });

  // アクセシビリティ (P1)
  test('キーボードでログインフォームを操作できる', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="remember-me"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
  });

  test('スクリーンリーダーで適切に読み上げられる', async ({ page }) => {
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    const loginButton = page.locator('[data-testid="login-button"]');

    await expect(emailInput).toHaveAttribute('aria-required', 'true');
    await expect(passwordInput).toHaveAttribute('aria-required', 'true');
    await expect(loginButton).toHaveAttribute('role', 'button');
    
    // アクセシビリティツリーの検証
    const snapshot = await page.accessibility.snapshot();
    expect(snapshot).toMatchObject({
      role: 'form',
      name: 'ログインフォーム',
      children: expect.arrayContaining([
        expect.objectContaining({ role: 'textbox', name: 'メールアドレス' }),
        expect.objectContaining({ role: 'textbox', name: 'パスワード' }),
        expect.objectContaining({ role: 'button', name: 'ログイン' })
      ])
    });
  });

  // ログアウト (P0)
  test('ログアウトができる @smoke', async ({ page }) => {
    // 最初にログイン
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // ログアウトを実行
    await page.click('[data-testid="user-menu-button"]');
    await page.click('[data-testid="logout-button"]');

    // ログアウト後の状態確認
    await expect(page.getByText('ログイン')).toBeVisible();
    
    // セッションが破棄されていることを確認
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.url()).toBe('http://localhost:3000/login');
  });
}); 
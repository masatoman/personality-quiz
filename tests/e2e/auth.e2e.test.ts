import { test, expect } from '@playwright/test';

test.describe('認証機能のE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });

  test('メールアドレスとパスワードでログインできる', async ({ page }) => {
    await page.fill('[aria-label="email-input"]', 'test@example.com');
    await page.fill('[aria-label="password-input"]', 'password123');
    await page.click('[aria-label="login-button"]');

    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  test('Googleアカウントでログインできる', async ({ page }) => {
    await page.click('[aria-label="google-login-button"]');

    // Googleログインフローの処理
    // Note: 実際のGoogleログインフローはモックする必要があります
    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  test('GitHubアカウントでログインできる', async ({ page }) => {
    await page.click('[aria-label="github-login-button"]');

    // GitHubログインフローの処理
    // Note: 実際のGitHubログインフローはモックする必要があります
    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  test('無効な認証情報でログインに失敗する', async ({ page }) => {
    await page.fill('[aria-label="email-input"]', 'invalid@example.com');
    await page.fill('[aria-label="password-input"]', 'wrongpassword');
    await page.click('[aria-label="login-button"]');

    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible();
  });

  test('ログアウトができる', async ({ page }) => {
    // 最初にログイン
    await page.fill('[aria-label="email-input"]', 'test@example.com');
    await page.fill('[aria-label="password-input"]', 'password123');
    await page.click('[aria-label="login-button"]');

    // ログアウトを実行
    await page.click('[aria-label="user-menu-button"]');
    await page.click('[aria-label="logout-button"]');

    await expect(page.getByText('ログイン')).toBeVisible();
  });
}); 
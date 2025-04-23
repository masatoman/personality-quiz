import { test, expect } from '@playwright/test';
import { setupTestDatabase, cleanupTestDatabase } from './helpers/db-utils';

test.describe('パフォーマンステスト（MVP）', () => {
  test.beforeAll(async () => {
    await setupTestDatabase();
  });

  test.afterAll(async () => {
    await cleanupTestDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('基本的な表示性能要件', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // 教材一覧ページの読み込み時間を計測
    const startTime = Date.now();
    await page.goto('/materials');
    await page.waitForSelector('[data-testid="material-card"]');
    const loadTime = Date.now() - startTime;

    // 3秒以内に主要コンテンツが表示されることを確認
    expect(loadTime).toBeLessThan(3000);

    // 教材カードが表示されることを確認
    const materialCards = page.locator('[data-testid="material-card"]');
    await expect(materialCards).toBeVisible();
  });

  test('基本的なレスポンス性能要件', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // 教材詳細ページに移動
    const navigationStart = Date.now();
    await page.goto('/materials/test-material-1');
    await page.waitForSelector('[data-testid="material-content"]');
    const navigationTime = Date.now() - navigationStart;

    // ページ遷移が2秒以内に完了することを確認
    expect(navigationTime).toBeLessThan(2000);

    // インタラクションの応答時間を計測
    const buttonClickStart = Date.now();
    await page.click('text=学習を開始');
    await page.waitForSelector('[data-testid="learning-content"]');
    const buttonClickTime = Date.now() - buttonClickStart;

    // ボタンクリックのレスポンスが1秒以内であることを確認
    expect(buttonClickTime).toBeLessThan(1000);
  });
}); 
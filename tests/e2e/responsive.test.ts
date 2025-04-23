import { test, expect } from '@playwright/test';
import { setupTestDatabase, cleanupTestDatabase } from './helpers/db-utils';

test.describe('レスポンシブデザインテスト（MVP）', () => {
  test.beforeAll(async () => {
    await setupTestDatabase();
  });

  test.afterAll(async () => {
    await cleanupTestDatabase();
  });

  test('モバイル表示の基本要件', async ({ page }) => {
    // ビューポートをモバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // ハンバーガーメニューの表示確認
    const menuButton = page.locator('[data-testid="menu-button"]');
    await expect(menuButton).toBeVisible();

    // メニューを開く
    await menuButton.click();
    const navMenu = page.locator('[data-testid="nav-menu"]');
    await expect(navMenu).toBeVisible();

    // 教材一覧ページに移動
    await page.goto('/materials');

    // 教材カードが1列で表示されることを確認
    const materialCard = page.locator('[data-testid="material-card"]').first();
    const cardBounds = await materialCard.boundingBox();
    expect(cardBounds?.width).toBeLessThan(375); // ビューポート幅以内
  });

  test('タブレット表示の基本要件', async ({ page }) => {
    // ビューポートをタブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // 教材一覧ページに移動
    await page.goto('/materials');

    // 教材カードが2列で表示されることを確認
    const materialCards = page.locator('[data-testid="material-card"]');
    const firstCard = materialCards.first();
    const secondCard = materialCards.nth(1);
    
    const firstBounds = await firstCard.boundingBox();
    const secondBounds = await secondCard.boundingBox();
    
    // 2つのカードが横並びであることを確認
    expect(firstBounds?.y).toEqual(secondBounds?.y);
  });

  test('フォームの基本的なレスポンシブ対応', async ({ page }) => {
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });

    // 教材作成ページに移動
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');
    await page.goto('/materials/create');

    // フォーム要素が画面幅に収まっていることを確認
    const form = page.locator('[data-testid="material-form"]');
    const formBounds = await form.boundingBox();
    expect(formBounds?.width).toBeLessThan(375);

    // 入力フィールドが適切にリサイズされることを確認
    const titleInput = page.locator('[data-testid="title-input"]');
    const titleBounds = await titleInput.boundingBox();
    expect(titleBounds?.width).toBeLessThan(375);
  });
}); 
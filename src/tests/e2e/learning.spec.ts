import { test, expect } from '@playwright/test';

test.describe('学習フロー', () => {
  test('教材検索から学習完了までのフロー', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');
    
    // 2. 教材検索
    await page.click('text=教材を探す');
    await page.fill('[data-testid="search-input"]', 'TOEIC');
    await page.click('[data-testid="search-button"]');
    
    // 3. 教材の選択
    await page.click('[data-testid="material-card"]:first-child');
    
    // 4. 学習の開始
    await page.click('text=学習を開始');
    
    // 5. コンテンツの閲覧
    await expect(page.locator('[data-testid="content-viewer"]')).toBeVisible();
    
    // 6. クイズの回答
    await page.click('text=クイズに挑戦');
    for (let i = 1; i <= 5; i++) {
      await page.click(`[data-testid="quiz-${i}-correct-option"]`);
      await page.click('text=次へ');
    }
    
    // 7. 学習完了の確認
    await expect(page.locator('[data-testid="completion-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="earned-points"]')).toBeVisible();
  });
}); 
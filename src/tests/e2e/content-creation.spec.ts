import { test, expect } from '@playwright/test';

test.describe('教材作成フロー', () => {
  test('教材の作成から公開までのフロー', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');
    
    // 2. 教材作成ページへ移動
    await page.click('text=教材を作成');
    
    // 3. 基本情報の入力
    await page.fill('[data-testid="title-input"]', 'ビジネス英語入門');
    await page.fill('[data-testid="description-input"]', 'ビジネスで使える基本的な英語表現を学びます');
    await page.selectOption('[data-testid="category-select"]', 'business');
    await page.selectOption('[data-testid="level-select"]', 'intermediate');
    
    // 4. コンテンツの作成
    await page.click('text=コンテンツを追加');
    await page.fill('[data-testid="content-editor"]', '# Section 1\nビジネスメールの書き方');
    
    // 5. クイズの追加
    await page.click('text=クイズを追加');
    await page.fill('[data-testid="question-input"]', 'What is the correct greeting for a business email?');
    await page.fill('[data-testid="option-1-input"]', 'Dear Sir/Madam');
    await page.fill('[data-testid="option-2-input"]', 'Hey there');
    await page.fill('[data-testid="option-3-input"]', 'Hi buddy');
    await page.click('[data-testid="correct-option-1"]');
    
    // 6. プレビュー確認
    await page.click('text=プレビュー');
    await expect(page.locator('[data-testid="preview-content"]')).toBeVisible();
    
    // 7. 公開設定
    await page.click('text=公開する');
    await expect(page.locator('[data-testid="publish-success"]')).toBeVisible();
  });
}); 
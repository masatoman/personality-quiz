import { test, expect } from '@playwright/test';

test.describe('英語学習スタイル診断アプリ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/', {
      waitUntil: 'networkidle',
      timeout: 60000 // タイムアウトを60秒に延長
    });
  });

  test('診断を開始できる', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible({ timeout: 30000 });
    const startButton = page.getByRole('button', { name: '診断を始める' });
    await expect(startButton).toBeVisible({ timeout: 30000 });
    await startButton.click();
    await expect(page.locator('.question-card')).toBeVisible({ timeout: 30000 });
  });

  test('10問の質問に回答できる', async ({ page }) => {
    const startButton = page.getByRole('button', { name: '診断を始める' });
    await startButton.click();

    for (let i = 0; i < 10; i++) {
      const questionCard = page.locator('.question-card');
      await expect(questionCard).toBeVisible({ timeout: 30000 });
      
      const options = page.locator('.option-button');
      await expect(options.first()).toBeVisible({ timeout: 30000 });
      await options.first().click();
      
      const nextButton = page.getByRole('button', { name: '次へ' });
      await expect(nextButton).toBeVisible({ timeout: 30000 });
      await nextButton.click();
      
      // 最後の質問の後は結果が表示されるまで待機
      if (i === 9) {
        await expect(page.locator('.result-card')).toBeVisible({ timeout: 30000 });
      }
    }
  });

  test('結果をTwitterでシェアできる', async ({ page, context }) => {
    const startButton = page.getByRole('button', { name: '診断を始める' });
    await startButton.click();

    // 10問に回答
    for (let i = 0; i < 10; i++) {
      const options = page.locator('.option-button');
      await expect(options.first()).toBeVisible({ timeout: 30000 });
      await options.first().click();
      
      const nextButton = page.getByRole('button', { name: '次へ' });
      await expect(nextButton).toBeVisible({ timeout: 30000 });
      await nextButton.click();
    }

    // 結果画面の表示を待機
    await expect(page.locator('.result-card')).toBeVisible({ timeout: 30000 });

    // Twitterシェアボタンをクリック
    const twitterButton = page.getByRole('link', { name: /Twitter/ });
    await expect(twitterButton).toBeVisible({ timeout: 30000 });
    
    // 新しいタブでTwitterシェアページが開くことを確認
    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 30000 }),
      twitterButton.click()
    ]);

    expect(newPage.url()).toContain('twitter.com/intent/tweet');
    await newPage.close();
  });
}); 
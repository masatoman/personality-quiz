import { test, expect } from '@playwright/test';

test('基本的なページ表示テスト', async ({ page }) => {
  await page.goto('http://localhost:3002/');
  
  // ページが正しく読み込まれることを確認
  await expect(page).toHaveTitle(/ShiftWith/);
  
  // 基本的なUI要素の存在確認
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});

test('ナビゲーションの動作確認', async ({ page }) => {
  await page.goto('http://localhost:3002/');
  
  // メニューの存在確認
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();
  
  // リンクの動作確認
  await page.click('text=ホーム');
  await expect(page).toHaveURL('http://localhost:3002/');
}); 
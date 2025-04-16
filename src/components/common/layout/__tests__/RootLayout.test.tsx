import { test, expect } from '@playwright/test';

test.describe('RootLayout', () => {
  test('should render header, main content and footer', async ({ page }) => {
    await page.goto('/');
    
    // ヘッダーの確認
    const header = await page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/sticky top-0/);
    
    // メインコンテンツエリアの確認
    const main = await page.locator('main');
    await expect(main).toBeVisible();
    await expect(main).toHaveClass(/container/);
    
    // フッターの確認
    const footer = await page.locator('footer');
    await expect(footer).toBeVisible();
    
    // フッターリンクの確認
    const footerLinks = await page.locator('footer a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // ソーシャルメディアリンクの確認
    const socialLinks = await page.locator('footer svg');
    await expect(socialLinks).toHaveCount(2); // Twitter と GitHub
  });
  
  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // ナビゲーションリンクのアクセシビリティ確認
    const links = await page.locator('a');
    for (const link of await links.all()) {
      // リンクがキーボードでフォーカス可能か確認
      await expect(link).toBeVisible();
      await link.focus();
      await expect(link).toBeFocused();
    }
    
    // スクリーンリーダー用のテキストが存在することを確認
    const srOnlyTexts = await page.locator('.sr-only');
    await expect(srOnlyTexts).toHaveCount(2); // Twitter と GitHub のラベル
  });
}); 
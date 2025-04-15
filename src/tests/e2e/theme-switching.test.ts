import { test, expect } from '@playwright/test';

test.describe('テーマ切り替え機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('デフォルトのテーマが正しく表示される', async ({ page }) => {
    // デフォルトのテーマ（tealPurpleTheme）の確認
    await expect(page.locator('body')).toHaveClass(/tealPurpleTheme/);
    await expect(page.locator('[data-testid="theme-name"]')).toHaveText('Teal Purple');
  });

  test('テーマを切り替えると色が変更される', async ({ page }) => {
    // テーマスイッチャーを開く
    await page.click('[data-testid="theme-switcher-button"]');
    
    // Blue Amberテーマに切り替え
    await page.click('[data-testid="theme-option-blueAmberTheme"]');
    
    // テーマが変更されたことを確認
    await expect(page.locator('body')).toHaveClass(/blueAmberTheme/);
    await expect(page.locator('[data-testid="theme-name"]')).toHaveText('Blue Amber');
    
    // プライマリカラーとアクセントカラーの変更を確認
    const header = page.locator('header');
    await expect(header).toHaveCSS('background-color', 'rgb(59, 130, 246)'); // Blue
  });

  test('選択したテーマがページリロード後も保持される', async ({ page }) => {
    // Green Magentaテーマに切り替え
    await page.click('[data-testid="theme-switcher-button"]');
    await page.click('[data-testid="theme-option-greenMagentaTheme"]');
    
    // ページをリロード
    await page.reload();
    
    // テーマが保持されていることを確認
    await expect(page.locator('body')).toHaveClass(/greenMagentaTheme/);
    await expect(page.locator('[data-testid="theme-name"]')).toHaveText('Green Magenta');
  });

  test('モバイル表示でテーマ切り替えが機能する', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // テーマスイッチャーが表示されることを確認
    await expect(page.locator('[data-testid="theme-switcher-button"]')).toBeVisible();
    
    // テーマ名のテキストが非表示になっていることを確認
    await expect(page.locator('[data-testid="theme-name"]')).toBeHidden();
    
    // テーマ切り替えが機能することを確認
    await page.click('[data-testid="theme-switcher-button"]');
    await page.click('[data-testid="theme-option-blueAmberTheme"]');
    await expect(page.locator('body')).toHaveClass(/blueAmberTheme/);
  });
}); 
import { test, expect } from '@playwright/test';

test.describe('テーマ切り替えのテスト', () => {
  test('各テーマに正しく切り替わることを確認', async ({ page }) => {
    // テーマデモページに移動
    await page.goto('/theme-demo');
    
    // 初期テーマの確認（tealPurpleTheme）
    const initialThemeColor = await page.evaluate(() => {
      const root = document.documentElement;
      return getComputedStyle(root).getPropertyValue('--color-primary').trim();
    });
    expect(initialThemeColor).toBe('#1A9A9D');

    // テーマセレクターを取得
    const themeSelector = await page.locator('select[aria-label="テーマを選択"]');
    
    // Blue & Amberテーマに切り替え
    await themeSelector.selectOption('blueAmberTheme');
    await page.waitForTimeout(300); // トランジション待機
    
    const blueAmberColor = await page.evaluate(() => {
      const root = document.documentElement;
      return getComputedStyle(root).getPropertyValue('--color-primary').trim();
    });
    expect(blueAmberColor).toBe('#2D5DA1');

    // Green & Magentaテーマに切り替え
    await themeSelector.selectOption('greenMagentaTheme');
    await page.waitForTimeout(300); // トランジション待機
    
    const greenMagentaColor = await page.evaluate(() => {
      const root = document.documentElement;
      return getComputedStyle(root).getPropertyValue('--color-primary').trim();
    });
    expect(greenMagentaColor).toBe('#00A896');

    // ページをリロードしてテーマが保持されているか確認
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const persistedColor = await page.evaluate(() => {
      const root = document.documentElement;
      return getComputedStyle(root).getPropertyValue('--color-primary').trim();
    });
    expect(persistedColor).toBe('#00A896');
  });

  test('テーマ切り替え時のUIコンポーネントの変更を確認', async ({ page }) => {
    await page.goto('/theme-demo');
    
    // テーマセレクターを取得
    const themeSelector = await page.locator('select[aria-label="テーマを選択"]');
    
    // 各テーマでボタンの背景色を確認
    const checkButtonColor = async () => {
      const buttonColor = await page.evaluate(() => {
        const button = document.querySelector('.theme-button-primary');
        if (!button) throw new Error('テーマボタンが見つかりません');
        return window.getComputedStyle(button).backgroundColor;
      });
      return buttonColor;
    };

    // Blue & Amberテーマに切り替えてボタンの色を確認
    await themeSelector.selectOption('blueAmberTheme');
    await page.waitForTimeout(300);
    const blueAmberButtonColor = await checkButtonColor();
    expect(blueAmberButtonColor).not.toBe('');

    // Green & Magentaテーマに切り替えてボタンの色を確認
    await themeSelector.selectOption('greenMagentaTheme');
    await page.waitForTimeout(300);
    const greenMagentaButtonColor = await checkButtonColor();
    expect(greenMagentaButtonColor).not.toBe(blueAmberButtonColor);
  });
}); 
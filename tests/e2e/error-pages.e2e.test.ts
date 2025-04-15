import { test, expect } from '@playwright/test';

// MCPサーバーのベースURL
const BASE_URL = 'http://localhost:3000';

test.describe('エラーページテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  // 404エラーページのテスト
  test('404エラーページの表示と内容確認', async ({ page }) => {
    // 存在しないページへアクセス
    await page.goto(`${BASE_URL}/non-existent-page`);
    await page.waitForLoadState('networkidle');

    // 404ページの要素を確認
    await expect(page.locator('h1:has-text("404")')).toBeVisible();
    await expect(page.locator('text=ページが見つかりません')).toBeVisible();
    
    // ホームへ戻るリンクの確認
    const homeLink = page.locator('a:has-text("ホームへ戻る")');
    await expect(homeLink).toBeVisible();
    
    // ホームへ戻るリンクのクリックとリダイレクト確認
    await homeLink.click();
    await expect(page).toHaveURL(BASE_URL);
  });

  // 500エラーページのテスト
  test('500エラーページの表示と内容確認', async ({ page }) => {
    // サーバーエラーを発生させるエンドポイントにアクセス
    await page.goto(`${BASE_URL}/api/test-error`);
    await page.waitForLoadState('networkidle');

    // 500ページの要素を確認
    await expect(page.locator('h1:has-text("500")')).toBeVisible();
    await expect(page.locator('text=サーバーエラーが発生しました')).toBeVisible();
    
    // リロードボタンの確認
    const reloadButton = page.locator('button:has-text("再読み込み")');
    await expect(reloadButton).toBeVisible();
  });

  // 403エラーページのテスト
  test('403エラーページの表示と内容確認', async ({ page }) => {
    // 認証が必要なAPIエンドポイントに未認証でアクセス
    await page.goto(`${BASE_URL}/api/protected-resource`);
    await page.waitForLoadState('networkidle');

    // 403ページの要素を確認
    await expect(page.locator('h1:has-text("403")')).toBeVisible();
    await expect(page.locator('text=アクセスが拒否されました')).toBeVisible();
    
    // ログインページへのリンクを確認
    const loginLink = page.locator('a:has-text("ログイン")');
    await expect(loginLink).toBeVisible();
    
    // ログインページへの遷移を確認
    await loginLink.click();
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  // エラーページのレスポンシブデザインテスト
  test('エラーページのレスポンシブ表示', async ({ page }) => {
    // ビューポートサイズを設定
    const viewports = [
      { width: 375, height: 667 },  // モバイル
      { width: 768, height: 1024 }, // タブレット
      { width: 1280, height: 800 }  // デスクトップ
    ];

    for (const viewport of viewports) {
      // ビューポートサイズを設定
      await page.setViewportSize(viewport);
      
      // 404ページにアクセス
      await page.goto(`${BASE_URL}/non-existent-page`);
      await page.waitForLoadState('networkidle');

      // エラーコンテナの表示を確認
      const errorContainer = page.locator('.error-container');
      await expect(errorContainer).toBeVisible();
      
      // エラーイラストの表示を確認
      const errorIllustration = page.locator('.error-illustration');
      await expect(errorIllustration).toBeVisible();
      
      // テキストの可読性を確認
      const errorMessage = page.locator('.error-message');
      await expect(errorMessage).toBeVisible();
    }
  });

  // エラーページのアクセシビリティテスト
  test('エラーページのアクセシビリティ', async ({ page }) => {
    // 404ページにアクセス
    await page.goto(`${BASE_URL}/non-existent-page`);
    await page.waitForLoadState('networkidle');

    // 見出しの階層構造を確認
    await expect(page.locator('h1')).toBeVisible();
    
    // エラーメッセージの役割を確認
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    
    // ナビゲーションリンクのアクセシビリティを確認
    const navigationLinks = page.locator('a[role="navigation"]');
    await expect(navigationLinks).toHaveAttribute('aria-label', /.*へ移動/);
  });
}); 
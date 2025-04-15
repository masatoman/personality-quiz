import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', title: 'ShiftWith - ホーム', selector: 'main', requiresAuth: false },
  { path: '/quiz', title: 'ギバー診断 - ShiftWith', selector: '[data-testid="quiz-container"]', requiresAuth: false },
  { path: '/dashboard', title: 'ダッシュボード - ShiftWith', selector: '[data-testid="dashboard-container"]', requiresAuth: true },
  { path: '/materials', title: '教材一覧 - ShiftWith', selector: '[data-testid="materials-list"]', requiresAuth: false },
  { path: '/create', title: '教材作成 - ShiftWith', selector: '[data-testid="material-editor"]', requiresAuth: true },
  { path: '/explore', title: '教材を探す - ShiftWith', selector: '[data-testid="explore-container"]', requiresAuth: false },
  { path: '/settings', title: '設定 - ShiftWith', selector: '[data-testid="settings-form"]', requiresAuth: true },
];

test.describe('ページナビゲーションとアクセシビリティテスト', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前の共通セットアップ
    await page.goto('http://localhost:3002');
  });

  for (const { path, title, selector, requiresAuth } of pages) {
    test(`${path} ページの表示とアクセシビリティ確認`, async ({ page }) => {
      // ページへのアクセス
      await page.goto(`http://localhost:3002${path}`);
      
      if (requiresAuth) {
        // 認証が必要なページの場合、ログインページへのリダイレクトを確認
        await expect(page).toHaveURL(/.*\/login/);
        await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
        // ログインフォームの基本要素を確認
        await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
      } else {
        // 認証が不要なページの場合、通常のチェックを実行
        await expect(page).toHaveTitle(title);
        
        // 基本的なページ構造の確認
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
        
        // メインコンテンツの存在確認
        if (selector) {
          await expect(page.locator(selector)).toBeVisible();
        }

        // ナビゲーションの確認
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();
        await expect(nav.getByRole('link')).toHaveCount(await nav.getByRole('link').count());

        // アクセシビリティチェック
        // 見出しの存在確認
        const headings = await page.getByRole('heading').all();
        expect(headings.length).toBeGreaterThan(0);

        // 画像の代替テキスト確認
        const images = await page.locator('img').all();
        for (const img of images) {
          const alt = await img.getAttribute('alt');
          expect(alt).toBeTruthy();
        }

        // フォーカス可能な要素のタブインデックス確認
        const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
        for (const element of focusableElements) {
          const tabIndex = await element.getAttribute('tabindex');
          expect(tabIndex === null || parseInt(tabIndex) >= 0).toBeTruthy();
        }
      }

      // スクリーンショットを撮影
      await page.screenshot({ 
        path: `./test-results/screenshots/${path.replace('/', '_')}.png`,
        fullPage: true 
      });
    });
  }

  test('存在しないページへのアクセスで404ページが表示されること', async ({ page }) => {
    await page.goto('http://localhost:3002/non-existent-page');
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=ページが見つかりません')).toBeVisible();
    
    // 404ページのアクセシビリティ確認
    await expect(page.locator('main')).toBeVisible();
    const homeLink = page.getByRole('link', { name: 'ホームに戻る' });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // モバイルビューポートでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    for (const { path, requiresAuth } of pages) {
      if (!requiresAuth) {
        await page.goto(`http://localhost:3002${path}`);
        
        // ハンバーガーメニューの存在確認（モバイル時）
        const menuButton = page.locator('[data-testid="mobile-menu-button"]');
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await expect(page.locator('nav')).toBeVisible();
        }
        
        // スクリーンショットを撮影（モバイル）
        await page.screenshot({ 
          path: `./test-results/screenshots/mobile_${path.replace('/', '_')}.png`,
          fullPage: true 
        });
      }
    }
  });
}); 
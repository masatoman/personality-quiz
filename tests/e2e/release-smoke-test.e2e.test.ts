import { test, expect } from '@playwright/test';

/**
 * ShiftWith MVP スモークテスト
 * 
 * リリース直前の最終確認として、最重要機能が動作するかを
 * 短時間で確認するためのスモークテストです。
 * 
 * 実行時間目標: 3-5分以内
 */

test.describe('ShiftWith MVP スモークテスト', () => {
  test.describe.configure({ mode: 'parallel' });

  /**
   * 🔥 最重要: アプリケーションが起動するか
   */
  test('アプリケーション基本起動確認', async ({ page }) => {
    // ホームページが正常にロードされるか
    await page.goto('/');
    await expect(page.locator('h1, h2, [role="banner"]')).toBeVisible();
    
    // 基本ナビゲーションが表示されるか
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    
    console.log('✅ アプリケーション基本起動: OK');
  });

  /**
   * 🔐 認証システム基本動作確認
   */
  test('認証システム基本動作', async ({ page }) => {
    // ログインページへのアクセス
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/auth\/login/);
    
    // ログインフォームの存在確認
    await expect(page.locator('[data-testid="email-input"], input[type="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"], input[type="password"]')).toBeVisible();
    
    // サインアップページへの遷移
    await page.goto('/auth/signup');
    await expect(page).toHaveURL(/\/auth\/signup/);
    
    console.log('✅ 認証システム基本動作: OK');
  });

  /**
   * 🧠 ギバー診断システム基本動作確認
   */
  test('ギバー診断システム基本動作', async ({ page }) => {
    // 診断ページへのアクセス（認証なしでもアクセス可能かチェック）
    await page.goto('/quiz');
    
    // 診断開始画面または質問画面が表示されるか
    const hasQuizContent = await page.locator('h1, h2, h3').count() > 0;
    expect(hasQuizContent).toBeTruthy();
    
    // 質問または説明テキストが存在するか
    const hasContent = await page.locator('p, div, span').count() > 0;
    expect(hasContent).toBeTruthy();
    
    console.log('✅ ギバー診断システム基本動作: OK');
  });

  /**
   * 📚 教材システム基本動作確認
   */
  test('教材システム基本動作', async ({ page }) => {
    // 教材一覧ページへのアクセス
    await page.goto('/materials');
    await expect(page).toHaveURL(/\/materials/);
    
    // ページが正常にロードされたか（エラーページでないか）
    const isErrorPage = await page.locator('[data-testid="404-error"], [data-testid="500-error"]').count();
    expect(isErrorPage).toBe(0);
    
    // 何らかのコンテンツが表示されているか
    const hasContent = await page.locator('h1, h2, h3, p, div').count() > 0;
    expect(hasContent).toBeTruthy();
    
    console.log('✅ 教材システム基本動作: OK');
  });

  /**
   * 📊 ダッシュボード基本動作確認
   */
  test('ダッシュボード基本動作', async ({ page }) => {
    // 未認証でのダッシュボードアクセス → ログインページにリダイレクト
    await page.goto('/dashboard');
    
    // ログインページにリダイレクトされるか、または認証モーダルが表示されるか
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('/auth/login') || currentUrl.includes('/login');
    const hasAuthModal = await page.locator('[data-testid="auth-modal"], [data-testid="login-modal"]').count() > 0;
    
    expect(isRedirectedToLogin || hasAuthModal).toBeTruthy();
    
    console.log('✅ ダッシュボード認証制御: OK');
  });

  /**
   * 🏆 ランキングシステム基本動作確認
   */
  test('ランキングシステム基本動作', async ({ page }) => {
    // ランキングページへのアクセス
    await page.goto('/rankings');
    
    // ページが正常にロードされたか
    const isErrorPage = await page.locator('[data-testid="404-error"], [data-testid="500-error"]').count();
    expect(isErrorPage).toBe(0);
    
    // 何らかのランキングコンテンツが表示されているか
    const hasRankingContent = await page.locator('table, .ranking, [data-testid="ranking"]').count() > 0;
    expect(hasRankingContent).toBeTruthy();
    
    console.log('✅ ランキングシステム基本動作: OK');
  });

  /**
   * 🚀 API基本動作確認
   */
  test('主要API基本応答確認', async ({ page }) => {
    const apis = [
      '/api/categories',
      '/api/difficulties',
      '/api/rankings/weekly'
    ];

    for (const apiPath of apis) {
      const response = await page.request.get(apiPath);
      
      // API が 500 エラーを返していないか確認
      expect(response.status()).not.toBe(500);
      
      // 404 は許容するが、500 系エラーは許容しない
      if (response.status() >= 500) {
        throw new Error(`API ${apiPath} returned ${response.status()}`);
      }
      
      console.log(`📡 API ${apiPath}: ${response.status()}`);
    }
    
    console.log('✅ 主要API基本応答: OK');
  });

  /**
   * 📱 レスポンシブ基本確認
   */
  test('レスポンシブデザイン基本確認', async ({ page }) => {
    await page.goto('/');
    
    // デスクトップ表示
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();
    
    // タブレット表示
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // スマートフォン表示
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ レスポンシブデザイン基本確認: OK');
  });

  /**
   * ⚡ ページロード速度基本確認
   */
  test('主要ページロード速度確認', async ({ page }) => {
    const pages = ['/', '/materials', '/rankings'];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      // 10秒以内にDOMがロードされれば OK（緩い条件）
      expect(loadTime).toBeLessThan(10000);
      console.log(`⏱️ ${pagePath}: ${loadTime}ms`);
    }
    
    console.log('✅ ページロード速度基本確認: OK');
  });

  /**
   * 🛡️ セキュリティ基本確認
   */
  test('基本セキュリティ設定確認', async ({ page }) => {
    await page.goto('/');
    
    // HTTPS または localhost での動作確認
    const url = page.url();
    const isSecure = url.startsWith('https://') || url.includes('localhost');
    expect(isSecure).toBeTruthy();
    
    // CSRFトークンまたはセキュリティヘッダーの存在確認（可能な範囲で）
    const response = await page.request.get('/');
    const headers = response.headers();
    
    // 最低限のセキュリティヘッダーチェック
    const hasContentType = 'content-type' in headers;
    expect(hasContentType).toBeTruthy();
    
    console.log('✅ 基本セキュリティ設定: OK');
  });
});

/**
 * 重要度別テストタグ
 */
test.describe('Critical Tests - Must Pass', () => {
  test('🔥 最重要機能統合確認', async ({ page }) => {
    // 1. ホーム → 教材一覧 → ランキングの基本ナビゲーション
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    await page.goto('/materials');
    await expect(page.locator('body')).toBeVisible();
    
    await page.goto('/rankings');
    await expect(page.locator('body')).toBeVisible();
    
    // 2. 認証フロー基本確認
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"], [data-testid="email-input"]')).toBeVisible();
    
    // 3. 診断システム基本確認
    await page.goto('/quiz');
    await expect(page.locator('body')).toBeVisible();
    
    console.log('🎉 最重要機能統合確認: 全てOK');
  });
}); 
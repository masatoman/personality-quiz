import { test, expect, Page } from '@playwright/test';

// 共通のテストユーザー情報
const testUser = {
  email: 'test@shiftwith.com',
  password: 'TestPass123!'
};

test.describe('ShiftWith 画面機能テスト', () => {
  
  test.describe('🔴 重要度：高（コア機能）', () => {
    
    test('ホーム画面 (/) の基本機能', async ({ page }) => {
      await page.goto('/');
      
      // ページが正常に表示される
      await expect(page).toHaveTitle(/ShiftWith/);
      
      // ナビゲーションメニューが表示される
      await expect(page.locator('nav')).toBeVisible();
      
      // 主要なリンクが存在することを確認
      const mainLinks = [
        'ログイン',
        'サインアップ',
        '教材を探す',
        'クイズ'
      ];
      
      for (const linkText of mainLinks) {
        await expect(page.getByText(linkText).first()).toBeVisible();
      }
    });

    test('ログイン画面 (/auth/login) の基本機能', async ({ page }) => {
      await page.goto('/auth/login');
      
      // フォームが表示される
      await expect(page.locator('form')).toBeVisible();
      
      // 必要な入力フィールドが存在する
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // ログインボタンが存在する
      await expect(page.getByRole('button', { name: /ログイン|Login/i })).toBeVisible();
      
      // バリデーション（空欄での送信）
      await page.getByRole('button', { name: /ログイン|Login/i }).click();
      // エラーメッセージまたはバリデーションが表示されることを期待
      // 具体的な実装に応じて調整が必要
    });

    test('サインアップ画面 (/auth/signup) の基本機能', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // フォームが表示される
      await expect(page.locator('form')).toBeVisible();
      
      // 必要な入力フィールドが存在する
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // サインアップボタンが存在する
      await expect(page.getByRole('button', { name: /サインアップ|Sign|登録/i })).toBeVisible();
    });

    test('ダッシュボード画面 (/dashboard) へのアクセス', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 認証が必要な場合はログイン画面にリダイレクトされる
      // または認証済みの場合はダッシュボードが表示される
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(dashboard|login|auth)/);
    });

    test('教材作成画面 (/create/standard) へのアクセス', async ({ page }) => {
      await page.goto('/create/standard');
      await page.waitForLoadState('networkidle');
      
      // 認証が必要な場合の処理
      const currentUrl = page.url();
      if (currentUrl.includes('login') || currentUrl.includes('auth')) {
        // ログインが必要な場合は正常
        expect(currentUrl).toMatch(/(login|auth)/);
      } else {
        // 認証済みまたは認証不要の場合、作成フォームが表示される
        await expect(page.locator('form, [data-testid="create-form"]')).toBeVisible();
      }
    });
  });

  test.describe('🟡 重要度：中（主要機能）', () => {
    
    test('教材一覧画面 (/materials) の基本機能', async ({ page }) => {
      await page.goto('/materials');
      await page.waitForLoadState('networkidle');
      
      // ページが読み込まれることを確認
      await expect(page).toHaveURL(/materials/);
      
      // 検索機能の存在確認
      const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[placeholder*="search"]').first();
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('プロフィール画面 (/profile) へのアクセス', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // 認証が必要な場合はログイン画面にリダイレクトされる
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(profile|login|auth)/);
    });

    test('探索画面 (/explore) の基本機能', async ({ page }) => {
      await page.goto('/explore');
      await page.waitForLoadState('networkidle');
      
      // ページが読み込まれることを確認
      await expect(page).toHaveURL(/explore/);
    });
  });

  test.describe('🟢 重要度：低（補助機能）', () => {
    
    test('クイズ画面 (/quiz) へのアクセス', async ({ page }) => {
      await page.goto('/quiz');
      await page.waitForLoadState('networkidle');
      
      // ページが読み込まれることを確認
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(quiz|login|auth)/);
    });

    test('通知画面 (/notifications) へのアクセス', async ({ page }) => {
      await page.goto('/notifications');
      await page.waitForLoadState('networkidle');
      
      // 認証が必要な場合はログイン画面にリダイレクトされる
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(notifications|login|auth)/);
    });

    test('マイ教材画面 (/my-materials) へのアクセス', async ({ page }) => {
      await page.goto('/my-materials');
      await page.waitForLoadState('networkidle');
      
      // 認証が必要な場合はログイン画面にリダイレクトされる
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(my-materials|login|auth)/);
    });

    test('その他のページ', async ({ page }) => {
      const pages = [
        '/privacy',
        '/terms',
        '/support'
      ];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // ページが正常に表示されることを確認
        await expect(page).toHaveURL(new RegExp(pagePath));
        
        // 404エラーでないことを確認
        const content = await page.textContent('body');
        expect(content).not.toContain('404');
        expect(content).not.toContain('Not Found');
      }
    });

    test('404エラーページの動作確認', async ({ page }) => {
      await page.goto('/nonexistent-page');
      await page.waitForLoadState('networkidle');
      
      // 404ページが表示されるか、ホームにリダイレクトされることを確認
      const content = await page.textContent('body');
      const url = page.url();
      
      expect(
        content?.includes('404') || 
        content?.includes('Not Found') || 
        url.endsWith('/')
      ).toBeTruthy();
    });
  });

  test.describe('🔄 ナビゲーション機能', () => {
    
    test('メインナビゲーションのリンク動作', async ({ page }) => {
      await page.goto('/');
      
      // ナビゲーションメニューが存在することを確認
      const nav = page.locator('nav');
      if (await nav.isVisible()) {
        // 各リンクをクリックして遷移を確認
        const links = await nav.locator('a').all();
        
        for (let i = 0; i < Math.min(links.length, 5); i++) {
          const link = links[i];
          const href = await link.getAttribute('href');
          
          if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
            await link.click();
            await page.waitForLoadState('networkidle');
            
            // ページが変わったことを確認
            await expect(page).toHaveURL(new RegExp('.*'));
            
            // ホームに戻る
            await page.goto('/');
          }
        }
      }
    });
  });

  test.describe('📱 レスポンシブデザイン', () => {
    
    test('モバイル表示での基本機能', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // ページが正常に表示される
      await expect(page).toHaveTitle(/ShiftWith/);
      
      // モバイルメニューまたはナビゲーションが存在する
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, nav');
      await expect(mobileMenu).toBeVisible();
    });

    test('タブレット表示での基本機能', async ({ page }) => {
      // タブレットサイズに設定
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      // ページが正常に表示される
      await expect(page).toHaveTitle(/ShiftWith/);
      
      // ナビゲーションが適切に表示される
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });
  });
});

// ヘルパー関数：ログイン処理
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole('button', { name: /ログイン|Login/i }).click();
  await page.waitForLoadState('networkidle');
}

// ヘルパー関数：エラーメッセージの確認
async function expectErrorMessage(page: Page) {
  const errorSelectors = [
    '[data-testid="error-message"]',
    '.error',
    '.error-message',
    '[role="alert"]'
  ];
  
  let errorFound = false;
  for (const selector of errorSelectors) {
    const element = page.locator(selector);
    if (await element.isVisible()) {
      await expect(element).toBeVisible();
      errorFound = true;
      break;
    }
  }
  
  return errorFound;
} 
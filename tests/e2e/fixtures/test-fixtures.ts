import { test as base } from '@playwright/test';
import { clearLocalStorage, waitForPageLoad } from '../helpers/test-utils';

/**
 * テストフィクスチャーの型定義
 */
type TestFixtures = {
  authenticatedPage: any;  // ログイン済みのページ
  cleanPage: any;         // クリーンな状態のページ
};

/**
 * カスタムテストフィクスチャーを定義
 */
export const test = base.extend<TestFixtures>({
  // クリーンな状態のページを提供
  cleanPage: async ({ page }, use) => {
    await clearLocalStorage(page);
    await page.goto(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    await waitForPageLoad(page);
    await use(page);
  },

  // ログイン済みのページを提供
  authenticatedPage: async ({ page }, use) => {
    await clearLocalStorage(page);
    await page.goto(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    
    // ログイン処理
    await page.fill('[data-testid="email-input"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('[data-testid="password-input"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('[data-testid="login-button"]');
    
    // ログイン完了を待機
    await waitForPageLoad(page);
    await page.waitForSelector('[data-testid="user-menu"]');
    
    await use(page);
  },
});

export { expect } from '@playwright/test'; 
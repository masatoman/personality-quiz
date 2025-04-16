import { test, expect } from '@playwright/test';

test.describe('パスワードリセット機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/reset-password');
  });

  test('パスワードリセットフォームが正しく表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'パスワードをリセット' })).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByRole('button', { name: 'パスワードリセットメールを送信' })).toBeVisible();
  });

  test('メールアドレスを入力せずに送信するとエラーになる', async ({ page }) => {
    const emailInput = page.getByLabel('メールアドレス');
    await page.getByRole('button', { name: 'パスワードリセットメールを送信' }).click();
    // HTML5のvalidation属性を確認
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    // required属性も確認
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('無効なメールアドレスを入力するとエラーになる', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('invalid-email');
    await page.getByRole('button', { name: 'パスワードリセットメールを送信' }).click();
    await expect(page.getByText(/パスワードリセットメールの送信に失敗しました/)).toBeVisible();
  });

  test('送信中は適切なローディング状態が表示される', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByRole('button', { name: 'パスワードリセットメールを送信' }).click();
    await expect(page.getByText('送信中...')).toBeVisible();
  });

  test('ログインページへのリンクが機能する', async ({ page }) => {
    await page.getByText('ログインページに戻る').click();
    await expect(page).toHaveURL('/auth/login');
  });

  test('アクセシビリティ要件を満たしている', async ({ page }) => {
    // フォーム要素のラベルが適切に関連付けられているか確認
    await expect(page.getByLabel('メールアドレス')).toHaveAttribute('type', 'email');
    
    // キーボードナビゲーションが機能するか確認
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('メールアドレス')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'パスワードリセットメールを送信' })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByText('ログインページに戻る')).toBeFocused();
  });
}); 
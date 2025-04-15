import { test, expect } from '@playwright/test';

/**
 * 新規ユーザー登録からギバー診断完了までのE2Eテスト
 * テスト対象: ユーザー登録から初期診断までの完全フロー
 */
test.describe('新規ユーザー完全フロー', () => {
  const testEmail = `test-user-${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  test.beforeEach(async ({ page }) => {
    // アプリケーションのホームページを開く
    await page.goto('http://localhost:3002/');
  });

  test('新規ユーザーが登録から初期診断までの完全フローを実行できる', async ({ page }) => {
    // 1. ホームページから登録ページに遷移
    await page.getByRole('link', { name: '登録' }).click();
    await expect(page).toHaveURL('http://localhost:3002/signup');
    
    // 2. 登録フォームに情報を入力
    await page.getByLabel('メールアドレス').fill(testEmail);
    await page.getByLabel('パスワード').fill(testPassword);
    await page.getByLabel('パスワード（確認）').fill(testPassword);
    
    // 3. 登録を実行
    await page.getByRole('button', { name: '登録' }).click();
    
    // 4. メール確認画面が表示される
    await expect(page.getByText('確認メールを送信しました')).toBeVisible();
    
    // 5. メール確認をスキップ（テスト用）
    // テスト環境では認証をバイパスする処理（実際のアプリケーションに合わせて調整）
    await page.goto('http://localhost:3002/auth/verify-skip?email=' + encodeURIComponent(testEmail));
    
    // 6. ウェルカム画面が表示される
    await expect(page.getByText('ShiftWithへようこそ')).toBeVisible();
    
    // 7. ギバー診断を開始
    await page.getByRole('button', { name: 'ギバー診断を始める' }).click();
    
    // 8. ギバー診断の質問に回答
    // 全10問程度の質問に回答
    for (let i = 1; i <= 10; i++) {
      // 質問が表示されるのを待つ
      await expect(page.getByText(`質問 ${i}`)).toBeVisible();
      
      // 回答をランダムに選択（1から5のいずれか）
      const randomAnswer = Math.floor(Math.random() * 5) + 1;
      await page.getByRole('radio', { name: `${randomAnswer}` }).click();
      
      // 次へボタンをクリック
      await page.getByRole('button', { name: '次へ' }).click();
    }
    
    // 9. 診断結果が表示される
    await expect(page.getByText('あなたのギバータイプ')).toBeVisible();
    
    // 10. 何らかのギバータイプとスコアが表示される
    await expect(page.getByTestId('giver-type')).toBeVisible();
    await expect(page.getByTestId('giver-score')).toBeVisible();
    
    // 11. ダッシュボードに進むボタンをクリック
    await page.getByRole('button', { name: 'ダッシュボードへ' }).click();
    
    // 12. ダッシュボードが表示される
    await expect(page).toHaveURL('http://localhost:3002/dashboard');
    await expect(page.getByText('今日のおすすめ')).toBeVisible();
    
    // 13. ギバースコアが表示されていることを確認
    await expect(page.getByTestId('giver-score-display')).toBeVisible();
    
    // 14. プロフィールメニューを開いてログアウトする
    await page.getByTestId('profile-menu-button').click();
    await page.getByRole('menuitem', { name: 'ログアウト' }).click();
    
    // 15. ログイン画面に戻ることを確認
    await expect(page).toHaveURL('http://localhost:3002/login');
  });
}); 
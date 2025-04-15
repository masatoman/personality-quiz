import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('新規ユーザー登録からギバー診断までの一連のフロー', async ({ page }) => {
    // 1. ランディングページにアクセス
    await page.goto('/');
    
    // 2. サインアップページに移動
    await page.click('text=サインアップ');
    
    // 3. ユーザー登録フォームの入力
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=登録する');
    
    // 4. ウェルカム画面の表示確認
    await expect(page.locator('h1')).toContainText('ようこそ');
    
    // 5. ギバー診断テストの開始
    await page.click('text=診断を開始');
    
    // 6. 診断質問への回答（15問）
    for (let i = 1; i <= 15; i++) {
      await page.click(`[data-testid="question-${i}-option-3"]`);
      await page.click('text=次へ');
    }
    
    // 7. 診断結果の確認
    await expect(page.locator('[data-testid="diagnosis-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="giver-score"]')).toBeVisible();
    
    // 8. プロフィール設定
    await page.fill('[data-testid="nickname-input"]', 'TestUser');
    await page.selectOption('[data-testid="level-select"]', 'intermediate');
    await page.fill('[data-testid="goal-input"]', 'TOEIC 800点達成');
    await page.click('text=完了');
    
    // 9. ダッシュボードへの遷移確認
    await expect(page).toHaveURL('/dashboard');
  });
}); 
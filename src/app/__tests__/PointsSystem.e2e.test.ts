import { test, expect } from '@playwright/test';

test.describe('ポイントシステム', () => {
  // テスト前に毎回ログインする
  test.beforeEach(async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('http://localhost:3000/');
    
    // ログインページに移動（実際のパスに合わせて変更してください）
    await page.goto('http://localhost:3000/login');
    
    // テスト用アカウントでログイン
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // ダッシュボードが表示されるまで待機
    await page.waitForURL('**/dashboard');
  });

  test('ポイント残高が表示される', async ({ page }) => {
    // ユーザーダッシュボードに移動
    await page.goto('http://localhost:3000/dashboard');
    
    // ポイント残高の表示を待機
    const pointsBalance = page.locator('.points-balance');
    await expect(pointsBalance).toBeVisible();
    
    // 数値形式のポイントが表示されていることを確認
    const pointsText = await pointsBalance.textContent();
    expect(pointsText).toMatch(/\d+/);
  });

  test('ポイント履歴が表示される', async ({ page }) => {
    // ポイント履歴ページに移動
    await page.goto('http://localhost:3000/points/history');
    
    // ポイント履歴リストの表示を待機
    const historyList = page.locator('.points-history-list');
    await expect(historyList).toBeVisible();
    
    // 少なくとも1つの履歴項目があることを確認
    const historyItems = page.locator('.points-history-item');
    await expect(historyItems).toHaveCount({ min: 1 });
    
    // 履歴項目に必要な情報が含まれていることを確認
    const firstItem = historyItems.first();
    await expect(firstItem.locator('.points-amount')).toBeVisible();
    await expect(firstItem.locator('.action-type')).toBeVisible();
    await expect(firstItem.locator('.timestamp')).toBeVisible();
  });

  test('教材完了でポイントが付与される', async ({ page }) => {
    // 現在のポイント残高を取得
    await page.goto('http://localhost:3000/dashboard');
    const initialPointsElement = page.locator('.points-balance');
    await expect(initialPointsElement).toBeVisible();
    const initialPointsText = await initialPointsElement.textContent();
    const initialPoints = parseInt(initialPointsText.replace(/[^0-9]/g, ''));
    
    // 教材ページに移動
    await page.goto('http://localhost:3000/resources');
    
    // 最初の未完了教材を見つけてクリック
    const resourceItems = page.locator('.resource-item:not(.completed)');
    await expect(resourceItems).toHaveCount({ min: 1 });
    await resourceItems.first().click();
    
    // 教材を完了としてマーク
    await page.click('button.complete-resource');
    
    // 「完了しました」のような確認メッセージが表示されることを確認
    await expect(page.locator('.completion-message')).toBeVisible();
    
    // ダッシュボードに戻る
    await page.goto('http://localhost:3000/dashboard');
    
    // 更新されたポイント残高を取得
    const updatedPointsElement = page.locator('.points-balance');
    await expect(updatedPointsElement).toBeVisible();
    const updatedPointsText = await updatedPointsElement.textContent();
    const updatedPoints = parseInt(updatedPointsText.replace(/[^0-9]/g, ''));
    
    // ポイントが増えていることを確認
    expect(updatedPoints).toBeGreaterThan(initialPoints);
  });

  test('ポイント不足でアイテム購入に失敗する', async ({ page }) => {
    // 報酬ページに移動
    await page.goto('http://localhost:3000/rewards');
    
    // 高価な報酬アイテムを見つけてクリック
    const expensiveItems = page.locator('.reward-item:has(.price:text-matches("1000"))');
    await expect(expensiveItems).toHaveCount({ min: 1 });
    await expensiveItems.first().click();
    
    // 購入ボタンをクリック
    await page.click('button.purchase-reward');
    
    // ポイント不足のエラーメッセージが表示されることを確認
    await expect(page.locator('.error-message')).toBeVisible();
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('ポイント不足');
  });
}); 
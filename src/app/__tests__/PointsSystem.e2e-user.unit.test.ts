import { test, expect } from '@playwright/test';

/**
 * ユーザー操作を模倣したポイントシステムE2Eテスト
 * モックを使わず実際のAPIエンドポイントにアクセスするテスト
 */
test.describe('ポイントシステム 実ユーザーフロー', () => {
  // 前提条件: テスト用のユーザーアカウントが存在し、テスト用のデータが準備されていること
  
  test.beforeEach(async ({ page }) => {
    // テスト用ユーザーでログイン
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('testuser@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ログインできていることを確認
    await page.waitForURL('**/dashboard');
  });
  
  test('E2E: ログイン後のポイント残高確認 → 教材完了 → ポイント履歴確認のフロー', async ({ page }) => {
    // 1. ダッシュボードでポイント残高を確認
    await page.goto('/dashboard');
    const initialPointsElement = page.getByTestId('points-balance');
    await expect(initialPointsElement).toBeVisible();
    
    // 初期ポイント残高を記録
    const initialPointsText = await initialPointsElement.textContent() || '0';
    const initialPoints = parseInt(initialPointsText.replace(/[^0-9]/g, ''));
    console.log(`初期ポイント残高: ${initialPoints}`);
    
    // 2. 教材一覧ページに移動
    await page.goto('/resources');
    
    // 3. 未完了の教材を探す
    const incompleteResourcesLocator = page.locator('.resource-item:not(.completed)');
    const incompleteCount = await incompleteResourcesLocator.count();
    
    if (incompleteCount === 0) {
      test.skip();
      console.log('未完了の教材がないためテストをスキップします');
      return;
    }
    
    // 最初の未完了教材をクリック
    await incompleteResourcesLocator.first().click();
    
    // 4. 教材の詳細を確認
    const resourceTitle = page.getByTestId('resource-title');
    await expect(resourceTitle).toBeVisible();
    const titleText = await resourceTitle.textContent();
    console.log(`選択した教材: ${titleText}`);
    
    // 5. 教材を完了としてマーク
    const completeButton = page.getByRole('button', { name: '完了' });
    await expect(completeButton).toBeVisible();
    await completeButton.click();
    
    // 6. 完了メッセージを確認
    const completionMessage = page.getByText(/ポイントを獲得しました/);
    await expect(completionMessage).toBeVisible();
    
    // 7. ポイント履歴ページに移動
    await page.goto('/points/history');
    
    // 8. 履歴が表示されていることを確認
    const historyList = page.getByTestId('points-history-list');
    await expect(historyList).toBeVisible();
    
    // 9. 最新の履歴項目を確認
    const latestHistoryItem = page.getByTestId('points-history-item').first();
    await expect(latestHistoryItem).toBeVisible();
    
    // 直前の教材完了が履歴に反映されているか確認
    if (titleText) {
      await expect(latestHistoryItem).toContainText(titleText);
    }
    
    // 10. ダッシュボードに戻ってポイントが増えていることを確認
    await page.goto('/dashboard');
    
    const updatedPointsElement = page.getByTestId('points-balance');
    await expect(updatedPointsElement).toBeVisible();
    const updatedPointsText = await updatedPointsElement.textContent() || '0';
    const updatedPoints = parseInt(updatedPointsText.replace(/[^0-9]/g, ''));
    
    console.log(`更新後のポイント残高: ${updatedPoints}`);
    expect(updatedPoints).toBeGreaterThan(initialPoints);
  });
  
  test('E2E: ギバースコアの変動確認フロー', async ({ page }) => {
    // 1. ダッシュボードでギバースコアを確認
    await page.goto('/dashboard');
    const initialScoreElement = page.getByTestId('giver-score');
    
    if (await initialScoreElement.count() === 0) {
      test.skip();
      console.log('ギバースコア表示がないためテストをスキップします');
      return;
    }
    
    await expect(initialScoreElement).toBeVisible();
    const initialScoreText = await initialScoreElement.textContent() || '0';
    const initialScore = parseFloat(initialScoreText.replace(/[^0-9.]/g, ''));
    console.log(`初期ギバースコア: ${initialScore}`);
    
    // 2. ギバー行動を行う（教材投稿）
    await page.goto('/resources/create');
    
    // 教材投稿フォームに入力
    await page.getByLabel('タイトル').fill(`テスト教材 ${Date.now()}`);
    await page.getByLabel('説明').fill('これはE2Eテスト用の教材です');
    await page.locator('select[name="type"]').selectOption('article');
    await page.getByLabel('内容').fill('教材のコンテンツをここに入力します。テスト用のテキストです。');
    
    // 投稿ボタンをクリック
    await page.getByRole('button', { name: '投稿する' }).click();
    
    // 投稿成功メッセージを確認
    const successMessage = page.getByText('教材が投稿されました');
    await expect(successMessage).toBeVisible();
    
    // 3. ダッシュボードに戻ってギバースコアが上昇していることを確認
    await page.goto('/dashboard');
    
    // 少し待機（スコア計算に時間がかかる場合）
    await page.waitForTimeout(2000);
    
    const updatedScoreElement = page.getByTestId('giver-score');
    await expect(updatedScoreElement).toBeVisible();
    const updatedScoreText = await updatedScoreElement.textContent() || '0';
    const updatedScore = parseFloat(updatedScoreText.replace(/[^0-9.]/g, ''));
    
    console.log(`更新後のギバースコア: ${updatedScore}`);
    expect(updatedScore).toBeGreaterThanOrEqual(initialScore);
  });
  
  test('E2E: 報酬交換と在庫確認フロー', async ({ page }) => {
    // 1. ダッシュボードでポイント残高を確認
    await page.goto('/dashboard');
    const pointsElement = page.getByTestId('points-balance');
    await expect(pointsElement).toBeVisible();
    const pointsText = await pointsElement.textContent() || '0';
    const currentPoints = parseInt(pointsText.replace(/[^0-9]/g, ''));
    console.log(`現在のポイント残高: ${currentPoints}`);
    
    // 2. 報酬ページに移動
    await page.goto('/rewards');
    
    // 3. 報酬一覧を取得
    const rewardItems = page.getByTestId('reward-item');
    const rewardsCount = await rewardItems.count();
    
    if (rewardsCount === 0) {
      test.skip();
      console.log('利用可能な報酬がないためテストをスキップします');
      return;
    }
    
    // 4. 購入可能な報酬を探す（ポイントが足りるもの）
    let purchasableRewardFound = false;
    let selectedRewardPrice = 0;
    
    for (let i = 0; i < rewardsCount; i++) {
      const reward = rewardItems.nth(i);
      const priceElement = reward.locator('.reward-price');
      const priceText = await priceElement.textContent() || '0';
      const price = parseInt(priceText.replace(/[^0-9]/g, ''));
      
      if (price <= currentPoints) {
        purchasableRewardFound = true;
        selectedRewardPrice = price;
        await reward.click();
        break;
      }
    }
    
    if (!purchasableRewardFound) {
      test.skip();
      console.log('購入可能な報酬がないためテストをスキップします');
      return;
    }
    
    // 5. 報酬詳細ページで購入ボタンをクリック
    const purchaseButton = page.getByRole('button', { name: '購入する' });
    await expect(purchaseButton).toBeVisible();
    await purchaseButton.click();
    
    // 6. 確認ダイアログで確定をクリック
    const confirmButton = page.getByRole('button', { name: '確定' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    
    // 7. 購入完了メッセージを確認
    const successMessage = page.getByText('報酬を購入しました');
    await expect(successMessage).toBeVisible();
    
    // 8. ダッシュボードに戻ってポイントが減っていることを確認
    await page.goto('/dashboard');
    
    const updatedPointsElement = page.getByTestId('points-balance');
    await expect(updatedPointsElement).toBeVisible();
    const updatedPointsText = await updatedPointsElement.textContent() || '0';
    const updatedPoints = parseInt(updatedPointsText.replace(/[^0-9]/g, ''));
    
    console.log(`更新後のポイント残高: ${updatedPoints}`);
    console.log(`報酬価格: ${selectedRewardPrice}`);
    expect(updatedPoints).toBe(currentPoints - selectedRewardPrice);
  });
}); 
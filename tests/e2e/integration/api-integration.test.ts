import { test, expect } from '@playwright/test';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/db-utils';

test.describe('API統合テスト', () => {
  test.beforeAll(async () => {
    await setupTestDatabase();
  });

  test.afterAll(async () => {
    await cleanupTestDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('教材データの取得と表示', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // 教材一覧ページに移動
    await page.click('text=教材を探す');

    // APIからのデータ取得を待機
    await page.waitForResponse(response => 
      response.url().includes('/api/materials') && 
      response.status() === 200
    );

    // 教材カードが表示されることを確認
    const materialCards = page.locator('[data-testid="material-card"]');
    await expect(materialCards).toHaveCount({ min: 1 });

    // 教材の詳細情報が正しく表示されることを確認
    const firstCard = materialCards.first();
    await expect(firstCard.locator('[data-testid="material-title"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="material-description"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="material-author"]')).toBeVisible();
  });

  test('学習進捗の保存と同期', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // 教材を開始
    await page.goto('/materials/test-material-1');
    await page.click('text=学習を開始');

    // 進捗データの保存をモニタリング
    const progressPromise = page.waitForResponse(response =>
      response.url().includes('/api/progress') &&
      response.status() === 200
    );

    // コンテンツを閲覧（スクロール）
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // 進捗データが保存されたことを確認
    const progressResponse = await progressPromise;
    const progressData = await progressResponse.json();
    expect(progressData.status).toBe('success');

    // 別タブで同じ教材を開き、進捗が同期されていることを確認
    const newPage = await page.context().newPage();
    await newPage.goto('/materials/test-material-1');
    const progressIndicator = newPage.locator('[data-testid="progress-indicator"]');
    await expect(progressIndicator).toBeVisible();
    await expect(progressIndicator).toContainText('50%');
  });

  test('ポイント獲得と残高更新の同期', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // 初期ポイント残高を取得
    const initialPointsElement = page.locator('[data-testid="points-balance"]');
    await expect(initialPointsElement).toBeVisible();
    const initialPoints = await initialPointsElement.textContent();
    const initialPointsNumber = parseInt(initialPoints || '0', 10);

    // ポイント獲得アクションを実行
    await page.goto('/materials/test-material-1');
    await page.click('text=学習を開始');
    await page.click('text=クイズに挑戦');
    
    // 全問正解でクイズを完了
    for (let i = 1; i <= 5; i++) {
      await page.click(`[data-testid="quiz-${i}-correct-option"]`);
      await page.click('text=次へ');
    }

    // ポイント更新APIの呼び出しを待機
    const pointsUpdatePromise = page.waitForResponse(response =>
      response.url().includes('/api/points/update') &&
      response.status() === 200
    );

    // 完了ボタンをクリック
    await page.click('text=完了');

    // ポイント更新が完了したことを確認
    const pointsUpdateResponse = await pointsUpdatePromise;
    const pointsData = await pointsUpdateResponse.json();
    expect(pointsData.status).toBe('success');

    // ダッシュボードで更新後のポイント残高を確認
    await page.goto('/dashboard');
    const updatedPointsElement = page.locator('[data-testid="points-balance"]');
    await expect(updatedPointsElement).toBeVisible();
    const updatedPoints = await updatedPointsElement.textContent();
    const updatedPointsNumber = parseInt(updatedPoints || '0', 10);

    // ポイントが増加していることを確認
    expect(updatedPointsNumber).toBeGreaterThan(initialPointsNumber);
  });

  test('同時実行時のデータ整合性', async ({ page, browser }) => {
    // 2つのブラウザコンテキストを作成
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // 両方のページでログイン
    for (const testPage of [page1, page2]) {
      await testPage.goto('/login');
      await testPage.fill('[data-testid="email-input"]', 'test@example.com');
      await testPage.fill('[data-testid="password-input"]', 'testPassword123');
      await testPage.click('text=ログイン');
    }

    // 同じ教材に同時にアクセス
    await Promise.all([
      page1.goto('/materials/test-material-1'),
      page2.goto('/materials/test-material-1')
    ]);

    // 両方のページで学習を開始
    await Promise.all([
      page1.click('text=学習を開始'),
      page2.click('text=学習を開始')
    ]);

    // 進捗データの更新をモニタリング
    const progressPromise1 = page1.waitForResponse(response =>
      response.url().includes('/api/progress') &&
      response.status() === 200
    );
    const progressPromise2 = page2.waitForResponse(response =>
      response.url().includes('/api/progress') &&
      response.status() === 200
    );

    // 両方のページでコンテンツを閲覧
    await Promise.all([
      page1.evaluate(() => window.scrollTo(0, document.body.scrollHeight)),
      page2.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    ]);

    // 両方の進捗データが正しく保存されたことを確認
    const [response1, response2] = await Promise.all([progressPromise1, progressPromise2]);
    const data1 = await response1.json();
    const data2 = await response2.json();
    expect(data1.status).toBe('success');
    expect(data2.status).toBe('success');

    // 両方のコンテキストをクリーンアップ
    await context1.close();
    await context2.close();
  });
}); 
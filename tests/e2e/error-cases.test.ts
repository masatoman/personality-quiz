import { test, expect } from '@playwright/test';
import { setupTestDatabase, cleanupTestDatabase } from './helpers/db-utils';

test.describe('エラーケーステスト', () => {
  test.beforeAll(async () => {
    await setupTestDatabase();
  });

  test.afterAll(async () => {
    await cleanupTestDatabase();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('ネットワークエラー時の処理', async ({ page }) => {
    // オフラインモードを有効化
    await page.context().setOffline(true);

    // 教材一覧ページにアクセス
    await page.goto('/materials');

    // エラーメッセージが表示されることを確認
    const errorMessage = page.locator('[data-testid="network-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('ネットワークエラーが発生しました');

    // リトライボタンが表示されることを確認
    const retryButton = page.locator('text=再試行');
    await expect(retryButton).toBeVisible();

    // オフラインモードを無効化
    await page.context().setOffline(false);

    // リトライボタンをクリック
    await retryButton.click();

    // コンテンツが正常に表示されることを確認
    const materialCards = page.locator('[data-testid="material-card"]');
    await expect(materialCards).toBeVisible();
  });

  test('バリデーションエラーの処理', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // 教材作成ページに移動
    await page.goto('/materials/create');

    // 必須項目を空のまま送信
    await page.click('text=作成する');

    // バリデーションエラーメッセージが表示されることを確認
    const titleError = page.locator('[data-testid="title-error"]');
    const descriptionError = page.locator('[data-testid="description-error"]');
    await expect(titleError).toBeVisible();
    await expect(titleError).toContainText('タイトルは必須です');
    await expect(descriptionError).toBeVisible();
    await expect(descriptionError).toContainText('説明は必須です');

    // 不正な値を入力
    await page.fill('[data-testid="title-input"]', 'a'); // 最小文字数未満
    await page.fill('[data-testid="description-input"]', 'a'.repeat(1001)); // 最大文字数超過

    // 送信
    await page.click('text=作成する');

    // バリデーションエラーメッセージが表示されることを確認
    await expect(titleError).toBeVisible();
    await expect(titleError).toContainText('タイトルは3文字以上で入力してください');
    await expect(descriptionError).toBeVisible();
    await expect(descriptionError).toContainText('説明は1000文字以内で入力してください');
  });

  test('同時実行時の競合処理', async ({ page, browser }) => {
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

    // 同じ教材の編集ページを開く
    await Promise.all([
      page1.goto('/materials/test-material-1/edit'),
      page2.goto('/materials/test-material-1/edit')
    ]);

    // page1で編集を保存
    await page1.fill('[data-testid="title-input"]', '更新されたタイトル1');
    await page1.click('text=保存');
    await page1.waitForResponse(response =>
      response.url().includes('/api/materials') &&
      response.status() === 200
    );

    // page2で編集を試みる
    await page2.fill('[data-testid="title-input"]', '更新されたタイトル2');
    await page2.click('text=保存');

    // 競合エラーメッセージが表示されることを確認
    const conflictError = page2.locator('[data-testid="conflict-error"]');
    await expect(conflictError).toBeVisible();
    await expect(conflictError).toContainText('この教材は他のユーザーによって更新されました');

    // 最新版の再読み込みボタンが表示されることを確認
    const reloadButton = page2.locator('text=最新版を読み込む');
    await expect(reloadButton).toBeVisible();

    // 再読み込みボタンをクリック
    await reloadButton.click();

    // 最新の内容が表示されることを確認
    const titleInput = page2.locator('[data-testid="title-input"]');
    await expect(titleInput).toHaveValue('更新されたタイトル1');

    // コンテキストをクリーンアップ
    await context1.close();
    await context2.close();
  });

  test('APIレスポンスエラーの処理', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123');
    await page.click('text=ログイン');

    // APIエラーをシミュレート
    await page.route('**/api/materials', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    // 教材一覧ページにアクセス
    await page.goto('/materials');

    // エラーメッセージが表示されることを確認
    const errorMessage = page.locator('[data-testid="api-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('サーバーエラーが発生しました');

    // リトライボタンが表示されることを確認
    const retryButton = page.locator('text=再試行');
    await expect(retryButton).toBeVisible();

    // ルーティングを解除
    await page.unroute('**/api/materials');

    // リトライボタンをクリック
    await retryButton.click();

    // コンテンツが正常に表示されることを確認
    const materialCards = page.locator('[data-testid="material-card"]');
    await expect(materialCards).toBeVisible();
  });
}); 
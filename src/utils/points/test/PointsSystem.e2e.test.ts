import { test, expect, Page } from '@playwright/test';
import { PURCHASABLE_ITEMS } from '../../utils/points';

// テスト用のモックAPIレスポンス
const MOCK_API_RESPONSES = {
  login: {
    success: true,
    user: {
      id: 'test-user-id',
      name: 'テストユーザー',
      email: 'test@example.com',
      points: 500
    }
  },
  pointsBalance: {
    points: 500
  },
  pointsHistory: {
    points: [
      {
        id: 'ph1',
        userId: 'test-user-id',
        points: 100,
        actionType: 'complete_resource',
        description: '教材「テスト教材1」を完了しました',
        createdAt: new Date().toISOString(),
        referenceId: 'resource-1',
        referenceType: 'resource'
      },
      {
        id: 'ph2',
        userId: 'test-user-id',
        points: 50,
        actionType: 'complete_quiz',
        description: 'クイズ「テストクイズ1」を完了しました',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        referenceId: 'quiz-1',
        referenceType: 'quiz'
      }
    ],
    totalPoints: 500,
    count: 2
  },
  resources: [
    {
      id: 'resource-1',
      title: 'テスト教材1',
      description: 'テスト用の教材説明',
      completed: false,
      pointsReward: 100,
      type: 'article'
    },
    {
      id: 'resource-2',
      title: 'テスト教材2',
      description: 'テスト用の教材説明2',
      completed: true,
      pointsReward: 150,
      type: 'video'
    }
  ],
  completeResource: {
    success: true,
    points: 100,
    totalPoints: 600,
    message: '教材を完了し、100ポイントを獲得しました！'
  },
  rewards: [
    {
      id: 'reward-1',
      title: 'テスト報酬1',
      description: 'テスト用の安い報酬',
      price: 100,
      imageUrl: '/images/rewards/test1.png'
    },
    {
      id: 'reward-2',
      title: 'テスト報酬2',
      description: 'テスト用の高価な報酬',
      price: 1000,
      imageUrl: '/images/rewards/test2.png'
    }
  ],
  purchaseSuccess: {
    success: true,
    consumedPoints: 100,
    remainingPoints: 400,
    message: '報酬を購入しました！'
  },
  purchaseFailed: {
    success: false,
    error: 'ポイントが不足しています',
    currentPoints: 500,
    requiredPoints: 1000
  }
};

/**
 * モックAPIレスポンスをセットアップ
 */
async function setupMockApi(page: Page) {
  // APIリクエストをインターセプト
  await page.route('**/api/auth/login', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.login)
    });
  });

  await page.route('**/api/points/balance', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.pointsBalance)
    });
  });

  await page.route('**/api/points/history*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.pointsHistory)
    });
  });

  await page.route('**/api/resources', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.resources)
    });
  });

  await page.route('**/api/resources/*/complete', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.completeResource)
    });
  });

  await page.route('**/api/rewards', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_RESPONSES.rewards)
    });
  });

  // 報酬購入のAPIレスポンスをリクエストに応じて変更
  await page.route('**/api/points/consume', async route => {
    const request = route.request();
    const postData = JSON.parse(await request.postData() || '{}');
    
    // 購入しようとしているポイント額に応じてレスポンスを変更
    if (postData.points <= 500) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_API_RESPONSES.purchaseSuccess)
      });
    } else {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_API_RESPONSES.purchaseFailed)
      });
    }
  });
}

/**
 * テスト用にログイン処理を行う
 */
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('メールアドレス').fill('test@example.com');
  await page.getByLabel('パスワード').fill('password');
  await page.getByRole('button', { name: 'ログイン' }).click();
  
  // ダッシュボードにリダイレクトされるまで待機
  await page.waitForURL('**/dashboard');
}

test.describe('ポイントシステム E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // モックAPIのセットアップ
    await setupMockApi(page);
    
    // ログイン
    await login(page);
  });

  test('ダッシュボードでポイント残高が表示される', async ({ page }) => {
    await page.goto('/dashboard');
    
    // ポイント残高の表示を確認
    const pointsBalance = page.getByTestId('points-balance');
    await expect(pointsBalance).toBeVisible();
    await expect(pointsBalance).toContainText('500');
  });

  test('ポイント履歴が表示される', async ({ page }) => {
    await page.goto('/points/history');
    
    // ポイント履歴の表示を確認
    const historyList = page.getByTestId('points-history-list');
    await expect(historyList).toBeVisible();
    
    // 履歴項目が正しく表示されているか確認
    const historyItems = page.getByTestId('points-history-item');
    await expect(historyItems).toHaveCount(2);
    
    // 最初の履歴項目を確認
    const firstItem = historyItems.first();
    await expect(firstItem).toContainText('教材「テスト教材1」を完了しました');
    await expect(firstItem).toContainText('100');
  });

  test('教材を完了するとポイントが獲得できる', async ({ page }) => {
    // 教材一覧ページに移動
    await page.goto('/resources');
    
    // 未完了の教材をクリック
    await page.getByText('テスト教材1').click();
    
    // 教材を完了としてマーク
    await page.getByRole('button', { name: '完了' }).click();
    
    // 成功メッセージの表示を確認
    const successMessage = page.getByText('教材を完了し、100ポイントを獲得しました！');
    await expect(successMessage).toBeVisible();
    
    // ダッシュボードに戻ってポイントが増えているか確認
    await page.goto('/dashboard');
    const pointsBalance = page.getByTestId('points-balance');
    await expect(pointsBalance).toContainText('600');
  });

  test('報酬を購入できる（ポイント足りる場合）', async ({ page }) => {
    // 報酬ページに移動
    await page.goto('/rewards');
    
    // 安価な報酬をクリック
    await page.getByText('テスト報酬1').click();
    
    // 購入ボタンをクリック
    await page.getByRole('button', { name: '購入する' }).click();
    
    // 確認ダイアログで確定
    await page.getByRole('button', { name: '確定' }).click();
    
    // 成功メッセージの表示を確認
    const successMessage = page.getByText('報酬を購入しました！');
    await expect(successMessage).toBeVisible();
    
    // ポイントが減っているか確認
    const pointsBalance = page.getByTestId('points-balance');
    await expect(pointsBalance).toContainText('400');
  });

  test('ポイント不足で報酬購入に失敗する', async ({ page }) => {
    // 報酬ページに移動
    await page.goto('/rewards');
    
    // 高価な報酬をクリック
    await page.getByText('テスト報酬2').click();
    
    // 購入ボタンをクリック
    await page.getByRole('button', { name: '購入する' }).click();
    
    // 確認ダイアログで確定
    await page.getByRole('button', { name: '確定' }).click();
    
    // エラーメッセージの表示を確認
    const errorMessage = page.getByText('ポイントが不足しています');
    await expect(errorMessage).toBeVisible();
    
    // 必要なポイント数が表示されているか確認
    const requiredPoints = page.getByText('必要ポイント: 1000');
    await expect(requiredPoints).toBeVisible();
  });

  test('購入可能なアイテム一覧が表示される', async ({ page }) => {
    // 報酬ページに移動
    await page.goto('/rewards');
    
    // 報酬アイテムが表示されているか確認
    const rewardItems = page.getByTestId('reward-item');
    await expect(rewardItems).toHaveCount(2);
    
    // ポイント価格が表示されているか確認
    await expect(page.getByText('100 ポイント')).toBeVisible();
    await expect(page.getByText('1000 ポイント')).toBeVisible();
  });
}); 
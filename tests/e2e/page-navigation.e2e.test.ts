import { test, expect } from '@playwright/test';

// MCPサーバーのベースURL
const BASE_URL = 'http://localhost:3000';

// テスト対象のページとその期待値
const pages = [
  {
    path: '/',
    name: 'ホームページ',
    expectedElements: [
      { selector: 'nav', description: 'ナビゲーションメニュー' },
      { selector: 'main', description: 'メインコンテンツ' },
      { selector: 'footer', description: 'フッター' }
    ]
  },
  {
    path: '/dashboard',
    name: 'ダッシュボード',
    requiresAuth: true,
    expectedElements: [
      { selector: '.dashboard-summary', description: '活動サマリー' },
      { selector: '.giver-score-chart', description: 'ギバースコアチャート' },
      { selector: '.activity-chart', description: '活動チャート' }
    ]
  },
  {
    path: '/quiz',
    name: 'ギバー診断',
    expectedElements: [
      { selector: '.quiz-container', description: 'クイズコンテナ' },
      { selector: '.quiz-progress', description: '進捗バー' }
    ]
  },
  {
    path: '/materials',
    name: '教材一覧',
    expectedElements: [
      { selector: '.materials-grid', description: '教材グリッド' },
      { selector: '.filter-section', description: 'フィルターセクション' }
    ]
  },
  {
    path: '/settings',
    name: '設定',
    requiresAuth: true,
    expectedElements: [
      { selector: '.settings-form', description: '設定フォーム' },
      { selector: '.theme-selector', description: 'テーマ選択' }
    ]
  }
];

test.describe('ページ遷移テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  // 各ページへの遷移とコンテンツ表示のテスト
  for (const { path, name, expectedElements, requiresAuth } of pages) {
    test(`${name}への遷移と要素の確認`, async ({ page }) => {
      // ページに遷移
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');

      // 認証が必要なページの場合、ログインページへのリダイレクトを確認
      if (requiresAuth) {
        await expect(page).toHaveURL(/.*\/login/);
        // TODO: ログイン処理の実装
        return;
      }

      // URLが正しいことを確認
      await expect(page).toHaveURL(`${BASE_URL}${path}`);

      // 期待される要素の存在を確認
      for (const { selector, description } of expectedElements) {
        await expect(page.locator(selector), 
          `${description}が表示されていません`).toBeVisible();
      }
    });
  }

  // エラーページの表示テスト
  test('存在しないページへのアクセス', async ({ page }) => {
    await page.goto(`${BASE_URL}/non-existent-page`);
    await page.waitForLoadState('networkidle');
    
    // 404ページの表示を確認
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=ページが見つかりません')).toBeVisible();
  });

  // ナビゲーションメニューからの遷移テスト
  test('ナビゲーションメニューからの遷移', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // 各ナビゲーションリンクをクリックして遷移を確認
    const navLinks = [
      { text: 'ホーム', path: '/' },
      { text: 'ギバー診断', path: '/quiz' },
      { text: '教材一覧', path: '/materials' }
    ];

    for (const { text, path } of navLinks) {
      await page.click(`nav >> text=${text}`);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(`${BASE_URL}${path}`);
    }
  });

  // ブラウザの戻る・進む操作のテスト
  test('ブラウザナビゲーション履歴', async ({ page }) => {
    // ホーム → クイズ → 教材一覧 の順に遷移
    await page.goto(`${BASE_URL}/`);
    await page.goto(`${BASE_URL}/quiz`);
    await page.goto(`${BASE_URL}/materials`);

    // 戻るボタンで2回戻る
    await page.goBack();
    await expect(page).toHaveURL(`${BASE_URL}/quiz`);
    await page.goBack();
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // 進むボタンで2回進む
    await page.goForward();
    await expect(page).toHaveURL(`${BASE_URL}/quiz`);
    await page.goForward();
    await expect(page).toHaveURL(`${BASE_URL}/materials`);
  });
}); 
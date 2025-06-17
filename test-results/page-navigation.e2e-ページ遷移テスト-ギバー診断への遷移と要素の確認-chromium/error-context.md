# Test info

- Name: ページ遷移テスト >> ギバー診断への遷移と要素の確認
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/page-navigation.e2e.test.ts:62:9

# Error details

```
Error: クイズコンテナが表示されていません

Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('.quiz-container')
Expected: visible
Received: <element(s) not found>
Call log:
  - クイズコンテナが表示されていません with timeout 5000ms
  - waiting for locator('.quiz-container')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/page-navigation.e2e.test.ts:80:39
```

# Page snapshot

```yaml
- navigation:
  - link "ShiftWith":
    - /url: /
  - link "ホーム":
    - /url: /
    - img
    - text: ホーム
  - link "教材探索":
    - /url: /explore
    - img
    - text: 教材探索
  - link "ログイン":
    - /url: /auth/login
  - link "新規登録":
    - /url: /auth/signup
- main:
  - main:
    - heading "ギバー診断" [level=1]
    - paragraph: あなたの学習スタイルと他者への貢献傾向を分析し、最適な学習方法を提案します。
    - button "簡易診断（5問）"
    - button "詳細診断（全問）"
    - paragraph: 簡易診断は約1分、詳細診断は約3分で完了します
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // MCPサーバーのベースURL
   4 | const BASE_URL = 'http://localhost:3000';
   5 |
   6 | // テスト対象のページとその期待値
   7 | const pages = [
   8 |   {
   9 |     path: '/',
   10 |     name: 'ホームページ',
   11 |     expectedElements: [
   12 |       { selector: 'nav', description: 'ナビゲーションメニュー' },
   13 |       { selector: 'main', description: 'メインコンテンツ' },
   14 |       { selector: 'footer', description: 'フッター' }
   15 |     ]
   16 |   },
   17 |   {
   18 |     path: '/dashboard',
   19 |     name: 'ダッシュボード',
   20 |     requiresAuth: true,
   21 |     expectedElements: [
   22 |       { selector: '.dashboard-summary', description: '活動サマリー' },
   23 |       { selector: '.giver-score-chart', description: 'ギバースコアチャート' },
   24 |       { selector: '.activity-chart', description: '活動チャート' }
   25 |     ]
   26 |   },
   27 |   {
   28 |     path: '/quiz',
   29 |     name: 'ギバー診断',
   30 |     expectedElements: [
   31 |       { selector: '.quiz-container', description: 'クイズコンテナ' },
   32 |       { selector: '.quiz-progress', description: '進捗バー' }
   33 |     ]
   34 |   },
   35 |   {
   36 |     path: '/materials',
   37 |     name: '教材一覧',
   38 |     expectedElements: [
   39 |       { selector: '.materials-grid', description: '教材グリッド' },
   40 |       { selector: '.filter-section', description: 'フィルターセクション' }
   41 |     ]
   42 |   },
   43 |   {
   44 |     path: '/settings',
   45 |     name: '設定',
   46 |     requiresAuth: true,
   47 |     expectedElements: [
   48 |       { selector: '.settings-form', description: '設定フォーム' },
   49 |       { selector: '.theme-selector', description: 'テーマ選択' }
   50 |     ]
   51 |   }
   52 | ];
   53 |
   54 | test.describe('ページ遷移テスト', () => {
   55 |   test.beforeEach(async ({ page }) => {
   56 |     await page.goto(BASE_URL);
   57 |     await page.waitForLoadState('networkidle');
   58 |   });
   59 |
   60 |   // 各ページへの遷移とコンテンツ表示のテスト
   61 |   for (const { path, name, expectedElements, requiresAuth } of pages) {
   62 |     test(`${name}への遷移と要素の確認`, async ({ page }) => {
   63 |       // ページに遷移
   64 |       await page.goto(`${BASE_URL}${path}`);
   65 |       await page.waitForLoadState('networkidle');
   66 |
   67 |       // 認証が必要なページの場合、ログインページへのリダイレクトを確認
   68 |       if (requiresAuth) {
   69 |         await expect(page).toHaveURL(/.*\/login/);
   70 |         // TODO: ログイン処理の実装
   71 |         return;
   72 |       }
   73 |
   74 |       // URLが正しいことを確認
   75 |       await expect(page).toHaveURL(`${BASE_URL}${path}`);
   76 |
   77 |       // 期待される要素の存在を確認
   78 |       for (const { selector, description } of expectedElements) {
   79 |         await expect(page.locator(selector), 
>  80 |           `${description}が表示されていません`).toBeVisible();
      |                                       ^ Error: クイズコンテナが表示されていません
   81 |       }
   82 |     });
   83 |   }
   84 |
   85 |   // エラーページの表示テスト
   86 |   test('存在しないページへのアクセス', async ({ page }) => {
   87 |     await page.goto(`${BASE_URL}/non-existent-page`);
   88 |     await page.waitForLoadState('networkidle');
   89 |     
   90 |     // 404ページの表示を確認
   91 |     await expect(page.locator('text=404')).toBeVisible();
   92 |     await expect(page.locator('text=ページが見つかりません')).toBeVisible();
   93 |   });
   94 |
   95 |   // ナビゲーションメニューからの遷移テスト
   96 |   test('ナビゲーションメニューからの遷移', async ({ page }) => {
   97 |     await page.goto(BASE_URL);
   98 |     
   99 |     // 各ナビゲーションリンクをクリックして遷移を確認
  100 |     const navLinks = [
  101 |       { text: 'ホーム', path: '/' },
  102 |       { text: 'ギバー診断', path: '/quiz' },
  103 |       { text: '教材一覧', path: '/materials' }
  104 |     ];
  105 |
  106 |     for (const { text, path } of navLinks) {
  107 |       await page.click(`nav >> text=${text}`);
  108 |       await page.waitForLoadState('networkidle');
  109 |       await expect(page).toHaveURL(`${BASE_URL}${path}`);
  110 |     }
  111 |   });
  112 |
  113 |   // ブラウザの戻る・進む操作のテスト
  114 |   test('ブラウザナビゲーション履歴', async ({ page }) => {
  115 |     // ホーム → クイズ → 教材一覧 の順に遷移
  116 |     await page.goto(`${BASE_URL}/`);
  117 |     await page.goto(`${BASE_URL}/quiz`);
  118 |     await page.goto(`${BASE_URL}/materials`);
  119 |
  120 |     // 戻るボタンで2回戻る
  121 |     await page.goBack();
  122 |     await expect(page).toHaveURL(`${BASE_URL}/quiz`);
  123 |     await page.goBack();
  124 |     await expect(page).toHaveURL(`${BASE_URL}/`);
  125 |
  126 |     // 進むボタンで2回進む
  127 |     await page.goForward();
  128 |     await expect(page).toHaveURL(`${BASE_URL}/quiz`);
  129 |     await page.goForward();
  130 |     await expect(page).toHaveURL(`${BASE_URL}/materials`);
  131 |   });
  132 | }); 
```
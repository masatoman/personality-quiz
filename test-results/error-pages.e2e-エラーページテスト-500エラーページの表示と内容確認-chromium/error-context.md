# Test info

- Name: エラーページテスト >> 500エラーページの表示と内容確認
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/error-pages.e2e.test.ts:32:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('h1:has-text("500")')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('h1:has-text("500")')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/error-pages.e2e.test.ts:38:54
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
  - img
  - heading "404" [level=1]
  - heading "ページが見つかりません" [level=2]
  - paragraph: お探しのページは移動または削除された可能性があります。 代わりに、こちらの機能をお試しください。
  - link "ギバー診断を受ける":
    - /url: /quiz
    - img
    - text: ギバー診断を受ける
  - link "教材を探す":
    - /url: /explore
    - img
    - text: 教材を探す
  - link "教材を作成する":
    - /url: /create
    - img
    - text: 教材を作成する
  - link "ホームに戻る":
    - /url: /
    - img
    - text: ホームに戻る
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // MCPサーバーのベースURL
   4 | const BASE_URL = 'http://localhost:3000';
   5 |
   6 | test.describe('エラーページテスト', () => {
   7 |   test.beforeEach(async ({ page }) => {
   8 |     await page.goto(BASE_URL);
   9 |     await page.waitForLoadState('networkidle');
   10 |   });
   11 |
   12 |   // 404エラーページのテスト
   13 |   test('404エラーページの表示と内容確認', async ({ page }) => {
   14 |     // 存在しないページへアクセス
   15 |     await page.goto(`${BASE_URL}/non-existent-page`);
   16 |     await page.waitForLoadState('networkidle');
   17 |
   18 |     // 404ページの要素を確認
   19 |     await expect(page.locator('h1:has-text("404")')).toBeVisible();
   20 |     await expect(page.locator('text=ページが見つかりません')).toBeVisible();
   21 |     
   22 |     // ホームへ戻るリンクの確認
   23 |     const homeLink = page.locator('a:has-text("ホームへ戻る")');
   24 |     await expect(homeLink).toBeVisible();
   25 |     
   26 |     // ホームへ戻るリンクのクリックとリダイレクト確認
   27 |     await homeLink.click();
   28 |     await expect(page).toHaveURL(BASE_URL);
   29 |   });
   30 |
   31 |   // 500エラーページのテスト
   32 |   test('500エラーページの表示と内容確認', async ({ page }) => {
   33 |     // サーバーエラーを発生させるエンドポイントにアクセス
   34 |     await page.goto(`${BASE_URL}/api/test-error`);
   35 |     await page.waitForLoadState('networkidle');
   36 |
   37 |     // 500ページの要素を確認
>  38 |     await expect(page.locator('h1:has-text("500")')).toBeVisible();
      |                                                      ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   39 |     await expect(page.locator('text=サーバーエラーが発生しました')).toBeVisible();
   40 |     
   41 |     // リロードボタンの確認
   42 |     const reloadButton = page.locator('button:has-text("再読み込み")');
   43 |     await expect(reloadButton).toBeVisible();
   44 |   });
   45 |
   46 |   // 403エラーページのテスト
   47 |   test('403エラーページの表示と内容確認', async ({ page }) => {
   48 |     // 認証が必要なAPIエンドポイントに未認証でアクセス
   49 |     await page.goto(`${BASE_URL}/api/protected-resource`);
   50 |     await page.waitForLoadState('networkidle');
   51 |
   52 |     // 403ページの要素を確認
   53 |     await expect(page.locator('h1:has-text("403")')).toBeVisible();
   54 |     await expect(page.locator('text=アクセスが拒否されました')).toBeVisible();
   55 |     
   56 |     // ログインページへのリンクを確認
   57 |     const loginLink = page.locator('a:has-text("ログイン")');
   58 |     await expect(loginLink).toBeVisible();
   59 |     
   60 |     // ログインページへの遷移を確認
   61 |     await loginLink.click();
   62 |     await expect(page).toHaveURL(`${BASE_URL}/login`);
   63 |   });
   64 |
   65 |   // エラーページのレスポンシブデザインテスト
   66 |   test('エラーページのレスポンシブ表示', async ({ page }) => {
   67 |     // ビューポートサイズを設定
   68 |     const viewports = [
   69 |       { width: 375, height: 667 },  // モバイル
   70 |       { width: 768, height: 1024 }, // タブレット
   71 |       { width: 1280, height: 800 }  // デスクトップ
   72 |     ];
   73 |
   74 |     for (const viewport of viewports) {
   75 |       // ビューポートサイズを設定
   76 |       await page.setViewportSize(viewport);
   77 |       
   78 |       // 404ページにアクセス
   79 |       await page.goto(`${BASE_URL}/non-existent-page`);
   80 |       await page.waitForLoadState('networkidle');
   81 |
   82 |       // エラーコンテナの表示を確認
   83 |       const errorContainer = page.locator('.error-container');
   84 |       await expect(errorContainer).toBeVisible();
   85 |       
   86 |       // エラーイラストの表示を確認
   87 |       const errorIllustration = page.locator('.error-illustration');
   88 |       await expect(errorIllustration).toBeVisible();
   89 |       
   90 |       // テキストの可読性を確認
   91 |       const errorMessage = page.locator('.error-message');
   92 |       await expect(errorMessage).toBeVisible();
   93 |     }
   94 |   });
   95 |
   96 |   // エラーページのアクセシビリティテスト
   97 |   test('エラーページのアクセシビリティ', async ({ page }) => {
   98 |     // 404ページにアクセス
   99 |     await page.goto(`${BASE_URL}/non-existent-page`);
  100 |     await page.waitForLoadState('networkidle');
  101 |
  102 |     // 見出しの階層構造を確認
  103 |     await expect(page.locator('h1')).toBeVisible();
  104 |     
  105 |     // エラーメッセージの役割を確認
  106 |     const errorMessage = page.locator('[role="alert"]');
  107 |     await expect(errorMessage).toBeVisible();
  108 |     
  109 |     // ナビゲーションリンクのアクセシビリティを確認
  110 |     const navigationLinks = page.locator('a[role="navigation"]');
  111 |     await expect(navigationLinks).toHaveAttribute('aria-label', /.*へ移動/);
  112 |   });
  113 | }); 
```
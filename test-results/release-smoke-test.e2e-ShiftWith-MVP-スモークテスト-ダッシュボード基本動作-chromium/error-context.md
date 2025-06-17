# Test info

- Name: ShiftWith MVP スモークテスト >> ダッシュボード基本動作
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/release-smoke-test.e2e.test.ts:88:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/release-smoke-test.e2e.test.ts:97:49
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
  - heading "ホーム" [level=1]
  - paragraph: あなたの学習活動の全体像とギバースコアの成長を確認できます
  - img
  - heading "作成した教材" [level=3]
  - paragraph: 0件
  - img
  - heading "獲得ポイント" [level=3]
  - paragraph: 0pt
  - img
  - heading "閲覧した教材" [level=3]
  - paragraph: 0件
  - heading "ギバースコアの推移" [level=2]
  - heading "ギバースコア推移" [level=3]
  - button "1週間"
  - button "1ヶ月"
  - button "3ヶ月"
  - button "6ヶ月"
  - button "1年"
  - heading "活動内訳" [level=2]
  - heading "アクティビティデータがありません" [level=3]
  - paragraph: 以下のアクティビティを行うとデータが記録されます：
  - list:
    - listitem: 教材作成
    - listitem: 学習活動
    - listitem: フィードバック
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | /**
   4 |  * ShiftWith MVP スモークテスト
   5 |  * 
   6 |  * リリース直前の最終確認として、最重要機能が動作するかを
   7 |  * 短時間で確認するためのスモークテストです。
   8 |  * 
   9 |  * 実行時間目標: 3-5分以内
   10 |  */
   11 |
   12 | test.describe('ShiftWith MVP スモークテスト', () => {
   13 |   test.describe.configure({ mode: 'parallel' });
   14 |
   15 |   /**
   16 |    * 🔥 最重要: アプリケーションが起動するか
   17 |    */
   18 |   test('アプリケーション基本起動確認', async ({ page }) => {
   19 |     // ホームページが正常にロードされるか
   20 |     await page.goto('/');
   21 |     await expect(page.locator('h1, h2, [role="banner"]')).toBeVisible();
   22 |     
   23 |     // 基本ナビゲーションが表示されるか
   24 |     await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
   25 |     
   26 |     console.log('✅ アプリケーション基本起動: OK');
   27 |   });
   28 |
   29 |   /**
   30 |    * 🔐 認証システム基本動作確認
   31 |    */
   32 |   test('認証システム基本動作', async ({ page }) => {
   33 |     // ログインページへのアクセス
   34 |     await page.goto('/auth/login');
   35 |     await expect(page).toHaveURL(/\/auth\/login/);
   36 |     
   37 |     // ログインフォームの存在確認
   38 |     await expect(page.locator('[data-testid="email-input"], input[type="email"]')).toBeVisible();
   39 |     await expect(page.locator('[data-testid="password-input"], input[type="password"]')).toBeVisible();
   40 |     
   41 |     // サインアップページへの遷移
   42 |     await page.goto('/auth/signup');
   43 |     await expect(page).toHaveURL(/\/auth\/signup/);
   44 |     
   45 |     console.log('✅ 認証システム基本動作: OK');
   46 |   });
   47 |
   48 |   /**
   49 |    * 🧠 ギバー診断システム基本動作確認
   50 |    */
   51 |   test('ギバー診断システム基本動作', async ({ page }) => {
   52 |     // 診断ページへのアクセス（認証なしでもアクセス可能かチェック）
   53 |     await page.goto('/quiz');
   54 |     
   55 |     // 診断開始画面または質問画面が表示されるか
   56 |     const hasQuizContent = await page.locator('h1, h2, h3').count() > 0;
   57 |     expect(hasQuizContent).toBeTruthy();
   58 |     
   59 |     // 質問または説明テキストが存在するか
   60 |     const hasContent = await page.locator('p, div, span').count() > 0;
   61 |     expect(hasContent).toBeTruthy();
   62 |     
   63 |     console.log('✅ ギバー診断システム基本動作: OK');
   64 |   });
   65 |
   66 |   /**
   67 |    * 📚 教材システム基本動作確認
   68 |    */
   69 |   test('教材システム基本動作', async ({ page }) => {
   70 |     // 教材一覧ページへのアクセス
   71 |     await page.goto('/materials');
   72 |     await expect(page).toHaveURL(/\/materials/);
   73 |     
   74 |     // ページが正常にロードされたか（エラーページでないか）
   75 |     const isErrorPage = await page.locator('[data-testid="404-error"], [data-testid="500-error"]').count();
   76 |     expect(isErrorPage).toBe(0);
   77 |     
   78 |     // 何らかのコンテンツが表示されているか
   79 |     const hasContent = await page.locator('h1, h2, h3, p, div').count() > 0;
   80 |     expect(hasContent).toBeTruthy();
   81 |     
   82 |     console.log('✅ 教材システム基本動作: OK');
   83 |   });
   84 |
   85 |   /**
   86 |    * 📊 ダッシュボード基本動作確認
   87 |    */
   88 |   test('ダッシュボード基本動作', async ({ page }) => {
   89 |     // 未認証でのダッシュボードアクセス → ログインページにリダイレクト
   90 |     await page.goto('/dashboard');
   91 |     
   92 |     // ログインページにリダイレクトされるか、または認証モーダルが表示されるか
   93 |     const currentUrl = page.url();
   94 |     const isRedirectedToLogin = currentUrl.includes('/auth/login') || currentUrl.includes('/login');
   95 |     const hasAuthModal = await page.locator('[data-testid="auth-modal"], [data-testid="login-modal"]').count() > 0;
   96 |     
>  97 |     expect(isRedirectedToLogin || hasAuthModal).toBeTruthy();
      |                                                 ^ Error: expect(received).toBeTruthy()
   98 |     
   99 |     console.log('✅ ダッシュボード認証制御: OK');
  100 |   });
  101 |
  102 |   /**
  103 |    * 🏆 ランキングシステム基本動作確認
  104 |    */
  105 |   test('ランキングシステム基本動作', async ({ page }) => {
  106 |     // ランキングページへのアクセス
  107 |     await page.goto('/rankings');
  108 |     
  109 |     // ページが正常にロードされたか
  110 |     const isErrorPage = await page.locator('[data-testid="404-error"], [data-testid="500-error"]').count();
  111 |     expect(isErrorPage).toBe(0);
  112 |     
  113 |     // 何らかのランキングコンテンツが表示されているか
  114 |     const hasRankingContent = await page.locator('table, .ranking, [data-testid="ranking"]').count() > 0;
  115 |     expect(hasRankingContent).toBeTruthy();
  116 |     
  117 |     console.log('✅ ランキングシステム基本動作: OK');
  118 |   });
  119 |
  120 |   /**
  121 |    * 🚀 API基本動作確認
  122 |    */
  123 |   test('主要API基本応答確認', async ({ page }) => {
  124 |     const apis = [
  125 |       '/api/categories',
  126 |       '/api/difficulties',
  127 |       '/api/rankings/weekly'
  128 |     ];
  129 |
  130 |     for (const apiPath of apis) {
  131 |       const response = await page.request.get(apiPath);
  132 |       
  133 |       // API が 500 エラーを返していないか確認
  134 |       expect(response.status()).not.toBe(500);
  135 |       
  136 |       // 404 は許容するが、500 系エラーは許容しない
  137 |       if (response.status() >= 500) {
  138 |         throw new Error(`API ${apiPath} returned ${response.status()}`);
  139 |       }
  140 |       
  141 |       console.log(`📡 API ${apiPath}: ${response.status()}`);
  142 |     }
  143 |     
  144 |     console.log('✅ 主要API基本応答: OK');
  145 |   });
  146 |
  147 |   /**
  148 |    * 📱 レスポンシブ基本確認
  149 |    */
  150 |   test('レスポンシブデザイン基本確認', async ({ page }) => {
  151 |     await page.goto('/');
  152 |     
  153 |     // デスクトップ表示
  154 |     await page.setViewportSize({ width: 1200, height: 800 });
  155 |     await expect(page.locator('body')).toBeVisible();
  156 |     
  157 |     // タブレット表示
  158 |     await page.setViewportSize({ width: 768, height: 1024 });
  159 |     await expect(page.locator('body')).toBeVisible();
  160 |     
  161 |     // スマートフォン表示
  162 |     await page.setViewportSize({ width: 375, height: 667 });
  163 |     await expect(page.locator('body')).toBeVisible();
  164 |     
  165 |     console.log('✅ レスポンシブデザイン基本確認: OK');
  166 |   });
  167 |
  168 |   /**
  169 |    * ⚡ ページロード速度基本確認
  170 |    */
  171 |   test('主要ページロード速度確認', async ({ page }) => {
  172 |     const pages = ['/', '/materials', '/rankings'];
  173 |     
  174 |     for (const pagePath of pages) {
  175 |       const startTime = Date.now();
  176 |       await page.goto(pagePath);
  177 |       await page.waitForLoadState('domcontentloaded');
  178 |       const loadTime = Date.now() - startTime;
  179 |       
  180 |       // 10秒以内にDOMがロードされれば OK（緩い条件）
  181 |       expect(loadTime).toBeLessThan(10000);
  182 |       console.log(`⏱️ ${pagePath}: ${loadTime}ms`);
  183 |     }
  184 |     
  185 |     console.log('✅ ページロード速度基本確認: OK');
  186 |   });
  187 |
  188 |   /**
  189 |    * 🛡️ セキュリティ基本確認
  190 |    */
  191 |   test('基本セキュリティ設定確認', async ({ page }) => {
  192 |     await page.goto('/');
  193 |     
  194 |     // HTTPS または localhost での動作確認
  195 |     const url = page.url();
  196 |     const isSecure = url.startsWith('https://') || url.includes('localhost');
  197 |     expect(isSecure).toBeTruthy();
```
# Test info

- Name: リダイレクト処理テスト >> エラー時の適切なリダイレクト
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/redirects.e2e.test.ts:121:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:3000/login"
Received string: "http://localhost:3000/api/user/profile"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html>…</html>
      - unexpected value "http://localhost:3000/api/user/profile"

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/redirects.e2e.test.ts:127:24
```

# Page snapshot

```yaml
- text: "{\"error\":\"認証が必要です\"}"
```

# Test source

```ts
   27 |     for (const { path, name } of protectedPages) {
   28 |       // 未認証状態でアクセス
   29 |       await page.goto(`${BASE_URL}${path}`);
   30 |       await page.waitForLoadState('networkidle');
   31 |
   32 |       // ログインページへのリダイレクトを確認
   33 |       await expect(page).toHaveURL(`${BASE_URL}/login`);
   34 |       
   35 |       // リダイレクト後のメッセージを確認
   36 |       await expect(page.locator('.alert-message')).toContainText('ログインが必要です');
   37 |       
   38 |       // リダイレクト元のURLがクエリパラメータとして保持されているか確認
   39 |       const url = new URL(page.url());
   40 |       expect(url.searchParams.get('redirect')).toBe(path);
   41 |     }
   42 |   });
   43 |
   44 |   // ログイン後のリダイレクトテスト
   45 |   test('ログイン後の元ページへのリダイレクト', async ({ page }) => {
   46 |     // ダッシュボードへアクセス（未認証）
   47 |     await page.goto(`${BASE_URL}/dashboard`);
   48 |     await page.waitForLoadState('networkidle');
   49 |     
   50 |     // ログインページへリダイレクトされることを確認
   51 |     await expect(page).toHaveURL(`${BASE_URL}/login?redirect=/dashboard`);
   52 |
   53 |     // ログインフォームに入力
   54 |     await page.fill('input[name="email"]', TEST_USER.email);
   55 |     await page.fill('input[name="password"]', TEST_USER.password);
   56 |     await page.click('button[type="submit"]');
   57 |
   58 |     // 元のページ（ダッシュボード）にリダイレクトされることを確認
   59 |     await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
   60 |   });
   61 |
   62 |   // ログイン済みユーザーのアクセス制御テスト
   63 |   test('ログイン済みユーザーのアクセス制御', async ({ page }) => {
   64 |     // ログイン処理
   65 |     await page.goto(`${BASE_URL}/login`);
   66 |     await page.fill('input[name="email"]', TEST_USER.email);
   67 |     await page.fill('input[name="password"]', TEST_USER.password);
   68 |     await page.click('button[type="submit"]');
   69 |     await page.waitForLoadState('networkidle');
   70 |
   71 |     // ログイン・登録ページへのアクセス試行
   72 |     const authPages = [
   73 |       { path: '/login', redirectTo: '/dashboard' },
   74 |       { path: '/register', redirectTo: '/dashboard' }
   75 |     ];
   76 |
   77 |     for (const { path, redirectTo } of authPages) {
   78 |       await page.goto(`${BASE_URL}${path}`);
   79 |       await page.waitForLoadState('networkidle');
   80 |       
   81 |       // ダッシュボードにリダイレクトされることを確認
   82 |       await expect(page).toHaveURL(`${BASE_URL}${redirectTo}`);
   83 |     }
   84 |   });
   85 |
   86 |   // ギバー診断フローのリダイレクトテスト
   87 |   test('ギバー診断フローのリダイレクト', async ({ page }) => {
   88 |     // 新規登録
   89 |     await page.goto(`${BASE_URL}/register`);
   90 |     await page.fill('input[name="email"]', `new-user-${Date.now()}@example.com`);
   91 |     await page.fill('input[name="password"]', 'newpass123');
   92 |     await page.click('button[type="submit"]');
   93 |     
   94 |     // ギバー診断ページにリダイレクトされることを確認
   95 |     await expect(page).toHaveURL(`${BASE_URL}/quiz`);
   96 |     
   97 |     // 診断をスキップしようとしてダッシュボードにアクセス
   98 |     await page.goto(`${BASE_URL}/dashboard`);
   99 |     
  100 |     // 診断ページに戻されることを確認
  101 |     await expect(page).toHaveURL(`${BASE_URL}/quiz`);
  102 |     await expect(page.locator('.alert-message')).toContainText('ギバー診断を完了してください');
  103 |   });
  104 |
  105 |   // 外部リンクからの戻りリダイレクトテスト
  106 |   test('外部認証後の戻りリダイレクト', async ({ page }) => {
  107 |     // OAuth認証をシミュレート
  108 |     await page.goto(`${BASE_URL}/auth/google/callback?code=test-code`);
  109 |     await page.waitForLoadState('networkidle');
  110 |     
  111 |     // 初回ログインの場合はギバー診断へ
  112 |     await expect(page).toHaveURL(`${BASE_URL}/quiz`);
  113 |     
  114 |     // 既存ユーザーの場合はダッシュボードへ
  115 |     await page.goto(`${BASE_URL}/auth/google/callback?code=existing-user`);
  116 |     await page.waitForLoadState('networkidle');
  117 |     await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  118 |   });
  119 |
  120 |   // エラー時のリダイレクトテスト
  121 |   test('エラー時の適切なリダイレクト', async ({ page }) => {
  122 |     // 無効なトークンでのAPI呼び出し
  123 |     await page.goto(`${BASE_URL}/api/user/profile`);
  124 |     await page.waitForLoadState('networkidle');
  125 |     
  126 |     // ログインページへリダイレクト
> 127 |     await expect(page).toHaveURL(`${BASE_URL}/login`);
      |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  128 |     
  129 |     // セッション切れをシミュレート
  130 |     await page.evaluate(() => {
  131 |       localStorage.removeItem('auth_token');
  132 |     });
  133 |     await page.goto(`${BASE_URL}/dashboard`);
  134 |     
  135 |     // ログインページへリダイレクト
  136 |     await expect(page).toHaveURL(`${BASE_URL}/login`);
  137 |     await expect(page.locator('.alert-message')).toContainText('セッションが切れました');
  138 |   });
  139 | }); 
```
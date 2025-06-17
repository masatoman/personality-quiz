# Test info

- Name: 認証機能のE2Eテスト >> Googleアカウントでログインできる
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/auth.e2e.test.ts:16:7

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[aria-label="google-login-button"]')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/auth.e2e.test.ts:17:16
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
  - heading "ログイン" [level=1]
  - text: メールアドレス
  - textbox "メールアドレス"
  - text: パスワード
  - textbox "パスワード"
  - button "ログイン"
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('認証機能のE2Eテスト', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('http://localhost:3000/login');
   6 |   });
   7 |
   8 |   test('メールアドレスとパスワードでログインできる', async ({ page }) => {
   9 |     await page.fill('[aria-label="email-input"]', 'test@example.com');
  10 |     await page.fill('[aria-label="password-input"]', 'password123');
  11 |     await page.click('[aria-label="login-button"]');
  12 |
  13 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
  14 |   });
  15 |
  16 |   test('Googleアカウントでログインできる', async ({ page }) => {
> 17 |     await page.click('[aria-label="google-login-button"]');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  18 |
  19 |     // Googleログインフローの処理
  20 |     // Note: 実際のGoogleログインフローはモックする必要があります
  21 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
  22 |   });
  23 |
  24 |   test('GitHubアカウントでログインできる', async ({ page }) => {
  25 |     await page.click('[aria-label="github-login-button"]');
  26 |
  27 |     // GitHubログインフローの処理
  28 |     // Note: 実際のGitHubログインフローはモックする必要があります
  29 |     await expect(page.getByText('ダッシュボード')).toBeVisible();
  30 |   });
  31 |
  32 |   test('無効な認証情報でログインに失敗する', async ({ page }) => {
  33 |     await page.fill('[aria-label="email-input"]', 'invalid@example.com');
  34 |     await page.fill('[aria-label="password-input"]', 'wrongpassword');
  35 |     await page.click('[aria-label="login-button"]');
  36 |
  37 |     await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible();
  38 |   });
  39 |
  40 |   test('ログアウトができる', async ({ page }) => {
  41 |     // 最初にログイン
  42 |     await page.fill('[aria-label="email-input"]', 'test@example.com');
  43 |     await page.fill('[aria-label="password-input"]', 'password123');
  44 |     await page.click('[aria-label="login-button"]');
  45 |
  46 |     // ログアウトを実行
  47 |     await page.click('[aria-label="user-menu-button"]');
  48 |     await page.click('[aria-label="logout-button"]');
  49 |
  50 |     await expect(page.getByText('ログイン')).toBeVisible();
  51 |   });
  52 | }); 
```
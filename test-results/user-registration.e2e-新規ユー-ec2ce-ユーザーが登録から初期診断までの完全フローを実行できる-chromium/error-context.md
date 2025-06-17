# Test info

- Name: 新規ユーザー完全フロー >> 新規ユーザーが登録から初期診断までの完全フローを実行できる
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/user-registration.e2e.test.ts:16:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3002/
Call log:
  - navigating to "http://localhost:3002/", waiting until "load"

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/user-registration.e2e.test.ts:13:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | /**
   4 |  * 新規ユーザー登録からギバー診断完了までのE2Eテスト
   5 |  * テスト対象: ユーザー登録から初期診断までの完全フロー
   6 |  */
   7 | test.describe('新規ユーザー完全フロー', () => {
   8 |   const testEmail = `test-user-${Date.now()}@example.com`;
   9 |   const testPassword = 'Password123!';
  10 |
  11 |   test.beforeEach(async ({ page }) => {
  12 |     // アプリケーションのホームページを開く
> 13 |     await page.goto('http://localhost:3002/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3002/
  14 |   });
  15 |
  16 |   test('新規ユーザーが登録から初期診断までの完全フローを実行できる', async ({ page }) => {
  17 |     // 1. ホームページから登録ページに遷移
  18 |     await page.getByRole('link', { name: '登録' }).click();
  19 |     await expect(page).toHaveURL('http://localhost:3002/signup');
  20 |     
  21 |     // 2. 登録フォームに情報を入力
  22 |     await page.getByLabel('メールアドレス').fill(testEmail);
  23 |     await page.getByLabel('パスワード').fill(testPassword);
  24 |     await page.getByLabel('パスワード（確認）').fill(testPassword);
  25 |     
  26 |     // 3. 登録を実行
  27 |     await page.getByRole('button', { name: '登録' }).click();
  28 |     
  29 |     // 4. メール確認画面が表示される
  30 |     await expect(page.getByText('確認メールを送信しました')).toBeVisible();
  31 |     
  32 |     // 5. メール確認をスキップ（テスト用）
  33 |     // テスト環境では認証をバイパスする処理（実際のアプリケーションに合わせて調整）
  34 |     await page.goto('http://localhost:3002/auth/verify-skip?email=' + encodeURIComponent(testEmail));
  35 |     
  36 |     // 6. ウェルカム画面が表示される
  37 |     await expect(page.getByText('ShiftWithへようこそ')).toBeVisible();
  38 |     
  39 |     // 7. ギバー診断を開始
  40 |     await page.getByRole('button', { name: 'ギバー診断を始める' }).click();
  41 |     
  42 |     // 8. ギバー診断の質問に回答
  43 |     // 全10問程度の質問に回答
  44 |     for (let i = 1; i <= 10; i++) {
  45 |       // 質問が表示されるのを待つ
  46 |       await expect(page.getByText(`質問 ${i}`)).toBeVisible();
  47 |       
  48 |       // 回答をランダムに選択（1から5のいずれか）
  49 |       const randomAnswer = Math.floor(Math.random() * 5) + 1;
  50 |       await page.getByRole('radio', { name: `${randomAnswer}` }).click();
  51 |       
  52 |       // 次へボタンをクリック
  53 |       await page.getByRole('button', { name: '次へ' }).click();
  54 |     }
  55 |     
  56 |     // 9. 診断結果が表示される
  57 |     await expect(page.getByText('あなたのギバータイプ')).toBeVisible();
  58 |     
  59 |     // 10. 何らかのギバータイプとスコアが表示される
  60 |     await expect(page.getByTestId('giver-type')).toBeVisible();
  61 |     await expect(page.getByTestId('giver-score')).toBeVisible();
  62 |     
  63 |     // 11. ダッシュボードに進むボタンをクリック
  64 |     await page.getByRole('button', { name: 'ダッシュボードへ' }).click();
  65 |     
  66 |     // 12. ダッシュボードが表示される
  67 |     await expect(page).toHaveURL('http://localhost:3002/dashboard');
  68 |     await expect(page.getByText('今日のおすすめ')).toBeVisible();
  69 |     
  70 |     // 13. ギバースコアが表示されていることを確認
  71 |     await expect(page.getByTestId('giver-score-display')).toBeVisible();
  72 |     
  73 |     // 14. プロフィールメニューを開いてログアウトする
  74 |     await page.getByTestId('profile-menu-button').click();
  75 |     await page.getByRole('menuitem', { name: 'ログアウト' }).click();
  76 |     
  77 |     // 15. ログイン画面に戻ることを確認
  78 |     await expect(page).toHaveURL('http://localhost:3002/login');
  79 |   });
  80 | }); 
```
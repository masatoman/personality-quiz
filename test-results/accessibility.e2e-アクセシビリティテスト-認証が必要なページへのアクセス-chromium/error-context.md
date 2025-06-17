# Test info

- Name: アクセシビリティテスト >> 認証が必要なページへのアクセス
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/accessibility.e2e.test.ts:49:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "/login"
Received string:    "http://localhost:3000/dashboard"
    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/accessibility.e2e.test.ts:57:26
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
   2 | import { injectAxe, checkA11y } from 'axe-playwright';
   3 | import { AxeBuilder } from '@axe-core/playwright';
   4 |
   5 | // MCPサーバーのベースURL
   6 | const BASE_URL = 'http://localhost:3000';
   7 |
   8 | // ページのURLリスト
   9 | const pages = [
   10 |   { path: '/', name: 'ホームページ' },
   11 |   { path: '/dashboard', name: 'ダッシュボード' },
   12 |   { path: '/quiz', name: 'ギバー診断' },
   13 |   { path: '/materials', name: '教材一覧' }
   14 | ];
   15 |
   16 | // 認証が必要なページ
   17 | const protectedPages = ['/dashboard'];
   18 |
   19 | test.describe('アクセシビリティテスト', () => {
   20 |   // 長時間実行のテストのためにタイムアウトを設定
   21 |   test.setTimeout(120000);
   22 |
   23 |   test.beforeEach(async ({ page }) => {
   24 |     try {
   25 |       // ページの読み込みを待つ
   26 |       await page.goto(`${BASE_URL}/`);
   27 |       
   28 |       // 各種状態の読み込みを待つ
   29 |       await Promise.all([
   30 |         page.waitForLoadState('domcontentloaded'),
   31 |         page.waitForLoadState('load'),
   32 |         page.waitForLoadState('networkidle')
   33 |       ]);
   34 |
   35 |       // axe-coreを注入
   36 |       await injectAxe(page);
   37 |       
   38 |       // axe-coreの初期化を待つ
   39 |       await page.waitForFunction(() => window.hasOwnProperty('axe'));
   40 |
   41 |       console.log('✅ テスト環境のセットアップが完了しました');
   42 |     } catch (error) {
   43 |       console.error('❌ セットアップ中にエラーが発生:', error);
   44 |       throw error;
   45 |     }
   46 |   });
   47 |
   48 |   // 認証が必要なページへのアクセステスト
   49 |   test('認証が必要なページへのアクセス', async ({ page }) => {
   50 |     for (const protectedPath of protectedPages) {
   51 |       console.log(`🔒 ${protectedPath} へのアクセスをテスト中...`);
   52 |       
   53 |       // 未認証状態でアクセス
   54 |       await page.goto(`${BASE_URL}${protectedPath}`);
   55 |       
   56 |       // ログインページにリダイレクトされることを確認
>  57 |       expect(page.url()).toContain('/login');
      |                          ^ Error: expect(received).toContain(expected) // indexOf
   58 |       console.log(`✅ 正しくログインページにリダイレクトされました`);
   59 |     }
   60 |   });
   61 |
   62 |   // ホームページのアクセシビリティテスト
   63 |   test('ホームページのアクセシビリティテスト', async ({ page }) => {
   64 |     console.log('🔍 ホームページの基本アクセシビリティテストを開始します...');
   65 |     
   66 |     await page.goto(BASE_URL);
   67 |     
   68 |     try {
   69 |       const accessibilityScanResults = await new AxeBuilder({ page })
   70 |         .withTags(['wcag2a'])  // WCAG 2.0 Level Aのみに制限
   71 |         .disableRules(['color-contrast']) // カラーコントラストチェックを無効化
   72 |         .analyze();
   73 |
   74 |       // 重要な違反のみを確認
   75 |       const criticalViolations = accessibilityScanResults.violations.filter(
   76 |         violation => violation.impact === 'critical'
   77 |       );
   78 |
   79 |       expect(criticalViolations).toEqual([]);
   80 |       console.log('✅ ホームページは基本的なアクセシビリティ基準を満たしています');
   81 |     } catch (error) {
   82 |       console.error('❌ ホームページのテスト失敗:', error);
   83 |       throw error;
   84 |     }
   85 |   });
   86 |
   87 |   // 各ページのアクセシビリティテスト
   88 |   for (const { path, name } of pages) {
   89 |     if (!protectedPages.includes(path)) {
   90 |       test(`${name}ページのアクセシビリティテスト`, async ({ page }) => {
   91 |         console.log(`🔍 ${name}ページのアクセシビリティテストを開始します...`);
   92 |         
   93 |         await page.goto(`${BASE_URL}${path}`);
   94 |         
   95 |         try {
   96 |           const accessibilityScanResults = await new AxeBuilder({ page })
   97 |             .withTags(['wcag2a'])  // WCAG 2.0 Level Aのみに制限
   98 |             .disableRules(['color-contrast']) // カラーコントラストチェックを無効化
   99 |             .analyze();
  100 |
  101 |           // 重要な違反のみを確認
  102 |           const criticalViolations = accessibilityScanResults.violations.filter(
  103 |             violation => violation.impact === 'critical'
  104 |           );
  105 |
  106 |           if (criticalViolations.length > 0) {
  107 |             console.log(`⚠️ ${name}ページで重要なアクセシビリティ違反が見つかりました:`);
  108 |             criticalViolations.forEach((violation) => {
  109 |               console.log(`- ${violation.help}: ${violation.description}`);
  110 |             });
  111 |           }
  112 |
  113 |           expect(criticalViolations).toEqual([]);
  114 |           console.log(`✅ ${name}ページは基本的なアクセシビリティ基準を満たしています`);
  115 |         } catch (error) {
  116 |           console.error(`❌ ${name}ページのテスト失敗:`, error);
  117 |           throw error;
  118 |         }
  119 |       });
  120 |     }
  121 |   }
  122 | }); 
```
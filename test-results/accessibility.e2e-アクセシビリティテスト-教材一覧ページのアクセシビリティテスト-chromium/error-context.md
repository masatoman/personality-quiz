# Test info

- Name: アクセシビリティテスト >> 教材一覧ページのアクセシビリティテスト
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/accessibility.e2e.test.ts:90:11

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 85

- Array []
+ Array [
+   Object {
+     "description": "Ensure select element has an accessible name",
+     "help": "Select element must have an accessible name",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/select-name?application=playwright",
+     "id": "select-name",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "implicit-label",
+             "impact": "critical",
+             "message": "Element does not have an implicit (wrapped) <label>",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "explicit-label",
+             "impact": "critical",
+             "message": "Element does not have an explicit <label>",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "critical",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "critical",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "critical",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "presentational-role",
+             "impact": "critical",
+             "message": "Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element does not have an implicit (wrapped) <label>
+   Element does not have an explicit <label>
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute
+   Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+         "html": "<select class=\"w-full p-2 border rounded\"><option value=\"newest\">新着順</option><option value=\"popular\">人気順</option><option value=\"rating\">評価順</option></select>",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           "select",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.forms",
+       "wcag2a",
+       "wcag412",
+       "section508",
+       "section508.22.n",
+       "TTv5",
+       "TT5.c",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "ACT",
+     ],
+   },
+ ]
    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/accessibility.e2e.test.ts:113:38
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
  - heading "教材一覧" [level=1]
  - textbox "教材を検索..."
  - img
  - complementary:
    - heading "フィルター" [level=2]
    - heading "カテゴリー" [level=3]
    - radio "全て"
    - text: 全て
    - radio "文法"
    - text: 文法
    - radio "語彙"
    - text: 語彙
    - radio "リーディング"
    - text: リーディング
    - radio "リスニング"
    - text: リスニング
    - radio "スピーキング"
    - text: スピーキング
    - radio "ライティング"
    - text: ライティング
    - heading "レベル" [level=3]
    - radio "全て"
    - text: 全て
    - radio "初級"
    - text: 初級
    - radio "中級"
    - text: 中級
    - radio "上級"
    - text: 上級
    - heading "並び替え" [level=3]
    - combobox:
      - option "新着順" [selected]
      - option "人気順"
      - option "評価順"
    - button "フィルターをリセット"
  - main: 教材を読み込み中...
- alert
```

# Test source

```ts
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
   57 |       expect(page.url()).toContain('/login');
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
> 113 |           expect(criticalViolations).toEqual([]);
      |                                      ^ Error: expect(received).toEqual(expected) // deep equality
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
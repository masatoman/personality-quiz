# Test info

- Name: ページ遷移テスト >> 教材一覧への遷移と要素の確認
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/page-navigation.e2e.test.ts:62:9

# Error details

```
Error: 教材グリッドが表示されていません

Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('.materials-grid')
Expected: visible
Received: <element(s) not found>
Call log:
  - 教材グリッドが表示されていません with timeout 5000ms
  - waiting for locator('.materials-grid')

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
  - main:
    - link "上級英作文クイズ ⭐ 0 論理的な英文構成と高度な表現力をテストします quiz writing writing 中級 👁️ 4 閲覧 ⏱️ 30分":
      - /url: /materials/7e9e86f9-eac1-47fa-88da-5877b3267c84
      - heading "上級英作文クイズ" [level=3]
      - text: ⭐ 0
      - paragraph: 論理的な英文構成と高度な表現力をテストします
      - text: quiz writing writing 中級 👁️ 4 閲覧 ⏱️ 30分
    - link "TOEIC Part 5 練習クイズ ⭐ 0 TOEIC Part 5形式の文法問題で実力をチェックします quiz test-prep test-prep 初級 👁️ 8 閲覧 ⏱️ 30分":
      - /url: /materials/4a0b6eaf-d43c-47ca-8d4f-bbf02f55ee46
      - heading "TOEIC Part 5 練習クイズ" [level=3]
      - text: ⭐ 0
      - paragraph: TOEIC Part 5形式の文法問題で実力をチェックします
      - text: quiz test-prep test-prep 初級 👁️ 8 閲覧 ⏱️ 30分
    - link "リスニング理解度クイズ ⭐ 0 英語リスニングの基本的な理解力をチェックします quiz listening listening 初級 👁️ 0 閲覧 ⏱️ 30分":
      - /url: /materials/3f9fdbfc-b927-4cb9-9a4d-363e577c7efc
      - heading "リスニング理解度クイズ" [level=3]
      - text: ⭐ 0
      - paragraph: 英語リスニングの基本的な理解力をチェックします
      - text: quiz listening listening 初級 👁️ 0 閲覧 ⏱️ 30分
    - link "ビジネス英語語彙クイズ ⭐ 0 ビジネスシーンでよく使われる英単語の知識をテストします quiz vocabulary vocabulary 初級 👁️ 0 閲覧 ⏱️ 30分":
      - /url: /materials/e1ba4468-13f3-42aa-bdab-1b10bf463bf5
      - heading "ビジネス英語語彙クイズ" [level=3]
      - text: ⭐ 0
      - paragraph: ビジネスシーンでよく使われる英単語の知識をテストします
      - text: quiz vocabulary vocabulary 初級 👁️ 0 閲覧 ⏱️ 30分
    - link "基本英文法クイズ：時制編 ⭐ 0 英語の基本時制（現在・過去・未来）の理解度をチェックします quiz grammar grammar 初級 👁️ 0 閲覧 ⏱️ 30分":
      - /url: /materials/af255933-d4be-4325-9e1c-3cc51f9e16a4
      - heading "基本英文法クイズ：時制編" [level=3]
      - text: ⭐ 0
      - paragraph: 英語の基本時制（現在・過去・未来）の理解度をチェックします
      - text: quiz grammar grammar 初級 👁️ 0 閲覧 ⏱️ 30分
    - link "英語イディオム：ネイティブ表現100選 ⭐ 0 ネイティブスピーカーがよく使う慣用表現を学んで、より自然な英語を身につけます idioms native-expressions advanced vocabulary 中級 👁️ 0 閲覧 ⏱️ 30分":
      - /url: /materials/89c73697-a8e3-40f2-b26c-f050cc109d99
      - heading "英語イディオム：ネイティブ表現100選" [level=3]
      - text: ⭐ 0
      - paragraph: ネイティブスピーカーがよく使う慣用表現を学んで、より自然な英語を身につけます
      - text: idioms native-expressions advanced vocabulary 中級 👁️ 0 閲覧 ⏱️ 30分
    - link "ビジネス英語：国際会議での発言術 ⭐ 0 国際的なビジネス会議で効果的に発言するための高度な英語表現を学習します business meeting advanced business 中級 👁️ 0 閲覧 ⏱️ 30分":
      - /url: /materials/87ee98ed-b8e1-4dec-9179-8988c60ce9f4
      - heading "ビジネス英語：国際会議での発言術" [level=3]
      - text: ⭐ 0
      - paragraph: 国際的なビジネス会議で効果的に発言するための高度な英語表現を学習します
      - text: business meeting advanced business 中級 👁️ 0 閲覧 ⏱️ 30分
    - link "上級英作文：論理的な文章構成 ⭐ 0 説得力のある英語エッセイを書くための高度なライティングテクニックを学習します writing essay advanced writing 中級 👁️ 0 閲覧 ⏱️ 30分":
      - /url: /materials/bc6a6eb8-de90-4187-9222-8e3e818df433
      - heading "上級英作文：論理的な文章構成" [level=3]
      - text: ⭐ 0
      - paragraph: 説得力のある英語エッセイを書くための高度なライティングテクニックを学習します
      - text: writing essay advanced writing 中級 👁️ 0 閲覧 ⏱️ 30分
    - link "TOEIC対策：Part 5 文法問題攻略 ⭐ 0 TOEIC Part 5の文法問題を効率的に解くためのテクニックを学習します toeic grammar test-prep test-prep 初級 👁️ 0 閲覧 ⏱️ 30分":
      - /url: /materials/14c319d7-8a1a-4353-8648-c21c7ead04bd
      - heading "TOEIC対策：Part 5 文法問題攻略" [level=3]
      - text: ⭐ 0
      - paragraph: TOEIC Part 5の文法問題を効率的に解くためのテクニックを学習します
      - text: toeic grammar test-prep test-prep 初級 👁️ 0 閲覧 ⏱️ 30分
    - link "リーディング：英字新聞で学ぶ時事英語 ⭐ 0 英字新聞の記事を通じて時事英語と読解力を向上させます reading news current-events reading 初級 👁️ 2 閲覧 ⏱️ 30分":
      - /url: /materials/5c33ab99-f18e-4c0b-903a-5e7586850de0
      - heading "リーディング：英字新聞で学ぶ時事英語" [level=3]
      - text: ⭐ 0
      - paragraph: 英字新聞の記事を通じて時事英語と読解力を向上させます
      - text: reading news current-events reading 初級 👁️ 2 閲覧 ⏱️ 30分
    - link "スピーキング練習：プレゼンテーション基礎 ⭐ 0 効果的なプレゼンテーションのための英語表現とテクニックを学習します speaking presentation business speaking 初級 👁️ 2 閲覧 ⏱️ 30分":
      - /url: /materials/8a5d2134-27e7-4863-898e-bd3f49accbbd
      - heading "スピーキング練習：プレゼンテーション基礎" [level=3]
      - text: ⭐ 0
      - paragraph: 効果的なプレゼンテーションのための英語表現とテクニックを学習します
      - text: speaking presentation business speaking 初級 👁️ 2 閲覧 ⏱️ 30分
    - link "リスニング練習：TED Talksで学ぶギバー精神 ⭐ 0 TED Talksの音声を使って、ギバー精神に関する英語リスニング力を向上させます listening ted giver listening 初級 👁️ 0 閲覧 ⏱️ 30分":
      - /url: /materials/d3da4369-c8a4-4301-b13d-3aec67c5e04e
      - heading "リスニング練習：TED Talksで学ぶギバー精神" [level=3]
      - text: ⭐ 0
      - paragraph: TED Talksの音声を使って、ギバー精神に関する英語リスニング力を向上させます
      - text: listening ted giver listening 初級 👁️ 0 閲覧 ⏱️ 30分
    - link "語彙力強化：ビジネス英語基本単語100 ⭐ 0 ビジネスシーンで頻出する重要単語100個をマスターします vocabulary business intermediate vocabulary 初級 👁️ 1 閲覧 ⏱️ 30分":
      - /url: /materials/874f9e4f-2801-48f3-97ec-0dcadd5a6050
      - heading "語彙力強化：ビジネス英語基本単語100" [level=3]
      - text: ⭐ 0
      - paragraph: ビジネスシーンで頻出する重要単語100個をマスターします
      - text: vocabulary business intermediate vocabulary 初級 👁️ 1 閲覧 ⏱️ 30分
    - link "英文法：助動詞の使い分け ⭐ 0 can, could, may, mightなどの助動詞を正しく使い分ける方法を学習します grammar modals intermediate grammar 初級 👁️ 1 閲覧 ⏱️ 30分":
      - /url: /materials/48b55ad9-2b9c-4fb9-8af6-e2c260f33f18
      - heading "英文法：助動詞の使い分け" [level=3]
      - text: ⭐ 0
      - paragraph: can, could, may, mightなどの助動詞を正しく使い分ける方法を学習します
      - text: grammar modals intermediate grammar 初級 👁️ 1 閲覧 ⏱️ 30分
    - link "日常英会話：ギバーのための基本フレーズ ⭐ 0 他者を助ける際に使える基本的な英語フレーズを学びます giver conversation helping conversation 初級 👁️ 1 閲覧 ⏱️ 30分":
      - /url: /materials/80d45d56-bdf6-4c80-ba80-b5cc29fe091b
      - heading "日常英会話：ギバーのための基本フレーズ" [level=3]
      - text: ⭐ 0
      - paragraph: 他者を助ける際に使える基本的な英語フレーズを学びます
      - text: giver conversation helping conversation 初級 👁️ 1 閲覧 ⏱️ 30分
    - link "英語発音のコツとトレーニング ⭐ 0 ネイティブのような発音を身につけるための実践的なトレーニング方法 発音 スピーキング リスニング 発音・スピーキング 中級 👁️ 1 閲覧 ⏱️ 30分":
      - /url: /materials/7c3ff70c-010c-4fd4-942f-aa4c9e1ad81a
      - heading "英語発音のコツとトレーニング" [level=3]
      - text: ⭐ 0
      - paragraph: ネイティブのような発音を身につけるための実践的なトレーニング方法
      - text: 発音 スピーキング リスニング 発音・スピーキング 中級 👁️ 1 閲覧 ⏱️ 30分
    - link "日常英会話マスター ⭐ 0 日常生活で役立つ実践的な英会話表現とシチュエーション別のフレーズ集 日常会話 旅行 レストラン 日常会話 初級 👁️ 1 閲覧 ⏱️ 30分":
      - /url: /materials/20b23942-ee89-48a4-b5d6-c20dfdaf13a5
      - heading "日常英会話マスター" [level=3]
      - text: ⭐ 0
      - paragraph: 日常生活で役立つ実践的な英会話表現とシチュエーション別のフレーズ集
      - text: 日常会話 旅行 レストラン 日常会話 初級 👁️ 1 閲覧 ⏱️ 30分
    - link "ビジネス英語の基礎 ⭐ 0 ビジネスシーンで使える基本的な英語表現とコミュニケーション戦略を学びます ビジネス英語 自己紹介 メール ビジネス英語 初級 👁️ 1 閲覧 ⏱️ 30分":
      - /url: /materials/bf781f35-9ac1-4317-af57-d20be62f17f1
      - heading "ビジネス英語の基礎" [level=3]
      - text: ⭐ 0
      - paragraph: ビジネスシーンで使える基本的な英語表現とコミュニケーション戦略を学びます
      - text: ビジネス英語 自己紹介 メール ビジネス英語 初級 👁️ 1 閲覧 ⏱️ 30分
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
      |                                       ^ Error: 教材グリッドが表示されていません
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
# Test info

- Name: ページ遷移テスト >> ナビゲーションメニューからの遷移
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/page-navigation.e2e.test.ts:96:7

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('nav').locator('text=ギバー診断')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/page-navigation.e2e.test.ts:107:18
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
  - text: 🎓 教えて学べる英語学習プラットフォーム
  - heading "教えて学ぶ 英語学習コミュニティ" [level=1]
  - paragraph: ShiftWithでは「人に教えることで自分も学ぶ」という 科学的に証明された学習方法で英語力を向上させます。 まずはあなたの学習タイプを診断してみましょう！
  - link "学習タイプ診断を始める":
    - /url: /quiz
    - button "学習タイプ診断を始める":
      - text: 学習タイプ診断を始める
      - img
  - link "英語教材を見る":
    - /url: /explore
    - button "英語教材を見る":
      - img
      - text: 英語教材を見る
  - text: 学習タイプ診断で最適な学習方法を発見
  - region:
    - img
    - heading "あなたの学習タイプは？" [level=3]
    - paragraph: 科学的根拠に基づく診断で、最適な学習方法を発見
    - paragraph: 教える型
    - paragraph: 交流型
    - paragraph: 学習型
    - img
    - heading "診断でわかること" [level=3]
    - list:
      - listitem:
        - img
        - text: あなたの学習スタイルと最適な教材
      - listitem:
        - img
        - text: 効果的な貢献方法とコミュニティでの役割
      - listitem:
        - img
        - text: 学習スコア向上のための具体的アドバイス
    - link "今すぐ診断を始める":
      - /url: /quiz
      - button "今すぐ診断を始める":
        - text: 今すぐ診断を始める
        - img
  - region "なぜ「教えること」が最強の英語学習法なのか":
    - heading "なぜ「教えること」が最強の英語学習法なのか" [level=2]
    - paragraph: 科学的研究で証明された「教えて学ぶ効果」。人に教えることで、あなたの英語力が飛躍的に向上します。
    - img
    - heading "記憶定着率が90%向上" [level=3]
    - paragraph: 他人に教えることで、自分の知識が整理され、記憶に深く刻まれます。
    - list:
      - listitem:
        - img
        - text: 教材作成で知識を体系化
      - listitem:
        - img
        - text: 説明することで理解が深まる
    - img
    - heading "学習コミュニティの力" [level=3]
    - paragraph: お互いに教え合うことで、モチベーションが維持され、継続率が大幅に向上します。
    - list:
      - listitem:
        - img
        - text: 仲間からの感謝でモチベーション向上
      - listitem:
        - img
        - text: 多様な視点から学びを深める
    - img
    - heading "スコアで成長実感" [level=3]
    - paragraph: あなたの学習貢献度を可視化。教える行動が評価され、成長を実感できます。
    - list:
      - listitem:
        - img
        - text: 貢献度をリアルタイムで確認
      - listitem:
        - img
        - text: バッジとポイントで達成感
  - region:
    - heading "あなたはどの学習タイプ？" [level=2]
    - paragraph: 科学的研究に基づく3つのタイプ。あなたの学習スタイルを診断し、最適な英語学習方法を見つけましょう。
    - img
    - heading "教える型（Giver）" [level=3]
    - paragraph: 積極的に知識を共有し、他の学習者の成長を支援するタイプ
    - list:
      - listitem:
        - img
        - text: 教材作成でコミュニティに貢献
      - listitem:
        - img
        - text: フィードバック提供で他者を支援
      - listitem:
        - img
        - text: 「教える喜び」でモチベーション維持
    - img
    - heading "交流型（Matcher）" [level=3]
    - paragraph: 教えることと学ぶことのバランスを重視するタイプ
    - list:
      - listitem:
        - img
        - text: 公平な知識交換を好む
      - listitem:
        - img
        - text: 互恵的な学習関係を築く
      - listitem:
        - img
        - text: コミュニティの調和を大切にする
    - img
    - heading "学習型（Taker）" [level=3]
    - paragraph: まずは学ぶことから始めて、徐々に教える側へ成長するタイプ
    - list:
      - listitem:
        - img
        - text: まずは質の高い教材で学習
      - listitem:
        - img
        - text: コメントやレビューで貢献開始
      - listitem:
        - img
        - text: 段階的に教える行動を習得
  - region:
    - heading "今すぐShiftWithコミュニティに参加" [level=2]
    - paragraph: あなたの学習タイプを発見し、「教えて学ぶ」新しい英語学習体験を始めましょう！
    - link "学習タイプ診断でコミュニティ参加":
      - /url: /quiz
      - button "学習タイプ診断でコミュニティ参加":
        - text: 学習タイプ診断でコミュニティ参加
        - img
    - link "英語教材をのぞいてみる":
      - /url: /explore
      - button "英語教材をのぞいてみる":
        - img
        - text: 英語教材をのぞいてみる
  - link "ShiftWith":
    - /url: /
  - paragraph: 教えることで学べるオンライン学習プラットフォーム
  - paragraph: © 2024 ShiftWith. All rights reserved.
- alert
```

# Test source

```ts
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
   80 |           `${description}が表示されていません`).toBeVisible();
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
> 107 |       await page.click(`nav >> text=${text}`);
      |                  ^ Error: page.click: Test timeout of 30000ms exceeded.
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
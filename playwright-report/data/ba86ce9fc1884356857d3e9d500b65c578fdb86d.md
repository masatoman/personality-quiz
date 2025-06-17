# Test info

- Name: 教材作成機能（改善版） >> 新しい2ステップフローで教材を作成・投稿する
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/material-creation.e2e.test.ts:119:7

# Error details

```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="教材のタイトルを入力"]')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/material-creation.e2e.test.ts:128:16
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
    - text: 🎨
    - heading "初回教材作成へようこそ！" [level=2]
    - paragraph: 「教えることで学ぶ」体験を一緒に始めましょう
    - text: "1"
    - heading "教材の基本情報を入力" [level=3]
    - paragraph: タイトル、説明、カテゴリを設定します
    - text: "2"
    - heading "コンテンツセクションを追加" [level=3]
    - paragraph: テキスト、画像、動画、クイズなど様々な形式で作成
    - text: "3"
    - heading "プレビューして公開" [level=3]
    - paragraph: 内容を確認してコミュニティと共有しましょう
    - heading "💡 初回のコツ" [level=4]
    - list:
      - listitem: • 簡単なトピックから始めてみましょう
      - listitem: • 自分が理解していることを説明してみてください
      - listitem: • 1-2個のセクションからスタートでも十分です
    - button "始めましょう！"
    - button "後で"
    - button "←"
    - heading "教材作成 (改善版)" [level=1]
    - text: ステップ 1/2
    - button "👁️ プレビュー"
    - button "公開設定へ" [disabled]
    - text: 教材タイトル *
    - 'textbox "例: 英語の基本文法マスター講座"'
    - text: 0/100文字
    - heading "コンテンツを追加" [level=3]
    - text: 0セクション
    - button "📝 テキスト 文章・説明を追加"
    - button "❓ クイズ 選択式問題を追加"
    - text: ✨
    - heading "プレミアム機能" [level=4]
    - paragraph: 有料プランでは画像・動画・音声ファイルの追加も可能になります
    - text: 🖼️ 画像 🎥 動画 🎵 音声
    - heading "基本設定" [level=3]
    - text: カテゴリ
    - combobox:
      - option "一般" [selected]
      - option "文法"
      - option "語彙"
      - option "リスニング"
      - option "リーディング"
      - option "ライティング"
      - option "スピーキング"
    - text: 難易度
    - combobox:
      - option "初心者" [selected]
      - option "中級者"
      - option "上級者"
    - text: 推定学習時間 約3分 自動計算
    - checkbox "公開する" [checked]
    - text: 公開する
    - checkbox "コメントを許可" [checked]
    - text: コメントを許可
- alert
```

# Test source

```ts
   28 |           questions: [
   29 |             {
   30 |               question: '困っている同僚に丁寧に支援を申し出る適切な表現は？',
   31 |               options: [
   32 |                 'What do you want?',
   33 |                 'Is there anything I can do for you?',
   34 |                 'You look confused.',
   35 |                 'Figure it out yourself.'
   36 |               ],
   37 |               correct_answer: 1,
   38 |               explanation: '「Is there anything I can do for you?」が最も丁寧で適切な支援の申し出です。'
   39 |             }
   40 |           ]
   41 |         }
   42 |       ],
   43 |       conclusion: 'ギバー精神を持って英語でコミュニケーションすることで、相手との良好な関係を築き、同時に自分の英語力も向上させることができます。'
   44 |     }
   45 |   },
   46 |   {
   47 |     title: 'ビジネス英語：Win-Win関係を築く表現術',
   48 |     description: 'ビジネスシーンで互恵的な関係を構築する英語コミュニケーション技術',
   49 |     category: 'ビジネス英語',
   50 |     tags: ['ビジネス', 'ネゴシエーション', 'Win-Win', '交渉', '中級'],
   51 |     difficulty: 'intermediate',
   52 |     content: {
   53 |       introduction: 'ビジネスの世界では、一方的な関係ではなく、双方が利益を得られる「Win-Win」の関係構築が成功の鍵です。この教材では、ビジネス英語を通じて相互利益を生み出すコミュニケーション技術を学びます。',
   54 |       sections: [
   55 |         {
   56 |           type: 'text',
   57 |           title: '第1章：会議での協力的な表現',
   58 |           content: '会議で相手の意見を求め、協力的な雰囲気を作る表現を学びます。',
   59 |           examples: [
   60 |             { phrase: 'What are your thoughts on this?', japanese: 'これについてどう思われますか？', purpose: '相手の意見を尊重する' },
   61 |             { phrase: 'I\'d like to hear your perspective.', japanese: 'あなたの視点をお聞かせください。', purpose: '多角的な意見を求める' },
   62 |             { phrase: 'How would this benefit your team?', japanese: 'これはあなたのチームにどのような利益をもたらしますか？', purpose: '相手の利益を考慮する' },
   63 |             { phrase: 'Let\'s explore this together.', japanese: '一緒に検討してみましょう。', purpose: '協力的な姿勢を示す' }
   64 |           ]
   65 |         }
   66 |       ],
   67 |       practical_tips: [
   68 |         '常に相手の立場を考慮する',
   69 |         '批判ではなく、建設的な提案をする',
   70 |         '長期的な関係性を重視する',
   71 |         '感情的にならず、事実に基づいて話す',
   72 |         '複数の選択肢を用意する'
   73 |       ],
   74 |       conclusion: '互恵的な関係を築くビジネス英語は、単なる言語スキル以上の価値を提供します。相手の立場を理解し、共通の利益を見つけ、長期的な成功を目指すコミュニケーションを実践しましょう。'
   75 |     }
   76 |   }
   77 | ];
   78 |
   79 | test.describe('教材作成機能（改善版）', () => {
   80 |   test.setTimeout(60000); // タイムアウトを60秒に延長
   81 |
   82 |   test.beforeEach(async ({ page }) => {
   83 |     // テスト用ユーザーでログイン
   84 |     await page.goto('/auth/login');
   85 |     
   86 |     // テスト用ギバーユーザーボタンをクリック（開発環境で利用可能）
   87 |     try {
   88 |       // Giverユーザーボタンが表示されている場合クリック
   89 |       const giverButton = page.locator('button:has-text("Giver")').first();
   90 |       if (await giverButton.isVisible({ timeout: 5000 })) {
   91 |         await giverButton.click();
   92 |         await page.click('button[type="submit"]');
   93 |         await page.waitForURL(/dashboard|materials/, { timeout: 10000 });
   94 |         return;
   95 |       }
   96 |     } catch (e) {
   97 |       console.log('テスト用ボタンが見つからないため、手動ログインを試行します');
   98 |     }
   99 |
  100 |     // 手動でテストユーザー情報を入力
  101 |     await page.fill('input[name="email"]', 'giver@example.com');
  102 |     await page.fill('input[name="password"]', 'password123');
  103 |     await page.click('button[type="submit"]');
  104 |     
  105 |     // ログイン成功を待機
  106 |     try {
  107 |       await page.waitForURL(/dashboard|materials/, { timeout: 15000 });
  108 |     } catch (e) {
  109 |       // ダッシュボードページにリダイレクトされない場合、ホームページを確認
  110 |       await page.waitForLoadState('networkidle');
  111 |       const currentUrl = page.url();
  112 |       if (!currentUrl.includes('dashboard') && !currentUrl.includes('materials')) {
  113 |         // 直接ダッシュボードまたは教材ページに移動
  114 |         await page.goto('/dashboard');
  115 |       }
  116 |     }
  117 |   });
  118 |
  119 |   test('新しい2ステップフローで教材を作成・投稿する', async ({ page }) => {
  120 |     // 教材作成ページへ移動
  121 |     await page.goto('/create');
  122 |     await page.waitForLoadState('networkidle');
  123 |     
  124 |     // ページタイトルを確認
  125 |     await expect(page.locator('h1')).toContainText('教材作成');
  126 |
  127 |     // ステップ1: 基本情報入力
> 128 |     await page.fill('input[placeholder="教材のタイトルを入力"]', 'E2Eテスト教材');
      |                ^ Error: page.fill: Test timeout of 60000ms exceeded.
  129 |     await page.fill('textarea[placeholder="教材の説明を入力"]', 'これはE2Eテスト用の教材です');
  130 |     
  131 |     // カテゴリを選択
  132 |     await page.selectOption('select', 'grammar');
  133 |     
  134 |     // テキストセクションを追加
  135 |     await page.click('button:has-text("テキスト")');
  136 |     
  137 |     // セクションが追加されるまで待機
  138 |     await page.waitForSelector('.bg-white.rounded-lg.border', { timeout: 5000 });
  139 |     
  140 |     // セクションを編集
  141 |     await page.click('button:has-text("編集")');
  142 |     await page.fill('input[placeholder="セクションタイトル"]', 'テストセクション');
  143 |     await page.fill('textarea[placeholder="テキストを入力してください..."]', 'これはテスト用のテキスト内容です。');
  144 |
  145 |     // クイズセクションも追加
  146 |     await page.click('button:has-text("クイズ")');
  147 |     
  148 |     // 2番目のセクションを編集
  149 |     const editButtons = page.locator('button:has-text("編集")');
  150 |     await editButtons.nth(1).click();
  151 |     await page.fill('input[placeholder="問題文を入力してください"]', 'テスト問題：次のうち正しいのは？');
  152 |     
  153 |     // ステップ2: 公開設定へ移動
  154 |     await page.click('button:has-text("公開設定へ")');
  155 |     
  156 |     // 公開ステップでの最終確認
  157 |     await page.waitForSelector('text=公開設定', { timeout: 5000 });
  158 |     
  159 |     // 公開する
  160 |     await page.click('button:has-text("公開する")');
  161 |     
  162 |     // 成功を確認（リダイレクトまたは成功メッセージ）
  163 |     await page.waitForFunction(() => {
  164 |       return window.location.pathname === '/my-materials' || 
  165 |              document.querySelector('text=教材が正常に公開されました');
  166 |     }, { timeout: 15000 });
  167 |     
  168 |     console.log('教材作成が完了しました');
  169 |   });
  170 |
  171 |   test('教材一覧で投稿した教材を確認する', async ({ page }) => {
  172 |     // 教材一覧ページへ移動
  173 |     await page.goto('/my-materials');
  174 |     
  175 |     // ページが読み込まれるまで待機
  176 |     await page.waitForLoadState('networkidle');
  177 |     
  178 |     // 教材一覧のタイトルが表示されることを確認
  179 |     await expect(page.locator('h1').first()).toBeVisible();
  180 |     
  181 |     // 何らかの教材コンテンツが表示されることを確認
  182 |     const materialCards = page.locator('[data-testid="material-card"], .material-card, article, .bg-white.rounded-lg.border');
  183 |     
  184 |     // 3秒待ってから要素数をチェック
  185 |     await page.waitForTimeout(3000);
  186 |     const hasCards = await materialCards.count();
  187 |     
  188 |     if (hasCards > 0) {
  189 |       console.log(`${hasCards}件の教材が見つかりました`);
  190 |     } else {
  191 |       console.log('教材が見つかりませんでした - これはエラーの可能性があります');
  192 |       
  193 |       // ページ内容をデバッグ出力
  194 |       const pageContent = await page.content();
  195 |       console.log('ページ内容:', pageContent.substring(0, 500));
  196 |     }
  197 |   });
  198 |
  199 |   test('公開した教材がexploreページでも表示される', async ({ page }) => {
  200 |     // 探索ページへ移動
  201 |     await page.goto('/explore');
  202 |     
  203 |     // ページが読み込まれるまで待機
  204 |     await page.waitForLoadState('networkidle');
  205 |     
  206 |     // 探索ページのタイトルが表示されることを確認
  207 |     await expect(page.locator('h1').first()).toBeVisible();
  208 |     
  209 |     // 何らかの教材コンテンツが表示されることを確認
  210 |     const materialCards = page.locator('[data-testid="material-card"], .material-card, article, .bg-white.rounded-lg.border');
  211 |     
  212 |     // 3秒待ってから要素数をチェック
  213 |     await page.waitForTimeout(3000);
  214 |     const hasCards = await materialCards.count();
  215 |     
  216 |     console.log(`探索ページで${hasCards}件の教材が見つかりました`);
  217 |   });
  218 | }); 
```
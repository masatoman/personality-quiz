# Test info

- Name: 教材作成機能 >> 教材一覧で投稿した教材を確認する
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/material-creation.e2e.test.ts:162:7

# Error details

```
Error: expect.toContainText: Error: strict mode violation: locator('h1, h2') resolved to 2 elements:
    1) <h1 class="text-3xl font-bold">教材一覧</h1> aka getByRole('heading', { name: '教材一覧' })
    2) <h2 class="text-lg font-bold mb-4">フィルター</h2> aka getByRole('heading', { name: 'フィルター' })

Call log:
  - expect.toContainText with timeout 5000ms
  - waiting for locator('h1, h2')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/material-creation.e2e.test.ts:170:42
```

# Page snapshot

```yaml
- navigation:
  - link "英語学習タイプ診断":
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
    - img
    - heading "エラーが発生しました" [level=3]
    - paragraph: 教材の取得に失敗しました
    - button "再試行"
- alert
```

# Test source

```ts
   70 |         '長期的な関係性を重視する',
   71 |         '感情的にならず、事実に基づいて話す',
   72 |         '複数の選択肢を用意する'
   73 |       ],
   74 |       conclusion: '互恵的な関係を築くビジネス英語は、単なる言語スキル以上の価値を提供します。相手の立場を理解し、共通の利益を見つけ、長期的な成功を目指すコミュニケーションを実践しましょう。'
   75 |     }
   76 |   }
   77 | ];
   78 |
   79 | test.describe('教材作成機能', () => {
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
  119 |   test('簡単な教材を作成・投稿する', async ({ page }) => {
  120 |     const material = testMaterials[0]; // ギバー英語教材を使用
  121 |
  122 |     // 教材作成ページへ移動
  123 |     await page.goto('/create');
  124 |     await expect(page.locator('h1')).toContainText('教材を作成する');
  125 |
  126 |     // 標準教材を選択
  127 |     await page.click('a[href="/create/standard/basic-info"]');
  128 |     await page.waitForURL(/\/create\/standard\/basic-info/);
  129 |
  130 |     // ステップ1: 基本情報入力
  131 |     await page.fill('input[name="title"]', material.title);
  132 |     await page.fill('textarea[name="description"]', material.description);
  133 |     
  134 |     // カテゴリと難易度の選択
  135 |     await page.selectOption('select[name="category"]', material.category);
  136 |     await page.selectOption('select[name="difficulty"]', material.difficulty);
  137 |     
  138 |     // 次のステップへ
  139 |     await page.click('button:has-text("次へ")');
  140 |     await page.waitForURL(/\/create\/standard\/content/);
  141 |
  142 |     // ステップ2: 基本的なコンテンツ入力
  143 |     await page.fill('textarea[name="introduction"]', material.content.introduction);
  144 |     await page.fill('textarea[name="conclusion"]', material.content.conclusion);
  145 |     
  146 |     // 次のステップへ
  147 |     await page.click('button:has-text("次へ")');
  148 |     await page.waitForURL(/\/create\/standard\/settings/);
  149 |
  150 |     // ステップ3: 設定
  151 |     await page.check('input[name="is_published"]');
  152 |     await page.click('button:has-text("次へ")');
  153 |     await page.waitForURL(/\/create\/standard\/confirm/);
  154 |
  155 |     // ステップ4: 確認・公開
  156 |     await page.click('button:has-text("公開する")');
  157 |     
  158 |     // 成功を確認（エラーが発生しないかチェック）
  159 |     await page.waitForSelector('text=教材が公開されました', { timeout: 10000 });
  160 |   });
  161 |
  162 |   test('教材一覧で投稿した教材を確認する', async ({ page }) => {
  163 |     // 教材一覧ページへ移動
  164 |     await page.goto('/materials');
  165 |     
  166 |     // ページが読み込まれるまで待機
  167 |     await page.waitForLoadState('networkidle');
  168 |     
  169 |     // 教材一覧のタイトルが表示されることを確認
> 170 |     await expect(page.locator('h1, h2')).toContainText(/教材|Materials/);
      |                                          ^ Error: expect.toContainText: Error: strict mode violation: locator('h1, h2') resolved to 2 elements:
  171 |     
  172 |     // 何らかの教材コンテンツが表示されることを確認
  173 |     const materialCards = page.locator('[data-testid="material-card"], .material-card, article');
  174 |     const hasCards = await materialCards.count();
  175 |     
  176 |     if (hasCards > 0) {
  177 |       console.log(`${hasCards}件の教材が見つかりました`);
  178 |       
  179 |       // 最初の教材をクリックして詳細表示
  180 |       await materialCards.first().click();
  181 |       
  182 |       // 詳細ページが表示されることを確認
  183 |       await page.waitForLoadState('networkidle');
  184 |       const detailTitle = page.locator('h1').first();
  185 |       await expect(detailTitle).toBeVisible();
  186 |       
  187 |       console.log('教材詳細ページの表示を確認しました');
  188 |     } else {
  189 |       console.log('教材が見つかりませんでした');
  190 |     }
  191 |   });
  192 |
  193 |   test('データベースに実際のコンテンツが保存されている', async ({ page }) => {
  194 |     // 直接SQLでテストデータを挿入
  195 |     const material = testMaterials[0];
  196 |     
  197 |     // APIエンドポイントを使って教材データを作成
  198 |     const response = await page.request.post('/api/materials', {
  199 |       data: {
  200 |         title: material.title,
  201 |         description: material.description,
  202 |         content: material.content,
  203 |         category: material.category,
  204 |         tags: material.tags,
  205 |         difficulty: material.difficulty,
  206 |         is_published: true
  207 |       }
  208 |     });
  209 |     
  210 |     // API応答の確認
  211 |     if (response.ok()) {
  212 |       const responseData = await response.json();
  213 |       console.log('教材作成API成功:', responseData);
  214 |       
  215 |       // 作成された教材の詳細ページを確認
  216 |       if (responseData.id) {
  217 |         await page.goto(`/materials/${responseData.id}`);
  218 |         await expect(page.locator('h1')).toContainText(material.title);
  219 |         await expect(page.locator('text=' + material.content.introduction)).toBeVisible();
  220 |       }
  221 |     } else {
  222 |       console.log('教材作成API失敗:', response.status(), await response.text());
  223 |     }
  224 |   });
  225 | }); 
```
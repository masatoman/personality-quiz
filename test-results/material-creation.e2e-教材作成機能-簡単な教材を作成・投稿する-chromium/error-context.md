# Test info

- Name: 教材作成機能 >> 簡単な教材を作成・投稿する
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/material-creation.e2e.test.ts:119:7

# Error details

```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[name="title"]')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/material-creation.e2e.test.ts:131:16
```

# Test source

```ts
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
> 131 |     await page.fill('input[name="title"]', material.title);
      |                ^ Error: page.fill: Test timeout of 60000ms exceeded.
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
  169 |     // 教材一覧のタイトルが表示されることを確認（最初のh1タグを指定）
  170 |     await expect(page.locator('h1').first()).toContainText(/教材|Materials/);
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
  200 |         basicInfo: {
  201 |           title: material.title,
  202 |           description: material.description,
  203 |           category: material.category,
  204 |           tags: material.tags,
  205 |           difficulty: material.difficulty
  206 |         },
  207 |         contentSections: [
  208 |           {
  209 |             type: 'text',
  210 |             title: '導入',
  211 |             content: material.content.introduction
  212 |           }
  213 |         ],
  214 |         settings: {
  215 |           is_published: true,
  216 |           target_level: material.difficulty
  217 |         }
  218 |       }
  219 |     });
  220 |     
  221 |     // API応答の確認
  222 |     if (response.ok()) {
  223 |       const responseData = await response.json();
  224 |       console.log('教材作成API成功:', responseData);
  225 |       
  226 |       // 作成された教材の詳細ページを確認
  227 |       if (responseData.id || responseData.data?.id) {
  228 |         const materialId = responseData.id || responseData.data.id;
  229 |         await page.goto(`/materials/${materialId}`);
  230 |         await expect(page.locator('h1')).toContainText(material.title);
  231 |         await expect(page.locator('text=' + material.content.introduction)).toBeVisible();
```
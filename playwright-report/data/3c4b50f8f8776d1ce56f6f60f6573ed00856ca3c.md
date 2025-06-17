# Test info

- Name: ShiftWith MVP リリース準備テスト >> ポイントシステムとギバー報酬の正確性
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/release-readiness.e2e.test.ts:136:7

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="email-input"]')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/release-readiness.e2e.test.ts:139:16
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
  - heading "アカウントにログイン" [level=2]
  - paragraph:
    - text: または
    - link "新規アカウント登録":
      - /url: /auth/signup
  - text: メールアドレス
  - img
  - textbox "メールアドレス"
  - text: パスワード
  - img
  - textbox "パスワード"
  - checkbox "ログイン状態を保持する"
  - text: ログイン状態を保持
  - link "パスワードをリセットする":
    - /url: /auth/reset-password
    - text: パスワードをお忘れですか？
  - button "メールアドレスとパスワードでログイン": ログイン
  - text: またはソーシャルログイン
  - button "Googleアカウントでログイン":
    - img
    - text: Google
  - button "GitHubアカウントでログイン":
    - img
    - text: GitHub
- alert
```

# Test source

```ts
   39 |     await page.fill('[data-testid="confirm-password-input"]', 'Test123!@#');
   40 |     await page.click('[data-testid="signup-submit"]');
   41 |     
   42 |     // Step 4: ギバー診断テスト開始
   43 |     await expect(page).toHaveURL(/\/quiz/);
   44 |     await expect(page.locator('h2')).toContainText('ギバー診断');
   45 |     
   46 |     // Step 5: 診断テスト完了（15問すべて回答）
   47 |     for (let questionIndex = 0; questionIndex < 15; questionIndex++) {
   48 |       // 質問が表示されるまで待機
   49 |       await page.waitForSelector('[data-testid="question-text"]');
   50 |       
   51 |       // 最初の選択肢を選択（実際のテストでは様々な選択肢を選ぶべき）
   52 |       await page.click('[data-testid="option-0"]');
   53 |       
   54 |       // 最後の質問でなければ「次へ」ボタンをクリック
   55 |       if (questionIndex < 14) {
   56 |         await page.click('[data-testid="next-question"]');
   57 |       }
   58 |     }
   59 |     
   60 |     // Step 6: テスト完了・結果表示
   61 |     await page.click('[data-testid="complete-test"]');
   62 |     await expect(page).toHaveURL(/\/quiz\/results/);
   63 |     
   64 |     // Step 7: 診断結果と初回ポイント獲得確認
   65 |     await expect(page.locator('[data-testid="giver-type"]')).toBeVisible();
   66 |     await expect(page.locator('[data-testid="points-earned"]')).toContainText('20');
   67 |     
   68 |     // Step 8: ダッシュボード遷移
   69 |     await page.click('[data-testid="go-to-dashboard"]');
   70 |     await expect(page).toHaveURL('/dashboard');
   71 |     
   72 |     // Step 9: ダッシュボード初期表示確認
   73 |     await expect(page.locator('[data-testid="total-points"]')).toContainText('20');
   74 |     await expect(page.locator('[data-testid="giver-score"]')).toBeVisible();
   75 |     
   76 |     console.log(`✅ 新規ユーザーオンボーディング完了: ${testEmail}`);
   77 |   });
   78 |
   79 |   /**
   80 |    * Critical Path 2: 教材作成から学習までの完全フロー
   81 |    */
   82 |   test('教材作成・公開・学習の包括的フロー', async ({ page }) => {
   83 |     // Step 1: テストユーザーでログイン
   84 |     await page.goto('/auth/login');
   85 |     await page.fill('[data-testid="email-input"]', 'test@example.com');
   86 |     await page.fill('[data-testid="password-input"]', 'password123');
   87 |     await page.click('[data-testid="login-submit"]');
   88 |     
   89 |     // Step 2: 教材作成ページ遷移
   90 |     await page.goto('/materials/create');
   91 |     await expect(page).toHaveURL('/materials/create');
   92 |     
   93 |     // Step 3: 基本情報入力
   94 |     const materialTitle = `リリーステスト教材_${Date.now()}`;
   95 |     await page.fill('[data-testid="title-input"]', materialTitle);
   96 |     await page.fill('[data-testid="description-input"]', 'リリース前テスト用教材です');
   97 |     await page.selectOption('[data-testid="category-select"]', '1');
   98 |     await page.selectOption('[data-testid="difficulty-select"]', '1');
   99 |     await page.click('[data-testid="next-step"]');
  100 |     
  101 |     // Step 4: コンテンツ作成
  102 |     await page.fill('[data-testid="content-editor"]', '# テスト教材\n\nリリース前のテスト用コンテンツです。');
  103 |     
  104 |     // セクション追加
  105 |     await page.click('[data-testid="add-section"]');
  106 |     await page.fill('[data-testid="section-title"]', 'テストセクション1');
  107 |     await page.fill('[data-testid="section-content"]', 'セクション1の内容です。');
  108 |     
  109 |     await page.click('[data-testid="next-step"]');
  110 |     
  111 |     // Step 5: 設定・確認
  112 |     await page.check('[data-testid="is-public"]');
  113 |     await page.click('[data-testid="next-step"]');
  114 |     
  115 |     // Step 6: 最終確認・公開
  116 |     await expect(page.locator('[data-testid="preview-title"]')).toContainText(materialTitle);
  117 |     await page.click('[data-testid="publish-material"]');
  118 |     
  119 |     // Step 7: 公開成功とポイント獲得確認
  120 |     await expect(page.locator('[data-testid="success-message"]')).toContainText('教材が公開されました');
  121 |     await expect(page.locator('[data-testid="points-earned"]')).toContainText('50');
  122 |     
  123 |     // Step 8: 教材一覧での確認
  124 |     await page.goto('/materials');
  125 |     await page.fill('[data-testid="search-input"]', materialTitle);
  126 |     await page.press('[data-testid="search-input"]', 'Enter');
  127 |     
  128 |     await expect(page.locator(`[data-testid="material-${materialTitle}"]`)).toBeVisible();
  129 |     
  130 |     console.log(`✅ 教材作成フロー完了: ${materialTitle}`);
  131 |   });
  132 |
  133 |   /**
  134 |    * Critical Path 3: ポイントシステムとギバー報酬
  135 |    */
  136 |   test('ポイントシステムとギバー報酬の正確性', async ({ page }) => {
  137 |     // Step 1: ログイン
  138 |     await page.goto('/auth/login');
> 139 |     await page.fill('[data-testid="email-input"]', 'test@example.com');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  140 |     await page.fill('[data-testid="password-input"]', 'password123');
  141 |     await page.click('[data-testid="login-submit"]');
  142 |     
  143 |     // Step 2: 初期ポイント確認
  144 |     await page.goto('/dashboard');
  145 |     const initialPointsText = await page.locator('[data-testid="total-points"]').textContent();
  146 |     const initialPoints = parseInt(initialPointsText?.match(/\d+/)?.[0] || '0');
  147 |     
  148 |     // Step 3: 他ユーザーの教材を学習
  149 |     await page.goto('/materials');
  150 |     await page.click('[data-testid="material-card"]:first-child');
  151 |     
  152 |     // 教材詳細ページで学習開始
  153 |     await page.click('[data-testid="start-learning"]');
  154 |     
  155 |     // セクションを順次完了
  156 |     const sections = await page.locator('[data-testid="section"]').count();
  157 |     for (let i = 0; i < sections; i++) {
  158 |       await page.click(`[data-testid="complete-section-${i}"]`);
  159 |       await page.waitForTimeout(500); // アニメーション待機
  160 |     }
  161 |     
  162 |     // Step 4: 学習完了とポイント獲得確認
  163 |     await page.click('[data-testid="complete-material"]');
  164 |     await expect(page.locator('[data-testid="completion-message"]')).toBeVisible();
  165 |     await expect(page.locator('[data-testid="points-earned"]')).toContainText('10');
  166 |     
  167 |     // Step 5: レビュー投稿
  168 |     await page.fill('[data-testid="review-text"]', 'とても良い教材でした！');
  169 |     await page.click('[data-testid="rating-5"]');
  170 |     await page.click('[data-testid="submit-review"]');
  171 |     
  172 |     await expect(page.locator('[data-testid="review-success"]')).toBeVisible();
  173 |     await expect(page.locator('[data-testid="points-earned"]')).toContainText('15');
  174 |     
  175 |     // Step 6: ポイント履歴確認
  176 |     await page.goto('/dashboard');
  177 |     const finalPointsText = await page.locator('[data-testid="total-points"]').textContent();
  178 |     const finalPoints = parseInt(finalPointsText?.match(/\d+/)?.[0] || '0');
  179 |     
  180 |     expect(finalPoints).toBe(initialPoints + 10 + 15); // 学習10P + レビュー15P
  181 |     
  182 |     // Step 7: ポイント履歴詳細確認
  183 |     await page.click('[data-testid="view-point-history"]');
  184 |     await expect(page.locator('[data-testid="point-history"]')).toBeVisible();
  185 |     
  186 |     console.log(`✅ ポイントシステム検証完了: ${initialPoints} → ${finalPoints}`);
  187 |   });
  188 |
  189 |   /**
  190 |    * Critical Path 4: エラー処理とフォールバック機能
  191 |    */
  192 |   test('エラー処理とシステム回復力', async ({ page }) => {
  193 |     // Step 1: 無効なURLアクセス
  194 |     await page.goto('/non-existent-page');
  195 |     await expect(page.locator('[data-testid="404-error"]')).toBeVisible();
  196 |     await expect(page.locator('[data-testid="back-to-home"]')).toBeVisible();
  197 |     
  198 |     // Step 2: 未認証でのアクセス制限
  199 |     await page.goto('/dashboard');
  200 |     await expect(page).toHaveURL(/\/auth\/login/);
  201 |     
  202 |     // Step 3: 不正なフォーム入力
  203 |     await page.fill('[data-testid="email-input"]', 'invalid-email');
  204 |     await page.fill('[data-testid="password-input"]', '123');
  205 |     await page.click('[data-testid="login-submit"]');
  206 |     
  207 |     await expect(page.locator('[data-testid="email-error"]')).toContainText('正しいメールアドレス');
  208 |     await expect(page.locator('[data-testid="password-error"]')).toContainText('パスワードは');
  209 |     
  210 |     // Step 4: ネットワークエラーシミュレーション（オプション）
  211 |     // await page.route('**/*', route => route.abort());
  212 |     // await page.reload();
  213 |     // await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
  214 |     
  215 |     console.log('✅ エラー処理機能検証完了');
  216 |   });
  217 |
  218 |   /**
  219 |    * Critical Path 5: ランキングシステム
  220 |    */
  221 |   test('週次ランキングシステムの正確性', async ({ page }) => {
  222 |     // Step 1: ランキングページアクセス
  223 |     await page.goto('/rankings');
  224 |     await expect(page).toHaveURL('/rankings');
  225 |     
  226 |     // Step 2: 週次ランキング表示確認
  227 |     await page.click('[data-testid="weekly-ranking"]');
  228 |     await expect(page.locator('[data-testid="ranking-list"]')).toBeVisible();
  229 |     
  230 |     // Step 3: ランキングデータの妥当性確認
  231 |     const rankings = await page.locator('[data-testid="ranking-item"]').count();
  232 |     expect(rankings).toBeGreaterThan(0);
  233 |     
  234 |     // Step 4: ユーザー情報とスコアの表示確認
  235 |     await expect(page.locator('[data-testid="user-rank-1"]')).toBeVisible();
  236 |     await expect(page.locator('[data-testid="user-score-1"]')).toBeVisible();
  237 |     
  238 |     // Step 5: 自分のランキング位置確認（認証ユーザーの場合）
  239 |     await page.goto('/auth/login');
```
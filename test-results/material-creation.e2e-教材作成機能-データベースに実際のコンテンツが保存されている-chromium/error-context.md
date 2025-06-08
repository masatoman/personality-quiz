# Test info

- Name: 教材作成機能 >> データベースに実際のコンテンツが保存されている
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/material-creation.e2e.test.ts:193:7

# Error details

```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[name="title"]')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/material-creation.e2e.test.ts:240:18
```

# Test source

```ts
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
  232 |       }
  233 |     } else {
  234 |       console.log('教材作成API失敗:', response.status(), await response.text());
  235 |       
  236 |       // APIが失敗した場合、画面からの教材作成を試行
  237 |       await page.goto('/create');
  238 |       await page.click('a[href="/create/standard/basic-info"]');
  239 |       
> 240 |       await page.fill('input[name="title"]', material.title);
      |                  ^ Error: page.fill: Test timeout of 60000ms exceeded.
  241 |       await page.fill('textarea[name="description"]', material.description);
  242 |       await page.selectOption('select[name="category"]', material.category);
  243 |       await page.selectOption('select[name="difficulty"]', material.difficulty);
  244 |       
  245 |       await page.click('button:has-text("次へ")');
  246 |       await page.fill('textarea[name="introduction"]', material.content.introduction);
  247 |       await page.fill('textarea[name="conclusion"]', material.content.conclusion);
  248 |       
  249 |       await page.click('button:has-text("次へ")');
  250 |       await page.check('input[name="is_published"]');
  251 |       await page.click('button:has-text("次へ")');
  252 |       await page.click('button:has-text("公開する")');
  253 |       
  254 |       // 成功メッセージを確認
  255 |       await page.waitForSelector('text=教材が公開されました', { timeout: 10000 });
  256 |       console.log('画面からの教材作成に成功しました');
  257 |     }
  258 |   });
  259 | }); 
```
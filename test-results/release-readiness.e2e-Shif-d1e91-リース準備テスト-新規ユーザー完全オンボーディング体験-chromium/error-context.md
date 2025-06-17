# Test info

- Name: ShiftWith MVP リリース準備テスト >> 新規ユーザー完全オンボーディング体験
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/release-readiness.e2e.test.ts:24:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)

Locator: locator('h1')
Expected string: "ShiftWith"
Received string: "教えて学ぶ英語学習コミュニティ"
Call log:
  - expect.toContainText with timeout 5000ms
  - waiting for locator('h1')
    9 × locator resolved to <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">…</h1>
      - unexpected value "教えて学ぶ英語学習コミュニティ"

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/release-readiness.e2e.test.ts:27:38
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
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | /**
   4 |  * ShiftWith MVP リリース準備E2Eテストスイート
   5 |  * 
   6 |  * このテストスイートは本番リリース前の最終確認として、
   7 |  * 以下の重要フローを包括的にテストします：
   8 |  * 
   9 |  * 1. 新規ユーザーオンボーディング
   10 |  * 2. 教材作成から学習までの完全フロー
   11 |  * 3. ポイントシステムとギバー報酬
   12 |  * 4. エラー処理とフォールバック
   13 |  */
   14 |
   15 | test.describe('ShiftWith MVP リリース準備テスト', () => {
   16 |   test.beforeEach(async ({ page }) => {
   17 |     // テストデータのクリーンアップ（必要に応じて）
   18 |     // await page.goto('/api/test/reset-database');
   19 |   });
   20 |
   21 |   /**
   22 |    * Critical Path 1: 新規ユーザーオンボーディングフロー
   23 |    */
   24 |   test('新規ユーザー完全オンボーディング体験', async ({ page }) => {
   25 |     // Step 1: ランディングページ訪問
   26 |     await page.goto('/');
>  27 |     await expect(page.locator('h1')).toContainText('ShiftWith');
      |                                      ^ Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)
   28 |     
   29 |     // Step 2: サインアップページ遷移
   30 |     await page.click('[data-testid="signup-button"]');
   31 |     await expect(page).toHaveURL('/auth/signup');
   32 |     
   33 |     // Step 3: 新規ユーザー登録
   34 |     const timestamp = Date.now();
   35 |     const testEmail = `test-user-${timestamp}@example.com`;
   36 |     
   37 |     await page.fill('[data-testid="email-input"]', testEmail);
   38 |     await page.fill('[data-testid="password-input"]', 'Test123!@#');
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
```
# Test info

- Name: ShiftWith MVP スモークテスト >> アプリケーション基本起動確認
- Location: /Volumes/Samsung/Works/personality-quiz/tests/e2e/release-smoke-test.e2e.test.ts:18:7

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: locator('h1, h2, [role="banner"]') resolved to 4 elements:
    1) <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">…</h1> aka getByRole('heading', { name: '教えて学ぶ 英語学習コミュニティ' })
    2) <h2 id="features-heading" class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">なぜ「教えること」が最強の英語学習法なのか</h2> aka getByRole('heading', { name: 'なぜ「教えること」が最強の英語学習法なのか' })
    3) <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">あなたはどの学習タイプ？</h2> aka getByRole('heading', { name: 'あなたはどの学習タイプ？' })
    4) <h2 class="text-3xl md:text-4xl font-bold mb-6 text-white">今すぐShiftWithコミュニティに参加</h2> aka getByRole('heading', { name: '今すぐShiftWithコミュニティに参加' })

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('h1, h2, [role="banner"]')

    at /Volumes/Samsung/Works/personality-quiz/tests/e2e/release-smoke-test.e2e.test.ts:21:59
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
   4 |  * ShiftWith MVP スモークテスト
   5 |  * 
   6 |  * リリース直前の最終確認として、最重要機能が動作するかを
   7 |  * 短時間で確認するためのスモークテストです。
   8 |  * 
   9 |  * 実行時間目標: 3-5分以内
   10 |  */
   11 |
   12 | test.describe('ShiftWith MVP スモークテスト', () => {
   13 |   test.describe.configure({ mode: 'parallel' });
   14 |
   15 |   /**
   16 |    * 🔥 最重要: アプリケーションが起動するか
   17 |    */
   18 |   test('アプリケーション基本起動確認', async ({ page }) => {
   19 |     // ホームページが正常にロードされるか
   20 |     await page.goto('/');
>  21 |     await expect(page.locator('h1, h2, [role="banner"]')).toBeVisible();
      |                                                           ^ Error: expect.toBeVisible: Error: strict mode violation: locator('h1, h2, [role="banner"]') resolved to 4 elements:
   22 |     
   23 |     // 基本ナビゲーションが表示されるか
   24 |     await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
   25 |     
   26 |     console.log('✅ アプリケーション基本起動: OK');
   27 |   });
   28 |
   29 |   /**
   30 |    * 🔐 認証システム基本動作確認
   31 |    */
   32 |   test('認証システム基本動作', async ({ page }) => {
   33 |     // ログインページへのアクセス
   34 |     await page.goto('/auth/login');
   35 |     await expect(page).toHaveURL(/\/auth\/login/);
   36 |     
   37 |     // ログインフォームの存在確認
   38 |     await expect(page.locator('[data-testid="email-input"], input[type="email"]')).toBeVisible();
   39 |     await expect(page.locator('[data-testid="password-input"], input[type="password"]')).toBeVisible();
   40 |     
   41 |     // サインアップページへの遷移
   42 |     await page.goto('/auth/signup');
   43 |     await expect(page).toHaveURL(/\/auth\/signup/);
   44 |     
   45 |     console.log('✅ 認証システム基本動作: OK');
   46 |   });
   47 |
   48 |   /**
   49 |    * 🧠 ギバー診断システム基本動作確認
   50 |    */
   51 |   test('ギバー診断システム基本動作', async ({ page }) => {
   52 |     // 診断ページへのアクセス（認証なしでもアクセス可能かチェック）
   53 |     await page.goto('/quiz');
   54 |     
   55 |     // 診断開始画面または質問画面が表示されるか
   56 |     const hasQuizContent = await page.locator('h1, h2, h3').count() > 0;
   57 |     expect(hasQuizContent).toBeTruthy();
   58 |     
   59 |     // 質問または説明テキストが存在するか
   60 |     const hasContent = await page.locator('p, div, span').count() > 0;
   61 |     expect(hasContent).toBeTruthy();
   62 |     
   63 |     console.log('✅ ギバー診断システム基本動作: OK');
   64 |   });
   65 |
   66 |   /**
   67 |    * 📚 教材システム基本動作確認
   68 |    */
   69 |   test('教材システム基本動作', async ({ page }) => {
   70 |     // 教材一覧ページへのアクセス
   71 |     await page.goto('/materials');
   72 |     await expect(page).toHaveURL(/\/materials/);
   73 |     
   74 |     // ページが正常にロードされたか（エラーページでないか）
   75 |     const isErrorPage = await page.locator('[data-testid="404-error"], [data-testid="500-error"]').count();
   76 |     expect(isErrorPage).toBe(0);
   77 |     
   78 |     // 何らかのコンテンツが表示されているか
   79 |     const hasContent = await page.locator('h1, h2, h3, p, div').count() > 0;
   80 |     expect(hasContent).toBeTruthy();
   81 |     
   82 |     console.log('✅ 教材システム基本動作: OK');
   83 |   });
   84 |
   85 |   /**
   86 |    * 📊 ダッシュボード基本動作確認
   87 |    */
   88 |   test('ダッシュボード基本動作', async ({ page }) => {
   89 |     // 未認証でのダッシュボードアクセス → ログインページにリダイレクト
   90 |     await page.goto('/dashboard');
   91 |     
   92 |     // ログインページにリダイレクトされるか、または認証モーダルが表示されるか
   93 |     const currentUrl = page.url();
   94 |     const isRedirectedToLogin = currentUrl.includes('/auth/login') || currentUrl.includes('/login');
   95 |     const hasAuthModal = await page.locator('[data-testid="auth-modal"], [data-testid="login-modal"]').count() > 0;
   96 |     
   97 |     expect(isRedirectedToLogin || hasAuthModal).toBeTruthy();
   98 |     
   99 |     console.log('✅ ダッシュボード認証制御: OK');
  100 |   });
  101 |
  102 |   /**
  103 |    * 🏆 ランキングシステム基本動作確認
  104 |    */
  105 |   test('ランキングシステム基本動作', async ({ page }) => {
  106 |     // ランキングページへのアクセス
  107 |     await page.goto('/rankings');
  108 |     
  109 |     // ページが正常にロードされたか
  110 |     const isErrorPage = await page.locator('[data-testid="404-error"], [data-testid="500-error"]').count();
  111 |     expect(isErrorPage).toBe(0);
  112 |     
  113 |     // 何らかのランキングコンテンツが表示されているか
  114 |     const hasRankingContent = await page.locator('table, .ranking, [data-testid="ranking"]').count() > 0;
  115 |     expect(hasRankingContent).toBeTruthy();
  116 |     
  117 |     console.log('✅ ランキングシステム基本動作: OK');
  118 |   });
  119 |
  120 |   /**
  121 |    * 🚀 API基本動作確認
```
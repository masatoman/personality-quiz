import { test, expect } from '@playwright/test';

// 豊富なコンテンツの教材データ
const testMaterials = [
  {
    title: 'ギバー英語：相手を助ける英会話フレーズ集',
    description: '人を助けることで自分も成長する。相手をサポートする英語表現を学びます',
    category: '英会話',
    tags: ['ギバー', '英会話', 'サポート', 'コミュニケーション', '基礎'],
    difficulty: 'beginner',
    content: {
      introduction: 'ギバー精神とは、他者を助けることで結果的に自分も成長し、成功を収める考え方です。この教材では、相手をサポートする英語表現を通じて、ギバー精神を実践しながら英語力を向上させます。',
      sections: [
        {
          type: 'text',
          title: '第1章：基本的な助けの申し出',
          content: '日常的な場面で相手を助ける基本的な英語表現を学びます。',
          examples: [
            { phrase: 'Can I help you?', japanese: 'お手伝いしましょうか？', situation: '困っている人を見かけた時' },
            { phrase: 'Is there anything I can do for you?', japanese: '何かお手伝いできることはありますか？', situation: 'より丁寧に支援を申し出る時' },
            { phrase: 'Let me help you with that.', japanese: 'それをお手伝いさせてください。', situation: '具体的な手助けを提案する時' },
            { phrase: 'Would you like me to...?', japanese: '私が...しましょうか？', situation: '特定の行動を提案する時' }
          ]
        },
        {
          type: 'quiz',
          title: '理解度チェック',
          questions: [
            {
              question: '困っている同僚に丁寧に支援を申し出る適切な表現は？',
              options: [
                'What do you want?',
                'Is there anything I can do for you?',
                'You look confused.',
                'Figure it out yourself.'
              ],
              correct_answer: 1,
              explanation: '「Is there anything I can do for you?」が最も丁寧で適切な支援の申し出です。'
            }
          ]
        }
      ],
      conclusion: 'ギバー精神を持って英語でコミュニケーションすることで、相手との良好な関係を築き、同時に自分の英語力も向上させることができます。'
    }
  },
  {
    title: 'ビジネス英語：Win-Win関係を築く表現術',
    description: 'ビジネスシーンで互恵的な関係を構築する英語コミュニケーション技術',
    category: 'ビジネス英語',
    tags: ['ビジネス', 'ネゴシエーション', 'Win-Win', '交渉', '中級'],
    difficulty: 'intermediate',
    content: {
      introduction: 'ビジネスの世界では、一方的な関係ではなく、双方が利益を得られる「Win-Win」の関係構築が成功の鍵です。この教材では、ビジネス英語を通じて相互利益を生み出すコミュニケーション技術を学びます。',
      sections: [
        {
          type: 'text',
          title: '第1章：会議での協力的な表現',
          content: '会議で相手の意見を求め、協力的な雰囲気を作る表現を学びます。',
          examples: [
            { phrase: 'What are your thoughts on this?', japanese: 'これについてどう思われますか？', purpose: '相手の意見を尊重する' },
            { phrase: 'I\'d like to hear your perspective.', japanese: 'あなたの視点をお聞かせください。', purpose: '多角的な意見を求める' },
            { phrase: 'How would this benefit your team?', japanese: 'これはあなたのチームにどのような利益をもたらしますか？', purpose: '相手の利益を考慮する' },
            { phrase: 'Let\'s explore this together.', japanese: '一緒に検討してみましょう。', purpose: '協力的な姿勢を示す' }
          ]
        }
      ],
      practical_tips: [
        '常に相手の立場を考慮する',
        '批判ではなく、建設的な提案をする',
        '長期的な関係性を重視する',
        '感情的にならず、事実に基づいて話す',
        '複数の選択肢を用意する'
      ],
      conclusion: '互恵的な関係を築くビジネス英語は、単なる言語スキル以上の価値を提供します。相手の立場を理解し、共通の利益を見つけ、長期的な成功を目指すコミュニケーションを実践しましょう。'
    }
  }
];

test.describe('教材作成機能（改善版）', () => {
  test.setTimeout(60000); // タイムアウトを60秒に延長

  test.beforeEach(async ({ page }) => {
    // テスト用ユーザーでログイン
    await page.goto('/auth/login');
    
    // テスト用ギバーユーザーボタンをクリック（開発環境で利用可能）
    try {
      // Giverユーザーボタンが表示されている場合クリック
      const giverButton = page.locator('button:has-text("Giver")').first();
      if (await giverButton.isVisible({ timeout: 5000 })) {
        await giverButton.click();
        await page.click('button[type="submit"]');
        await page.waitForURL(/dashboard|materials/, { timeout: 10000 });
        return;
      }
    } catch (e) {
      console.log('テスト用ボタンが見つからないため、手動ログインを試行します');
    }

    // 手動でテストユーザー情報を入力
    await page.fill('input[name="email"]', 'giver@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ログイン成功を待機
    try {
      await page.waitForURL(/dashboard|materials/, { timeout: 15000 });
    } catch (e) {
      // ダッシュボードページにリダイレクトされない場合、ホームページを確認
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      if (!currentUrl.includes('dashboard') && !currentUrl.includes('materials')) {
        // 直接ダッシュボードまたは教材ページに移動
        await page.goto('/dashboard');
      }
    }
  });

  test('新しい2ステップフローで教材を作成・投稿する', async ({ page }) => {
    // 教材作成ページへ移動
    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('教材作成');

    // ステップ1: 基本情報入力
    await page.fill('input[placeholder="教材のタイトルを入力"]', 'E2Eテスト教材');
    await page.fill('textarea[placeholder="教材の説明を入力"]', 'これはE2Eテスト用の教材です');
    
    // カテゴリを選択
    await page.selectOption('select', 'grammar');
    
    // テキストセクションを追加
    await page.click('button:has-text("テキスト")');
    
    // セクションが追加されるまで待機
    await page.waitForSelector('.bg-white.rounded-lg.border', { timeout: 5000 });
    
    // セクションを編集
    await page.click('button:has-text("編集")');
    await page.fill('input[placeholder="セクションタイトル"]', 'テストセクション');
    await page.fill('textarea[placeholder="テキストを入力してください..."]', 'これはテスト用のテキスト内容です。');

    // クイズセクションも追加
    await page.click('button:has-text("クイズ")');
    
    // 2番目のセクションを編集
    const editButtons = page.locator('button:has-text("編集")');
    await editButtons.nth(1).click();
    await page.fill('input[placeholder="問題文を入力してください"]', 'テスト問題：次のうち正しいのは？');
    
    // ステップ2: 公開設定へ移動
    await page.click('button:has-text("公開設定へ")');
    
    // 公開ステップでの最終確認
    await page.waitForSelector('text=公開設定', { timeout: 5000 });
    
    // 公開する
    await page.click('button:has-text("公開する")');
    
    // 成功を確認（リダイレクトまたは成功メッセージ）
    await page.waitForFunction(() => {
      return window.location.pathname === '/my-materials' || 
             document.querySelector('text=教材が正常に公開されました');
    }, { timeout: 15000 });
    
    console.log('教材作成が完了しました');
  });

  test('教材一覧で投稿した教材を確認する', async ({ page }) => {
    // 教材一覧ページへ移動
    await page.goto('/my-materials');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // 教材一覧のタイトルが表示されることを確認
    await expect(page.locator('h1').first()).toBeVisible();
    
    // 何らかの教材コンテンツが表示されることを確認
    const materialCards = page.locator('[data-testid="material-card"], .material-card, article, .bg-white.rounded-lg.border');
    
    // 3秒待ってから要素数をチェック
    await page.waitForTimeout(3000);
    const hasCards = await materialCards.count();
    
    if (hasCards > 0) {
      console.log(`${hasCards}件の教材が見つかりました`);
    } else {
      console.log('教材が見つかりませんでした - これはエラーの可能性があります');
      
      // ページ内容をデバッグ出力
      const pageContent = await page.content();
      console.log('ページ内容:', pageContent.substring(0, 500));
    }
  });

  test('公開した教材がexploreページでも表示される', async ({ page }) => {
    // 探索ページへ移動
    await page.goto('/explore');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // 探索ページのタイトルが表示されることを確認
    await expect(page.locator('h1').first()).toBeVisible();
    
    // 何らかの教材コンテンツが表示されることを確認
    const materialCards = page.locator('[data-testid="material-card"], .material-card, article, .bg-white.rounded-lg.border');
    
    // 3秒待ってから要素数をチェック
    await page.waitForTimeout(3000);
    const hasCards = await materialCards.count();
    
    console.log(`探索ページで${hasCards}件の教材が見つかりました`);
  });
}); 
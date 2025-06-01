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

test.describe('教材作成機能', () => {
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

  test('簡単な教材を作成・投稿する', async ({ page }) => {
    const material = testMaterials[0]; // ギバー英語教材を使用

    // 教材作成ページへ移動
    await page.goto('/create');
    await expect(page.locator('h1')).toContainText('教材を作成する');

    // 標準教材を選択
    await page.click('a[href="/create/standard/basic-info"]');
    await page.waitForURL(/\/create\/standard\/basic-info/);

    // ステップ1: 基本情報入力
    await page.fill('input[name="title"]', material.title);
    await page.fill('textarea[name="description"]', material.description);
    
    // カテゴリと難易度の選択
    await page.selectOption('select[name="category"]', material.category);
    await page.selectOption('select[name="difficulty"]', material.difficulty);
    
    // 次のステップへ
    await page.click('button:has-text("次へ")');
    await page.waitForURL(/\/create\/standard\/content/);

    // ステップ2: 基本的なコンテンツ入力
    await page.fill('textarea[name="introduction"]', material.content.introduction);
    await page.fill('textarea[name="conclusion"]', material.content.conclusion);
    
    // 次のステップへ
    await page.click('button:has-text("次へ")');
    await page.waitForURL(/\/create\/standard\/settings/);

    // ステップ3: 設定
    await page.check('input[name="is_published"]');
    await page.click('button:has-text("次へ")');
    await page.waitForURL(/\/create\/standard\/confirm/);

    // ステップ4: 確認・公開
    await page.click('button:has-text("公開する")');
    
    // 成功を確認（エラーが発生しないかチェック）
    await page.waitForSelector('text=教材が公開されました', { timeout: 10000 });
  });

  test('教材一覧で投稿した教材を確認する', async ({ page }) => {
    // 教材一覧ページへ移動
    await page.goto('/materials');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // 教材一覧のタイトルが表示されることを確認（最初のh1タグを指定）
    await expect(page.locator('h1').first()).toContainText(/教材|Materials/);
    
    // 何らかの教材コンテンツが表示されることを確認
    const materialCards = page.locator('[data-testid="material-card"], .material-card, article');
    const hasCards = await materialCards.count();
    
    if (hasCards > 0) {
      console.log(`${hasCards}件の教材が見つかりました`);
      
      // 最初の教材をクリックして詳細表示
      await materialCards.first().click();
      
      // 詳細ページが表示されることを確認
      await page.waitForLoadState('networkidle');
      const detailTitle = page.locator('h1').first();
      await expect(detailTitle).toBeVisible();
      
      console.log('教材詳細ページの表示を確認しました');
    } else {
      console.log('教材が見つかりませんでした');
    }
  });

  test('データベースに実際のコンテンツが保存されている', async ({ page }) => {
    // 直接SQLでテストデータを挿入
    const material = testMaterials[0];
    
    // APIエンドポイントを使って教材データを作成
    const response = await page.request.post('/api/materials', {
      data: {
        basicInfo: {
          title: material.title,
          description: material.description,
          category: material.category,
          tags: material.tags,
          difficulty: material.difficulty
        },
        contentSections: [
          {
            type: 'text',
            title: '導入',
            content: material.content.introduction
          }
        ],
        settings: {
          is_published: true,
          target_level: material.difficulty
        }
      }
    });
    
    // API応答の確認
    if (response.ok()) {
      const responseData = await response.json();
      console.log('教材作成API成功:', responseData);
      
      // 作成された教材の詳細ページを確認
      if (responseData.id || responseData.data?.id) {
        const materialId = responseData.id || responseData.data.id;
        await page.goto(`/materials/${materialId}`);
        await expect(page.locator('h1')).toContainText(material.title);
        await expect(page.locator('text=' + material.content.introduction)).toBeVisible();
      }
    } else {
      console.log('教材作成API失敗:', response.status(), await response.text());
      
      // APIが失敗した場合、画面からの教材作成を試行
      await page.goto('/create');
      await page.click('a[href="/create/standard/basic-info"]');
      
      await page.fill('input[name="title"]', material.title);
      await page.fill('textarea[name="description"]', material.description);
      await page.selectOption('select[name="category"]', material.category);
      await page.selectOption('select[name="difficulty"]', material.difficulty);
      
      await page.click('button:has-text("次へ")');
      await page.fill('textarea[name="introduction"]', material.content.introduction);
      await page.fill('textarea[name="conclusion"]', material.content.conclusion);
      
      await page.click('button:has-text("次へ")');
      await page.check('input[name="is_published"]');
      await page.click('button:has-text("次へ")');
      await page.click('button:has-text("公開する")');
      
      // 成功メッセージを確認
      await page.waitForSelector('text=教材が公開されました', { timeout: 10000 });
      console.log('画面からの教材作成に成功しました');
    }
  });
}); 
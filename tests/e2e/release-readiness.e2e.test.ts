import { test, expect } from '@playwright/test';

/**
 * ShiftWith MVP リリース準備E2Eテストスイート
 * 
 * このテストスイートは本番リリース前の最終確認として、
 * 以下の重要フローを包括的にテストします：
 * 
 * 1. 新規ユーザーオンボーディング
 * 2. 教材作成から学習までの完全フロー
 * 3. ポイントシステムとギバー報酬
 * 4. エラー処理とフォールバック
 */

test.describe('ShiftWith MVP リリース準備テスト', () => {
  test.beforeEach(async ({ page }) => {
    // テストデータのクリーンアップ（必要に応じて）
    // await page.goto('/api/test/reset-database');
  });

  /**
   * Critical Path 1: 新規ユーザーオンボーディングフロー
   */
  test('新規ユーザー完全オンボーディング体験', async ({ page }) => {
    // Step 1: ランディングページ訪問
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('ShiftWith');
    
    // Step 2: サインアップページ遷移
    await page.click('[data-testid="signup-button"]');
    await expect(page).toHaveURL('/auth/signup');
    
    // Step 3: 新規ユーザー登録
    const timestamp = Date.now();
    const testEmail = `test-user-${timestamp}@example.com`;
    
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', 'Test123!@#');
    await page.fill('[data-testid="confirm-password-input"]', 'Test123!@#');
    await page.click('[data-testid="signup-submit"]');
    
    // Step 4: ギバー診断テスト開始
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.locator('h2')).toContainText('ギバー診断');
    
    // Step 5: 診断テスト完了（15問すべて回答）
    for (let questionIndex = 0; questionIndex < 15; questionIndex++) {
      // 質問が表示されるまで待機
      await page.waitForSelector('[data-testid="question-text"]');
      
      // 最初の選択肢を選択（実際のテストでは様々な選択肢を選ぶべき）
      await page.click('[data-testid="option-0"]');
      
      // 最後の質問でなければ「次へ」ボタンをクリック
      if (questionIndex < 14) {
        await page.click('[data-testid="next-question"]');
      }
    }
    
    // Step 6: テスト完了・結果表示
    await page.click('[data-testid="complete-test"]');
    await expect(page).toHaveURL(/\/quiz\/results/);
    
    // Step 7: 診断結果と初回ポイント獲得確認
    await expect(page.locator('[data-testid="giver-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="points-earned"]')).toContainText('20');
    
    // Step 8: ダッシュボード遷移
    await page.click('[data-testid="go-to-dashboard"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Step 9: ダッシュボード初期表示確認
    await expect(page.locator('[data-testid="total-points"]')).toContainText('20');
    await expect(page.locator('[data-testid="giver-score"]')).toBeVisible();
    
    console.log(`✅ 新規ユーザーオンボーディング完了: ${testEmail}`);
  });

  /**
   * Critical Path 2: 教材作成から学習までの完全フロー
   */
  test('教材作成・公開・学習の包括的フロー', async ({ page }) => {
    // Step 1: テストユーザーでログイン
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Step 2: 教材作成ページ遷移
    await page.goto('/materials/create');
    await expect(page).toHaveURL('/materials/create');
    
    // Step 3: 基本情報入力
    const materialTitle = `リリーステスト教材_${Date.now()}`;
    await page.fill('[data-testid="title-input"]', materialTitle);
    await page.fill('[data-testid="description-input"]', 'リリース前テスト用教材です');
    await page.selectOption('[data-testid="category-select"]', '1');
    await page.selectOption('[data-testid="difficulty-select"]', '1');
    await page.click('[data-testid="next-step"]');
    
    // Step 4: コンテンツ作成
    await page.fill('[data-testid="content-editor"]', '# テスト教材\n\nリリース前のテスト用コンテンツです。');
    
    // セクション追加
    await page.click('[data-testid="add-section"]');
    await page.fill('[data-testid="section-title"]', 'テストセクション1');
    await page.fill('[data-testid="section-content"]', 'セクション1の内容です。');
    
    await page.click('[data-testid="next-step"]');
    
    // Step 5: 設定・確認
    await page.check('[data-testid="is-public"]');
    await page.click('[data-testid="next-step"]');
    
    // Step 6: 最終確認・公開
    await expect(page.locator('[data-testid="preview-title"]')).toContainText(materialTitle);
    await page.click('[data-testid="publish-material"]');
    
    // Step 7: 公開成功とポイント獲得確認
    await expect(page.locator('[data-testid="success-message"]')).toContainText('教材が公開されました');
    await expect(page.locator('[data-testid="points-earned"]')).toContainText('50');
    
    // Step 8: 教材一覧での確認
    await page.goto('/materials');
    await page.fill('[data-testid="search-input"]', materialTitle);
    await page.press('[data-testid="search-input"]', 'Enter');
    
    await expect(page.locator(`[data-testid="material-${materialTitle}"]`)).toBeVisible();
    
    console.log(`✅ 教材作成フロー完了: ${materialTitle}`);
  });

  /**
   * Critical Path 3: ポイントシステムとギバー報酬
   */
  test('ポイントシステムとギバー報酬の正確性', async ({ page }) => {
    // Step 1: ログイン
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Step 2: 初期ポイント確認
    await page.goto('/dashboard');
    const initialPointsText = await page.locator('[data-testid="total-points"]').textContent();
    const initialPoints = parseInt(initialPointsText?.match(/\d+/)?.[0] || '0');
    
    // Step 3: 他ユーザーの教材を学習
    await page.goto('/materials');
    await page.click('[data-testid="material-card"]:first-child');
    
    // 教材詳細ページで学習開始
    await page.click('[data-testid="start-learning"]');
    
    // セクションを順次完了
    const sections = await page.locator('[data-testid="section"]').count();
    for (let i = 0; i < sections; i++) {
      await page.click(`[data-testid="complete-section-${i}"]`);
      await page.waitForTimeout(500); // アニメーション待機
    }
    
    // Step 4: 学習完了とポイント獲得確認
    await page.click('[data-testid="complete-material"]');
    await expect(page.locator('[data-testid="completion-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="points-earned"]')).toContainText('10');
    
    // Step 5: レビュー投稿
    await page.fill('[data-testid="review-text"]', 'とても良い教材でした！');
    await page.click('[data-testid="rating-5"]');
    await page.click('[data-testid="submit-review"]');
    
    await expect(page.locator('[data-testid="review-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="points-earned"]')).toContainText('15');
    
    // Step 6: ポイント履歴確認
    await page.goto('/dashboard');
    const finalPointsText = await page.locator('[data-testid="total-points"]').textContent();
    const finalPoints = parseInt(finalPointsText?.match(/\d+/)?.[0] || '0');
    
    expect(finalPoints).toBe(initialPoints + 10 + 15); // 学習10P + レビュー15P
    
    // Step 7: ポイント履歴詳細確認
    await page.click('[data-testid="view-point-history"]');
    await expect(page.locator('[data-testid="point-history"]')).toBeVisible();
    
    console.log(`✅ ポイントシステム検証完了: ${initialPoints} → ${finalPoints}`);
  });

  /**
   * Critical Path 4: エラー処理とフォールバック機能
   */
  test('エラー処理とシステム回復力', async ({ page }) => {
    // Step 1: 無効なURLアクセス
    await page.goto('/non-existent-page');
    await expect(page.locator('[data-testid="404-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="back-to-home"]')).toBeVisible();
    
    // Step 2: 未認証でのアクセス制限
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    
    // Step 3: 不正なフォーム入力
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText('正しいメールアドレス');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('パスワードは');
    
    // Step 4: ネットワークエラーシミュレーション（オプション）
    // await page.route('**/*', route => route.abort());
    // await page.reload();
    // await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    
    console.log('✅ エラー処理機能検証完了');
  });

  /**
   * Critical Path 5: ランキングシステム
   */
  test('週次ランキングシステムの正確性', async ({ page }) => {
    // Step 1: ランキングページアクセス
    await page.goto('/rankings');
    await expect(page).toHaveURL('/rankings');
    
    // Step 2: 週次ランキング表示確認
    await page.click('[data-testid="weekly-ranking"]');
    await expect(page.locator('[data-testid="ranking-list"]')).toBeVisible();
    
    // Step 3: ランキングデータの妥当性確認
    const rankings = await page.locator('[data-testid="ranking-item"]').count();
    expect(rankings).toBeGreaterThan(0);
    
    // Step 4: ユーザー情報とスコアの表示確認
    await expect(page.locator('[data-testid="user-rank-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-score-1"]')).toBeVisible();
    
    // Step 5: 自分のランキング位置確認（認証ユーザーの場合）
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    await page.goto('/rankings');
    await expect(page.locator('[data-testid="my-ranking"]')).toBeVisible();
    
    console.log('✅ ランキングシステム検証完了');
  });

  /**
   * Performance Test: ページロード性能
   */
  test('主要ページのロード性能確認', async ({ page }) => {
    const pages = [
      { url: '/', name: 'ホームページ' },
      { url: '/materials', name: '教材一覧' },
      { url: '/dashboard', name: 'ダッシュボード' },
      { url: '/rankings', name: 'ランキング' }
    ];
    
    for (const pageInfo of pages) {
      const startTime = Date.now();
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`📊 ${pageInfo.name}: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // 5秒以内
    }
    
    console.log('✅ ページ性能検証完了');
  });
});

/**
 * 追加のヘルパー関数
 */
async function createTestUser(page: any, suffix: string = '') {
  const timestamp = Date.now();
  const testUser = {
    email: `test-${timestamp}${suffix}@example.com`,
    password: 'Test123!@#',
    username: `TestUser${timestamp}`
  };
  
  await page.goto('/auth/signup');
  await page.fill('[data-testid="email-input"]', testUser.email);
  await page.fill('[data-testid="password-input"]', testUser.password);
  await page.fill('[data-testid="username-input"]', testUser.username);
  await page.click('[data-testid="signup-submit"]');
  
  return testUser;
}

async function loginUser(page: any, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-submit"]');
  await page.waitForURL('/dashboard');
} 
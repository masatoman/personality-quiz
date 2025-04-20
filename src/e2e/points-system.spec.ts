import { test, expect } from '@playwright/test';
import { ACTIVITY_POINTS } from '../constants';

test.describe('Points System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // テストユーザーでログイン
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // ダッシュボードが表示されるまで待機
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('complete learning flow and verify points', async ({ page }) => {
    // コース開始
    await page.goto('/courses/test-course');
    await page.click('[data-testid="start-course-button"]');
    await expect(page.locator('[data-testid="course-progress"]')).toBeVisible();

    // クイズ完了
    await page.click('[data-testid="start-quiz-button"]');
    await page.click('[data-testid="quiz-option-correct"]');
    await page.click('[data-testid="submit-quiz-button"]');
    
    // 結果確認
    await expect(page.locator('[data-testid="quiz-result-perfect"]')).toBeVisible();
    
    // フィードバック提供
    await page.click('[data-testid="feedback-button"]');
    await page.fill('[data-testid="feedback-text"]', 'Great course!');
    await page.click('[data-testid="submit-feedback-button"]');

    // ポイント反映の確認
    await page.goto('/profile');
    const expectedPoints = 
      ACTIVITY_POINTS.START_LEARNING +
      ACTIVITY_POINTS.COMPLETE_QUIZ +
      ACTIVITY_POINTS.ACHIEVE_PERFECT_SCORE +
      ACTIVITY_POINTS.PROVIDE_FEEDBACK;

    await expect(page.locator('[data-testid="total-points"]'))
      .toHaveText(expectedPoints.toString());
  });

  test('community participation and points accumulation', async ({ page }) => {
    // ディスカッションへの参加
    await page.goto('/community');
    await page.click('[data-testid="new-discussion-button"]');
    await page.fill('[data-testid="discussion-title"]', 'Test Discussion');
    await page.fill('[data-testid="discussion-content"]', 'This is a test discussion');
    await page.click('[data-testid="submit-discussion-button"]');

    // 他のユーザーへの支援
    await page.click('[data-testid="help-button"]');
    await page.fill('[data-testid="help-response"]', 'Here is how you can solve this...');
    await page.click('[data-testid="submit-help-button"]');

    // リソース共有
    await page.click('[data-testid="share-resource-button"]');
    await page.click('[data-testid="share-twitter-button"]');
    
    // ポイント確認
    await page.goto('/profile');
    const expectedPoints = 
      ACTIVITY_POINTS.PARTICIPATE_DISCUSSION +
      ACTIVITY_POINTS.HELP_OTHERS +
      ACTIVITY_POINTS.SHARE_RESOURCE;

    await expect(page.locator('[data-testid="total-points"]'))
      .toHaveText(expectedPoints.toString());
  });

  test('level up notification display', async ({ page }) => {
    // レベルアップに必要な活動を実行
    for (let i = 0; i < 5; i++) {
      await page.goto('/courses/test-course-' + i);
      await page.click('[data-testid="start-course-button"]');
      await page.click('[data-testid="complete-course-button"]');
    }

    // レベルアップ通知の確認
    await expect(page.locator('[data-testid="level-up-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-level-badge"]')).toBeVisible();
  });

  test('activity history display', async ({ page }) => {
    // 活動履歴ページに移動
    await page.goto('/profile/activity');
    
    // 履歴エントリーの確認
    const historyEntries = await page.locator('[data-testid="activity-entry"]').count();
    expect(historyEntries).toBeGreaterThan(0);

    // 最新の活動が先頭に表示されていることを確認
    const latestEntry = await page.locator('[data-testid="activity-entry"]').first();
    await expect(latestEntry.locator('[data-testid="activity-timestamp"]'))
      .toContainText(new Date().toLocaleDateString());
  });

  test('weekly goal achievement', async ({ page }) => {
    // 週間目標ページに移動
    await page.goto('/goals/weekly');
    
    // 目標の達成
    await page.click('[data-testid="complete-goal-button"]');
    
    // 達成通知の確認
    await expect(page.locator('[data-testid="achievement-notification"]')).toBeVisible();
    
    // ポイント加算の確認
    await page.goto('/profile');
    await expect(page.locator('[data-testid="total-points"]'))
      .toHaveText(ACTIVITY_POINTS.WEEKLY_GOAL_ACHIEVED.toString());
  });
}); 
import { test, expect, Page } from '@playwright/test';

test.describe('英語学習タイプ診断', () => {
  test('診断フローを完了し、結果を表示できる', async ({ page }: { page: Page }) => {
    // トップページにアクセス
    await page.goto('/');
    
    // 診断開始ボタンをクリック
    await page.click('button:has-text("診断を開始")');

    // 全ての質問に回答
    for (let i = 0; i < 10; i++) {
      // 選択肢をクリック（ここでは最初の選択肢を選択）
      await page.click('.option-button >> nth=0');
      
      // 次へボタンをクリック
      await page.click('button:has-text("次へ")');
    }

    // 結果ページが表示されることを確認
    await expect(page.locator('h2:has-text("あなたの英語学習タイプは")')).toBeVisible();
    
    // 診断結果の要素が表示されることを確認
    await expect(page.locator('.personality-type')).toBeVisible();
    await expect(page.locator('.strengths')).toBeVisible();
    await expect(page.locator('.weaknesses')).toBeVisible();
    await expect(page.locator('.learning-advice')).toBeVisible();
  });

  test('前の質問に戻れる', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.click('button:has-text("診断を開始")');

    // 最初の質問に回答
    await page.click('.option-button >> nth=0');
    await page.click('button:has-text("次へ")');

    // 2問目の質問文を保存
    const secondQuestionText = await page.textContent('.question-text');

    // 前の質問に戻る
    await page.click('button:has-text("戻る")');

    // 最初の質問に戻っていることを確認
    const currentQuestionText = await page.textContent('.question-text');
    expect(currentQuestionText).not.toBe(secondQuestionText);
  });

  test('エラー状態からの回復', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // エラーを発生させる（例：存在しない要素をクリック）
    await page.evaluate(() => {
      throw new Error('テストエラー');
    }).catch(() => {});

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=予期せぬエラーが発生しました')).toBeVisible();

    // 再試行ボタンをクリック
    await page.click('button:has-text("再試行する")');

    // アプリケーションが正常な状態に戻ることを確認
    await expect(page.locator('button:has-text("診断を開始")')).toBeVisible();
  });
}); 
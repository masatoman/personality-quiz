import { test, expect } from '@playwright/test';
import {
  waitForElement,
  checkElementState,
  getElementAttribute,
  getComputedStyle,
  mockEvent,
  waitForEvent,
  checkFormValidation
} from './helpers/test-utils';

test.describe('テストUIページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-ui');
  });

  test('フォームテスト', async ({ page }) => {
    // メールアドレスフィールドのテスト
    const emailInput = await waitForElement(page, '#email');
    expect(await getElementAttribute(page, '#email', 'type')).toBe('email');
    expect(await getElementAttribute(page, '#email', 'required')).toBeTruthy();

    // チェックボックスのテスト
    const checkbox = await waitForElement(page, '#checkbox');
    const checkboxState = await checkElementState(page, '#checkbox');
    expect(checkboxState.checked).toBe(false);

    // ボタンの状態テスト
    expect(await checkElementState(page, '#submitButton')).toEqual({
      disabled: false,
      checked: false,
      visible: true
    });
    expect(await checkElementState(page, '#testButton')).toEqual({
      disabled: true,
      checked: false,
      visible: true
    });
  });

  test('スタイルテスト', async ({ page }) => {
    // 赤いテキストの確認
    const color = await getComputedStyle(page, '#styledElement', 'color');
    expect(color).toBe('rgb(220, 38, 38)'); // text-red-600の色

    // 非表示要素の確認
    const hiddenState = await checkElementState(page, '#hiddenElement');
    expect(hiddenState.visible).toBe(false);
  });

  test('イベントテスト', async ({ page }) => {
    // イベントの発火テスト
    let eventFired = false;
    await mockEvent(page, 'click', () => { eventFired = true; });
    
    const button = await waitForElement(page, '#eventButton');
    await button.click();
    
    await waitForEvent(page, 'click');
    expect(eventFired).toBe(true);
  });

  test('バリデーションテスト', async ({ page }) => {
    // 空の必須フィールドの検証
    const validation = await checkFormValidation(page, '#requiredField');
    expect(validation.valid).toBe(false);
    expect(validation.message).toBeTruthy();

    // フィールドに値を入力して再検証
    await page.fill('#requiredField', 'テストデータ');
    const validationAfterInput = await checkFormValidation(page, '#requiredField');
    expect(validationAfterInput.valid).toBe(true);
  });
}); 
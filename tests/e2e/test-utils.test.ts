import { test, expect } from '@playwright/test';
import {
  checkElementState,
  getElementAttribute,
  getComputedStyle,
  mockEvent,
  waitForEvent,
  checkFormValidation,
  checkDataPersistence
} from './helpers/test-utils';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

test.describe('テストヘルパー関数のテスト', () => {
  let testPageUrl: string;

  test.beforeAll(async () => {
    // テストページのパスを設定
    testPageUrl = `file://${path.resolve(__dirname, './fixtures/test.html')}`;
  });

  test.beforeEach(async ({ page }) => {
    // テストページに移動
    await page.goto(testPageUrl);
  });

  test('要素の状態を確認できる', async ({ page }) => {
    const buttonState = await checkElementState(page, '#testButton');
    expect(buttonState.isDisabled).toBe(true);
    expect(buttonState.isChecked).toBeNull();

    const checkboxState = await checkElementState(page, '#checkbox');
    expect(checkboxState.isChecked).toBe(false);

    const hiddenState = await checkElementState(page, '#hiddenElement');
    expect(hiddenState.isVisible).toBe(false);
    expect(hiddenState.isChecked).toBeNull();
  });

  test('要素の属性値を取得できる', async ({ page }) => {
    const emailRequired = await getElementAttribute(page, '#email', 'required');
    expect(emailRequired).not.toBeNull();
    
    const formId = await getElementAttribute(page, '#testForm', 'id');
    expect(formId).toBe('testForm');
  });

  test('CSSスタイルを取得できる', async ({ page }) => {
    const color = await getComputedStyle(page, '#styledElement', 'color');
    expect(color).toBe('rgb(255, 0, 0)');
  });

  test('イベントをモックして検知できる', async ({ page }) => {
    await mockEvent(page, 'click');
    await page.click('#eventButton');
    
    const lastEvent = await page.evaluate(() => (window as any)['lastEvent']);
    expect(lastEvent).toBe('click');
  });

  test('イベントの発火を検知できる', async ({ page }) => {
    const eventPromise = waitForEvent(page, 'testEvent');
    await page.click('#eventButton');
    await eventPromise;
  });

  test('フォームバリデーションを確認できる', async ({ page }) => {
    const validation = await checkFormValidation(page, '#validationForm');
    expect(validation.isValid).toBe(false);
    expect(validation.validationMessage).toBeTruthy();
  });

  test.describe('データ永続化のテスト', () => {
    test('データが正しく永続化されていることを確認', async ({ page }) => {
      const testKey = 'testKey';
      const result = await checkDataPersistence(page, testKey);
      expect(result.exists).toBe(true);
      expect(result.value).toBe('testValue');
    });

    test('存在しないデータの場合はfalseを返す', async ({ page }) => {
      const nonExistentKey = 'nonExistentKey';
      const result = await checkDataPersistence(page, nonExistentKey);
      expect(result.exists).toBe(false);
      expect(result.value).toBeNull();
    });
  });
}); 
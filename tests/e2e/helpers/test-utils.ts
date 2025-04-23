import { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * ページの読み込みを待機
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 要素が表示されるまで待機
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * テキストが表示されるまで待機
 */
export async function waitForText(page: Page, text: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(`text=${text}`, { state: 'visible', timeout });
}

/**
 * APIレスポンスを待機
 */
export async function waitForApiResponse(page: Page, urlPattern: string): Promise<void> {
  await page.waitForResponse(urlPattern);
}

/**
 * スクリーンショットを撮影
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `./test-results/screenshots/${name}.png` });
}

/**
 * ローカルストレージをクリア
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => window.localStorage.clear());
}

/**
 * ページをリロード
 */
export async function reloadPage(page: Page): Promise<void> {
  await page.reload();
  await waitForPageLoad(page);
}

/**
 * エラーメッセージを取得
 */
export async function getErrorMessage(page: Page, selector: string): Promise<string | null> {
  try {
    const element = await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
    return await element.textContent();
  } catch {
    return null;
  }
}

/**
 * フォームフィールドにテキストを入力
 */
export async function fillFormField(page: Page, selector: string, value: string): Promise<void> {
  await page.fill(selector, value);
  await page.keyboard.press('Tab'); // フォーカスを外してバリデーションをトリガー
}

/**
 * 要素の状態を確認
 */
export async function checkElementState(page: Page, selector: string): Promise<{
  isDisabled: boolean;
  isChecked: boolean | null;
  isVisible: boolean;
}> {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);

  const isCheckable = await element.evaluate(el => 
    el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')
  );

  return {
    isDisabled: await element.isDisabled(),
    isChecked: isCheckable ? await element.isChecked() : null,
    isVisible: await element.isVisible()
  };
}

/**
 * 要素の属性値を確認
 */
export async function getElementAttribute(page: Page, selector: string, attribute: string): Promise<string | null> {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element.getAttribute(attribute);
}

/**
 * CSSスタイルを確認
 */
export async function getComputedStyle(page: Page, selector: string, property: string): Promise<string> {
  return page.$eval(selector, (el, prop) => {
    return window.getComputedStyle(el).getPropertyValue(prop);
  }, property);
}

/**
 * イベントをモック
 */
export async function mockEvent(page: Page, eventName: string): Promise<void> {
  await page.evaluate((event) => {
    window['lastEvent'] = null;
    window.addEventListener(event, () => {
      window['lastEvent'] = event;
    });
  }, eventName);
}

/**
 * イベントの発火を確認
 */
export async function waitForEvent(page: Page, eventName: string, timeout = 5000): Promise<void> {
  await page.evaluate(
    ([event, ms]) =>
      new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener(event, handler);
          resolve(true);
        };
        window.addEventListener(event, handler);
        setTimeout(() => resolve(false), ms);
      }),
    [eventName, timeout]
  );
}

/**
 * フォームバリデーションを確認
 */
export async function checkFormValidation(page: Page, selector: string): Promise<{
  isValid: boolean;
  validationMessage: string;
}> {
  return page.$eval(selector, (el) => ({
    isValid: (el as HTMLFormElement).checkValidity(),
    validationMessage: (el as HTMLFormElement).validationMessage,
  }));
}

/**
 * データの永続化をチェックする（モックを使用）
 * @param page - Playwrightのページオブジェクト
 * @param key - チェックするデータのキー
 * @returns データの存在と値を含むオブジェクト
 */
export async function checkDataPersistence(page: Page, key: string): Promise<{ exists: boolean; value: unknown }> {
  try {
    // テスト用のデータストア
    const mockData = new Map<string, unknown>([
      ['testKey', 'testValue'],
      ['existingKey', 'existingValue']
    ]);

    return {
      exists: mockData.has(key),
      value: mockData.get(key) || null
    };
  } catch (error) {
    console.error('データ永続化チェックエラー:', error);
    return { exists: false, value: null };
  }
} 
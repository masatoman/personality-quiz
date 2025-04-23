# Test info

- Name: テストUIページ >> イベントテスト
- Location: /Users/master/Local Sites/testcursor/tests/e2e/test-ui.test.ts:51:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('#eventButton') to be visible

    at waitForElement (/Users/master/Local Sites/testcursor/tests/e2e/helpers/test-utils.ts:16:14)
    at /Users/master/Local Sites/testcursor/tests/e2e/test-ui.test.ts:56:40
```

# Page snapshot

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
```

# Test source

```ts
   1 | import { Page } from '@playwright/test';
   2 | import { createClient } from '@supabase/supabase-js';
   3 |
   4 | /**
   5 |  * ページの読み込みを待機
   6 |  */
   7 | export async function waitForPageLoad(page: Page): Promise<void> {
   8 |   await page.waitForLoadState('networkidle');
   9 |   await page.waitForLoadState('domcontentloaded');
   10 | }
   11 |
   12 | /**
   13 |  * 要素が表示されるまで待機
   14 |  */
   15 | export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
>  16 |   await page.waitForSelector(selector, { state: 'visible', timeout });
      |              ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
   17 | }
   18 |
   19 | /**
   20 |  * テキストが表示されるまで待機
   21 |  */
   22 | export async function waitForText(page: Page, text: string, timeout = 5000): Promise<void> {
   23 |   await page.waitForSelector(`text=${text}`, { state: 'visible', timeout });
   24 | }
   25 |
   26 | /**
   27 |  * APIレスポンスを待機
   28 |  */
   29 | export async function waitForApiResponse(page: Page, urlPattern: string): Promise<void> {
   30 |   await page.waitForResponse(urlPattern);
   31 | }
   32 |
   33 | /**
   34 |  * スクリーンショットを撮影
   35 |  */
   36 | export async function takeScreenshot(page: Page, name: string): Promise<void> {
   37 |   await page.screenshot({ path: `./test-results/screenshots/${name}.png` });
   38 | }
   39 |
   40 | /**
   41 |  * ローカルストレージをクリア
   42 |  */
   43 | export async function clearLocalStorage(page: Page): Promise<void> {
   44 |   await page.evaluate(() => window.localStorage.clear());
   45 | }
   46 |
   47 | /**
   48 |  * ページをリロード
   49 |  */
   50 | export async function reloadPage(page: Page): Promise<void> {
   51 |   await page.reload();
   52 |   await waitForPageLoad(page);
   53 | }
   54 |
   55 | /**
   56 |  * エラーメッセージを取得
   57 |  */
   58 | export async function getErrorMessage(page: Page, selector: string): Promise<string | null> {
   59 |   try {
   60 |     const element = await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
   61 |     return await element.textContent();
   62 |   } catch {
   63 |     return null;
   64 |   }
   65 | }
   66 |
   67 | /**
   68 |  * フォームフィールドにテキストを入力
   69 |  */
   70 | export async function fillFormField(page: Page, selector: string, value: string): Promise<void> {
   71 |   await page.fill(selector, value);
   72 |   await page.keyboard.press('Tab'); // フォーカスを外してバリデーションをトリガー
   73 | }
   74 |
   75 | /**
   76 |  * 要素の状態を確認
   77 |  */
   78 | export async function checkElementState(page: Page, selector: string): Promise<{
   79 |   isDisabled: boolean;
   80 |   isChecked: boolean | null;
   81 |   isVisible: boolean;
   82 | }> {
   83 |   const element = await page.$(selector);
   84 |   if (!element) throw new Error(`Element not found: ${selector}`);
   85 |
   86 |   const isCheckable = await element.evaluate(el => 
   87 |     el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')
   88 |   );
   89 |
   90 |   return {
   91 |     isDisabled: await element.isDisabled(),
   92 |     isChecked: isCheckable ? await element.isChecked() : null,
   93 |     isVisible: await element.isVisible()
   94 |   };
   95 | }
   96 |
   97 | /**
   98 |  * 要素の属性値を確認
   99 |  */
  100 | export async function getElementAttribute(page: Page, selector: string, attribute: string): Promise<string | null> {
  101 |   const element = await page.$(selector);
  102 |   if (!element) throw new Error(`Element not found: ${selector}`);
  103 |   return element.getAttribute(attribute);
  104 | }
  105 |
  106 | /**
  107 |  * CSSスタイルを確認
  108 |  */
  109 | export async function getComputedStyle(page: Page, selector: string, property: string): Promise<string> {
  110 |   return page.$eval(selector, (el, prop) => {
  111 |     return window.getComputedStyle(el).getPropertyValue(prop);
  112 |   }, property);
  113 | }
  114 |
  115 | /**
  116 |  * イベントをモック
```
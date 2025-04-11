/**
 * PlaywrightでのE2Eテストのテンプレート
 * 
 * 使用方法：
 * 1. このファイルを適切なディレクトリにコピー
 * 2. ファイル名を "[機能名].e2e.test.ts" に変更
 * 3. FIXME コメントを検索して必要な情報に置き換える
 */

import { test, expect } from '@playwright/test';
// FIXME: 必要に応じて追加のユーティリティを読み込む
// import { testUser, loginUser } from '../utils/test-helpers';

// テスト実行前の共通処理
// FIXME: テスト前の共通処理が必要な場合は、追加
// test.beforeAll(async ({ browser }) => {
//   // 全テスト前の1回だけ実行される処理
// });

// 各テストケース前の共通処理
// test.beforeEach(async ({ page }) => {
//   // 各テスト前に実行される処理
// });

// 基本的なユーザーフローのテスト
test('FIXME: 基本的なユーザーフローのテスト', async ({ page }) => {
  // ページにアクセス
  // FIXME: テスト対象のURLに変更
  await page.goto('http://localhost:3000/');
  
  // ページタイトルの確認
  // FIXME: 期待されるタイトルに変更
  await expect(page).toHaveTitle(/ShiftWith/);
  
  // ナビゲーション
  // FIXME: ナビゲーション部分を実際のセレクタに変更
  // await page.click('text=ログイン');
  
  // フォーム入力
  // FIXME: フォーム入力部分を実際のセレクタに変更
  // await page.fill('[data-testid="email"]', 'test@example.com');
  // await page.fill('[data-testid="password"]', 'testpassword');
  // await page.click('[data-testid="login-button"]');
  
  // ログイン後のリダイレクト確認
  // FIXME: リダイレクト先URLを実際のURLに変更
  // await expect(page).toHaveURL(/dashboard/);
  
  // ダッシュボード要素の確認
  // FIXME: ダッシュボード上の要素を実際のセレクタに変更
  // await expect(page.locator('[data-testid="welcome-message"]')).toContainText('ようこそ');
});

// 認証フローのテスト
test('FIXME: 認証フローのテスト', async ({ page }) => {
  // サインアップフロー
  // FIXME: サインアップページのURLに変更
  // await page.goto('http://localhost:3000/signup');
  
  // ランダムなメールアドレス生成（テストの再実行用）
  // const randomEmail = `test-${Date.now()}@example.com`;
  
  // サインアップフォーム入力
  // FIXME: サインアップフォームのセレクタに変更
  // await page.fill('[data-testid="name"]', 'テストユーザー');
  // await page.fill('[data-testid="email"]', randomEmail);
  // await page.fill('[data-testid="password"]', 'testpassword123');
  // await page.fill('[data-testid="password-confirm"]', 'testpassword123');
  // await page.click('[data-testid="signup-button"]');
  
  // 確認ページへのリダイレクト
  // FIXME: 確認ページのURLパターンに変更
  // await expect(page).toHaveURL(/confirmation/);
  
  // ログインページに移動
  // await page.goto('http://localhost:3000/login');
  
  // 新規作成したアカウントでログイン
  // await page.fill('[data-testid="email"]', randomEmail);
  // await page.fill('[data-testid="password"]', 'testpassword123');
  // await page.click('[data-testid="login-button"]');
  
  // ダッシュボードへのリダイレクト確認
  // await expect(page).toHaveURL(/dashboard/);
  
  // ログイン状態の確認
  // await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});

// フォーム検証のテスト
test('FIXME: フォーム検証のテスト', async ({ page }) => {
  // フォームページにアクセス
  // FIXME: フォームページのURLに変更
  // await page.goto('http://localhost:3000/form');
  
  // 空のフォーム送信
  // FIXME: 送信ボタンのセレクタに変更
  // await page.click('[data-testid="submit-button"]');
  
  // 検証エラーの確認
  // FIXME: エラーメッセージのセレクタに変更
  // await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
  // await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  
  // 無効なデータ入力
  // await page.fill('[data-testid="email"]', 'invalid-email');
  // await page.click('[data-testid="submit-button"]');
  
  // 特定のエラーメッセージを確認
  // await expect(page.locator('[data-testid="email-error"]')).toContainText('有効なメールアドレス');
  
  // 有効なデータ入力
  // await page.fill('[data-testid="name"]', 'テスト名');
  // await page.fill('[data-testid="email"]', 'valid@example.com');
  // await page.click('[data-testid="submit-button"]');
  
  // 成功メッセージ確認
  // await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});

// 複数ページにまたがるワークフロー
test('FIXME: 複数ページにまたがるワークフローのテスト', async ({ page }) => {
  // ステップ1: ホームページ
  // FIXME: ホームページURLに変更
  // await page.goto('http://localhost:3000/');
  
  // ステップ2: カテゴリページへ移動
  // FIXME: カテゴリリンクのセレクタに変更
  // await page.click('[data-testid="category-link"]');
  // await expect(page).toHaveURL(/categories/);
  
  // ステップ3: 商品詳細ページへ移動
  // FIXME: 商品リンクのセレクタに変更
  // await page.click('[data-testid="product-1"]');
  // await expect(page).toHaveURL(/products\/1/);
  
  // ステップ4: カートに追加
  // FIXME: カート追加ボタンのセレクタに変更
  // await page.click('[data-testid="add-to-cart"]');
  // await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  
  // ステップ5: カートページへ移動
  // FIXME: カートリンクのセレクタに変更
  // await page.click('[data-testid="cart-link"]');
  // await expect(page).toHaveURL(/cart/);
  
  // ステップ6: チェックアウトへ進む
  // FIXME: チェックアウトボタンのセレクタに変更
  // await page.click('[data-testid="checkout-button"]');
  // await expect(page).toHaveURL(/checkout/);
});

// APIとの連携テスト
test('FIXME: APIとの連携テスト', async ({ page }) => {
  // テスト用のAPIレスポンスをモック（オプション）
  // FIXME: 必要に応じてAPIモックを設定
  // await page.route('**/api/data', route => {
  //   route.fulfill({
  //     status: 200,
  //     contentType: 'application/json',
  //     body: JSON.stringify({ items: [{ id: 1, name: 'モックアイテム' }] })
  //   });
  // });
  
  // データページにアクセス
  // FIXME: データページのURLに変更
  // await page.goto('http://localhost:3000/data');
  
  // データ読み込みの開始
  // FIXME: 読み込みボタンのセレクタに変更
  // await page.click('[data-testid="load-data"]');
  
  // ローディング状態の確認
  // FIXME: ローディング表示のセレクタに変更
  // await expect(page.locator('[data-testid="loading"]')).toBeVisible();
  
  // データ表示の確認
  // FIXME: データ表示のセレクタに変更
  // await expect(page.locator('[data-testid="data-item"]')).toBeVisible();
  // await expect(page.locator('[data-testid="data-item"]')).toContainText('モックアイテム');
});

// レスポンシブデザインテスト
test('FIXME: レスポンシブデザインテスト', async ({ page }) => {
  // モバイルサイズに設定
  // FIXME: テスト対象のURIに変更
  // await page.setViewportSize({ width: 375, height: 667 });
  // await page.goto('http://localhost:3000/');
  
  // モバイルメニューの確認
  // FIXME: モバイルメニューのセレクタに変更
  // await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
  // await expect(page.locator('[data-testid="desktop-nav"]')).toBeHidden();
  
  // モバイルメニューを開く
  // await page.click('[data-testid="mobile-menu-button"]');
  // await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  
  // タブレットサイズに変更
  // await page.setViewportSize({ width: 768, height: 1024 });
  
  // タブレット表示の確認
  // FIXME: タブレット表示のセレクタに変更
  // await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
  
  // デスクトップサイズに変更
  // await page.setViewportSize({ width: 1280, height: 800 });
  
  // デスクトップ表示の確認
  // FIXME: デスクトップ表示のセレクタに変更
  // await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
  // await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeHidden();
});

// アクセシビリティテスト
test('FIXME: アクセシビリティテスト', async ({ page }) => {
  // ページにアクセス
  // FIXME: テスト対象のURLに変更
  // await page.goto('http://localhost:3000/');
  
  // アクセシビリティの検証（Playwrightのスナップショット機能を使用）
  // FIXME: 主要なセマンティック要素の存在確認
  // await expect(page.locator('header')).toBeVisible();
  // await expect(page.locator('main')).toBeVisible();
  // await expect(page.locator('footer')).toBeVisible();
  
  // キーボードナビゲーションのテスト
  // await page.keyboard.press('Tab');
  // await expect(page.locator(':focus')).toBeVisible();
  
  // 複数回のTab移動でフォーカス移動を確認
  // for (let i = 0; i < 5; i++) {
  //   await page.keyboard.press('Tab');
  //   await expect(page.locator(':focus')).toBeVisible();
  // }
  
  // スクリーンリーダー用の属性確認
  // FIXME: aria属性を持つ要素の確認
  // await expect(page.locator('[aria-label]')).toBeVisible();
  // await expect(page.locator('[role]')).toBeVisible();
});

// エラー状態のテスト
test('FIXME: エラー状態のテスト', async ({ page }) => {
  // 存在しないページへのアクセス
  // FIXME: 存在しないURLに変更
  // await page.goto('http://localhost:3000/not-found-page');
  
  // 404エラーページの確認
  // FIXME: 404ページのセレクタに変更
  // await expect(page.locator('[data-testid="error-code"]')).toContainText('404');
  // await expect(page.locator('[data-testid="error-message"]')).toContainText('ページが見つかりません');
  
  // ホームへ戻るリンクの確認
  // FIXME: ホームリンクのセレクタに変更
  // await page.click('[data-testid="home-link"]');
  // await expect(page).toHaveURL('/');
}); 
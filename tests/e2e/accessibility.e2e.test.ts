import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { AxeBuilder } from '@axe-core/playwright';

// MCPサーバーのベースURL
const BASE_URL = 'http://localhost:3000';

// ページのURLリスト
const pages = [
  { path: '/', name: 'ホームページ' },
  { path: '/dashboard', name: 'ダッシュボード' },
  { path: '/quiz', name: 'ギバー診断' },
  { path: '/materials', name: '教材一覧' }
];

// 認証が必要なページ
const protectedPages = ['/dashboard'];

test.describe('アクセシビリティテスト', () => {
  // 長時間実行のテストのためにタイムアウトを設定
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    try {
      // ページの読み込みを待つ
      await page.goto(`${BASE_URL}/`);
      
      // 各種状態の読み込みを待つ
      await Promise.all([
        page.waitForLoadState('domcontentloaded'),
        page.waitForLoadState('load'),
        page.waitForLoadState('networkidle')
      ]);

      // axe-coreを注入
      await injectAxe(page);
      
      // axe-coreの初期化を待つ
      await page.waitForFunction(() => window.hasOwnProperty('axe'));

      console.log('✅ テスト環境のセットアップが完了しました');
    } catch (error) {
      console.error('❌ セットアップ中にエラーが発生:', error);
      throw error;
    }
  });

  // 認証が必要なページへのアクセステスト
  test('認証が必要なページへのアクセス', async ({ page }) => {
    for (const protectedPath of protectedPages) {
      console.log(`🔒 ${protectedPath} へのアクセスをテスト中...`);
      
      // 未認証状態でアクセス
      await page.goto(`${BASE_URL}${protectedPath}`);
      
      // ログインページにリダイレクトされることを確認
      expect(page.url()).toContain('/login');
      console.log(`✅ 正しくログインページにリダイレクトされました`);
    }
  });

  // ホームページのアクセシビリティテスト
  test('ホームページのアクセシビリティテスト', async ({ page }) => {
    console.log('🔍 ホームページの基本アクセシビリティテストを開始します...');
    
    await page.goto(BASE_URL);
    
    try {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a'])  // WCAG 2.0 Level Aのみに制限
        .disableRules(['color-contrast']) // カラーコントラストチェックを無効化
        .analyze();

      // 重要な違反のみを確認
      const criticalViolations = accessibilityScanResults.violations.filter(
        violation => violation.impact === 'critical'
      );

      expect(criticalViolations).toEqual([]);
      console.log('✅ ホームページは基本的なアクセシビリティ基準を満たしています');
    } catch (error) {
      console.error('❌ ホームページのテスト失敗:', error);
      throw error;
    }
  });

  // 各ページのアクセシビリティテスト
  for (const { path, name } of pages) {
    if (!protectedPages.includes(path)) {
      test(`${name}ページのアクセシビリティテスト`, async ({ page }) => {
        console.log(`🔍 ${name}ページのアクセシビリティテストを開始します...`);
        
        await page.goto(`${BASE_URL}${path}`);
        
        try {
          const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a'])  // WCAG 2.0 Level Aのみに制限
            .disableRules(['color-contrast']) // カラーコントラストチェックを無効化
            .analyze();

          // 重要な違反のみを確認
          const criticalViolations = accessibilityScanResults.violations.filter(
            violation => violation.impact === 'critical'
          );

          if (criticalViolations.length > 0) {
            console.log(`⚠️ ${name}ページで重要なアクセシビリティ違反が見つかりました:`);
            criticalViolations.forEach((violation) => {
              console.log(`- ${violation.help}: ${violation.description}`);
            });
          }

          expect(criticalViolations).toEqual([]);
          console.log(`✅ ${name}ページは基本的なアクセシビリティ基準を満たしています`);
        } catch (error) {
          console.error(`❌ ${name}ページのテスト失敗:`, error);
          throw error;
        }
      });
    }
  }
}); 
import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Playwrightのグローバルセットアップ
 * テスト実行前に一度だけ実行される処理
 * 
 * @param config Playwrightの設定
 */
async function globalSetup(config: FullConfig) {
  // 認証情報を保存するディレクトリを作成
  const authDir = path.join(__dirname, '..', 'playwright-auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // ログイン状態を作成して保存（テストごとに再利用できるようにする）
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // ログインページにアクセス
  await page.goto(`${baseURL}/login`);

  try {
    // テスト用アカウントでログイン
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ダッシュボードに遷移するまで待機
    await page.waitForURL('**/dashboard');

    // 認証情報をファイルに保存
    await page.context().storageState({ 
      path: path.join(authDir, 'admin.json') 
    });
    
    console.log('✓ 認証情報を保存しました');
  } catch (error) {
    console.log('✗ 認証情報の保存に失敗しました:', error);
  } finally {
    await browser.close();
  }
}

export default globalSetup; 
import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Playwrightのグローバルティアダウン
 * テスト実行後に一度だけ実行される処理
 * 
 * @param config Playwrightの設定
 */
async function globalTeardown(config: FullConfig) {
  // テスト後のクリーンアップ処理
  console.log('✓ テスト実行が完了しました');
  
  // テスト実行で作成した一時ファイルの削除など
  try {
    const tmpDir = path.join(__dirname, '..', 'playwright-tmp');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('一時ファイルの削除に失敗しました:', error);
  }
}

export default globalTeardown; 
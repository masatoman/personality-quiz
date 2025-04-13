#!/usr/bin/env node

/**
 * コロケーション方式への移行スクリプト
 * 
 * 使用方法:
 * npm run migrate:tests -- --components
 * npm run migrate:tests -- --utils
 * npm run migrate:tests -- --all
 * npm run migrate:tests -- --dry-run
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 設定
const CONFIG = {
  // ソースディレクトリ
  rootDir: path.resolve(__dirname, '../../../'),
  srcDir: path.resolve(__dirname, '../../../src'),
  
  // テストディレクトリ
  componentsTestsDir: path.resolve(__dirname, '../../../src/components/__tests__'),
  utilsTestsDir: path.resolve(__dirname, '../../../src/utils/__tests__'),
  appTestsDir: path.resolve(__dirname, '../../../src/app/__tests__'),
  
  // ターゲットディレクトリ
  componentsDir: path.resolve(__dirname, '../../../src/components'),
  utilsDir: path.resolve(__dirname, '../../../src/utils'),
  
  // ログファイル
  logFile: path.resolve(__dirname, '../../../migration-log.json'),
};

// ログ管理
const MigrationLog = {
  entries: [] as Array<{
    sourceFile: string;
    targetFile: string;
    status: 'success' | 'error';
    error?: string;
  }>,
  
  add(entry: { sourceFile: string; targetFile: string; status: 'success' | 'error'; error?: string }) {
    this.entries.push(entry);
    this.save();
  },
  
  save() {
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(this.entries, null, 2));
  },
  
  load() {
    if (fs.existsSync(CONFIG.logFile)) {
      this.entries = JSON.parse(fs.readFileSync(CONFIG.logFile, 'utf8'));
    }
  },
  
  printSummary() {
    const total = this.entries.length;
    const succeeded = this.entries.filter(e => e.status === 'success').length;
    const failed = total - succeeded;
    
    console.log('\n==== 移行サマリー ====');
    console.log(`合計ファイル数: ${total}`);
    console.log(`成功: ${succeeded}`);
    console.log(`失敗: ${failed}`);
    console.log('詳細ログ:', CONFIG.logFile);
    
    if (failed > 0) {
      console.log('\n==== 失敗したファイル ====');
      this.entries
        .filter(e => e.status === 'error')
        .forEach(e => {
          console.log(`- ${e.sourceFile} => ${e.targetFile}`);
          console.log(`  エラー: ${e.error}`);
        });
    }
  }
};

/**
 * コマンドライン引数の解析
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    migrateComponents: args.includes('--components') || args.includes('--all'),
    migrateUtils: args.includes('--utils') || args.includes('--all'),
    dryRun: args.includes('--dry-run'),
  };
}

/**
 * ディレクトリが存在することを確認
 */
function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * テストファイルのソースファイルパスを特定
 */
function findSourceFilePath(testFilePath: string): string | null {
  // テストファイル名からソースファイル名を抽出
  const filename = path.basename(testFilePath);
  const sourceFileName = filename
    .replace('.test.tsx', '.tsx')
    .replace('.test.ts', '.ts')
    .replace('.unit.test.ts', '.ts')
    .replace('.integration.test.tsx', '.tsx');
  
  // ソースファイルの候補パスを生成
  const componentName = sourceFileName.replace('.tsx', '').replace('.ts', '');
  const possiblePaths = [
    path.join(CONFIG.componentsDir, `${componentName}.tsx`),
    path.join(CONFIG.componentsDir, `${componentName}.ts`),
    path.join(CONFIG.componentsDir, componentName, 'index.tsx'),
    path.join(CONFIG.componentsDir, componentName, 'index.ts'),
    path.join(CONFIG.utilsDir, `${componentName}.ts`),
    path.join(CONFIG.utilsDir, componentName, 'index.ts'),
  ];
  
  // パスの存在チェック
  for (const candidatePath of possiblePaths) {
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }
  
  return null;
}

/**
 * テストファイルの新しい配置先を決定
 */
function determineTargetPath(testFilePath: string, sourceFilePath: string): string {
  const filename = path.basename(testFilePath);
  const sourceDir = path.dirname(sourceFilePath);
  
  // ソースファイルがindex.tsxの場合
  if (path.basename(sourceFilePath) === 'index.tsx' || path.basename(sourceFilePath) === 'index.ts') {
    return path.join(sourceDir, filename);
  }
  
  // ソースファイルが直接配置されている場合
  const sourceFileName = path.basename(sourceFilePath);
  const componentName = sourceFileName.replace('.tsx', '').replace('.ts', '');
  const componentDir = path.join(path.dirname(sourceFilePath), componentName);
  
  ensureDirectoryExists(componentDir);
  
  // ソースファイルをindex.tsxとして移動すべきか
  const shouldMoveSource = !fs.existsSync(path.join(componentDir, 'index.tsx')) &&
                          !fs.existsSync(path.join(componentDir, 'index.ts'));
  
  if (shouldMoveSource && !CONFIG.dryRun) {
    const sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
    const newSourcePath = path.join(componentDir, `index${path.extname(sourceFilePath)}`);
    
    fs.writeFileSync(newSourcePath, sourceContent);
    
    // ソースファイルの移動を報告
    console.log(`ソースファイルを移動: ${sourceFilePath} => ${newSourcePath}`);
    
    // 古いソースファイルの削除か保持はプロジェクトポリシーによる
    // ここでは保持する方針とする
  }
  
  return path.join(componentDir, filename);
}

/**
 * テストファイルの内容を更新
 */
function updateImportPaths(content: string, oldPath: string, newPath: string): string {
  // 相対パスをの調整
  // 複雑なインポートパス修正は実際のプロジェクトに合わせて実装する必要あり
  const newContent = content.replace(
    /from ['"]..\/..\/components\//g,
    'from \'../../../components/'
  ).replace(
    /from ['"]..\/..\/utils\//g,
    'from \'../../../utils/'
  );
  
  return newContent;
}

/**
 * テストファイルの移行処理
 */
function migrateTestFile(testFilePath: string) {
  try {
    console.log(`処理中: ${testFilePath}`);
    
    // ソースファイルの特定
    const sourceFilePath = findSourceFilePath(testFilePath);
    if (!sourceFilePath) {
      throw new Error('ソースファイルが見つかりません');
    }
    
    // ターゲットパスの決定
    const targetPath = determineTargetPath(testFilePath, sourceFilePath);
    
    // ドライランモードの場合は実際の移行はしない
    if (CONFIG.dryRun) {
      console.log(`[ドライラン] ${testFilePath} => ${targetPath}`);
      MigrationLog.add({ sourceFile: testFilePath, targetFile: targetPath, status: 'success' });
      return;
    }
    
    // ディレクトリの作成
    ensureDirectoryExists(path.dirname(targetPath));
    
    // ファイル内容の更新とコピー
    const content = fs.readFileSync(testFilePath, 'utf8');
    const updatedContent = updateImportPaths(content, testFilePath, targetPath);
    fs.writeFileSync(targetPath, updatedContent);
    
    console.log(`移行成功: ${testFilePath} => ${targetPath}`);
    MigrationLog.add({ sourceFile: testFilePath, targetFile: targetPath, status: 'success' });
  } catch (error) {
    console.error(`エラー (${testFilePath}):`, error);
    MigrationLog.add({ 
      sourceFile: testFilePath,
      targetFile: 'unknown',
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * 指定ディレクトリからテストファイルを検索して移行
 */
function migrateTestFilesInDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    console.log(`ディレクトリが存在しません: ${dir}`);
    return;
  }
  
  const processDirectory = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.isFile() && 
                (entry.name.endsWith('.test.tsx') || 
                 entry.name.endsWith('.test.ts') ||
                 entry.name.endsWith('.unit.test.ts') ||
                 entry.name.endsWith('.integration.test.tsx'))) {
        migrateTestFile(fullPath);
      }
    }
  };
  
  processDirectory(dir);
}

/**
 * メイン実行関数
 */
function main() {
  MigrationLog.load();
  
  const { migrateComponents, migrateUtils, dryRun } = parseArgs();
  
  console.log('===== テストファイル移行ツール =====');
  console.log(`モード: ${dryRun ? 'ドライラン (実際の移行は行いません)' : '実行'}`);
  
  if (migrateComponents) {
    console.log('\n=== コンポーネントテストの移行 ===');
    migrateTestFilesInDirectory(CONFIG.componentsTestsDir);
  }
  
  if (migrateUtils) {
    console.log('\n=== ユーティリティテストの移行 ===');
    migrateTestFilesInDirectory(CONFIG.utilsTestsDir);
  }
  
  MigrationLog.printSummary();
}

// スクリプト実行
main(); 
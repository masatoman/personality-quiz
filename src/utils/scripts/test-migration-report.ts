#!/usr/bin/env node

/**
 * テストファイル移行状況レポート生成スクリプト
 * 
 * 使用方法:
 * npm run migration:report
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

// 設定
const CONFIG = {
  rootDir: path.resolve(__dirname, '../../../'),
  srcDir: path.resolve(__dirname, '../../../src'),
  logFile: path.resolve(__dirname, '../../../migration-log.json'),
  reportFile: path.resolve(__dirname, '../../../migration-report.md'),
};

interface MigrationEntry {
  sourceFile: string;
  targetFile: string;
  status: 'success' | 'error';
  error?: string;
}

interface DirectoryStats {
  total: number;
  migrated: number;
  remaining: number;
  percentage: number;
}

// ログデータ読み込み
function loadMigrationLog(): MigrationEntry[] {
  if (fs.existsSync(CONFIG.logFile)) {
    return JSON.parse(fs.readFileSync(CONFIG.logFile, 'utf8'));
  }
  return [];
}

// テストファイル数のカウント
function countTestFiles(): Record<string, DirectoryStats> {
  // 現在の__tests__ディレクトリ内のテストファイル
  const legacyTestFiles = {
    components: glob.sync(path.join(CONFIG.srcDir, 'components/__tests__/**/*.test.{ts,tsx}')),
    utils: glob.sync(path.join(CONFIG.srcDir, 'utils/__tests__/**/*.test.{ts,tsx}')),
    app: glob.sync(path.join(CONFIG.srcDir, 'app/__tests__/**/*.test.{ts,tsx}')),
    hooks: glob.sync(path.join(CONFIG.srcDir, 'hooks/__tests__/**/*.test.{ts,tsx}')),
    lib: glob.sync(path.join(CONFIG.srcDir, 'lib/__tests__/**/*.test.{ts,tsx}')),
  };

  // コロケーション方式のテストファイル
  const colocationTestFiles = {
    components: glob.sync(path.join(CONFIG.srcDir, 'components/**/*.test.{ts,tsx}'), { ignore: ['**/components/__tests__/**'] }),
    utils: glob.sync(path.join(CONFIG.srcDir, 'utils/**/*.test.{ts,tsx}'), { ignore: ['**/utils/__tests__/**'] }),
    app: glob.sync(path.join(CONFIG.srcDir, 'app/**/*.test.{ts,tsx}'), { ignore: ['**/app/__tests__/**'] }),
    hooks: glob.sync(path.join(CONFIG.srcDir, 'hooks/**/*.test.{ts,tsx}'), { ignore: ['**/hooks/__tests__/**'] }),
    lib: glob.sync(path.join(CONFIG.srcDir, 'lib/**/*.test.{ts,tsx}'), { ignore: ['**/lib/__tests__/**'] }),
  };

  const stats: Record<string, DirectoryStats> = {};
  
  for (const [dir, files] of Object.entries(legacyTestFiles)) {
    const legacyCount = files.length;
    const colocationCount = colocationTestFiles[dir as keyof typeof colocationTestFiles].length;
    const total = legacyCount + colocationCount;
    const percentage = total > 0 ? Math.round((colocationCount / total) * 100) : 0;
    
    stats[dir] = {
      total,
      migrated: colocationCount,
      remaining: legacyCount,
      percentage,
    };
  }
  
  return stats;
}

// マークダウンレポート生成
function generateMarkdownReport(stats: Record<string, DirectoryStats>, migrationLog: MigrationEntry[]): string {
  const successCount = migrationLog.filter(entry => entry.status === 'success').length;
  const errorCount = migrationLog.filter(entry => entry.status === 'error').length;
  
  const report = [
    '# テストファイル移行状況レポート',
    '',
    `生成日時: ${new Date().toLocaleString('ja-JP')}`,
    '',
    '## 移行進捗サマリー',
    '',
    '| ディレクトリ | 合計テスト数 | 移行済み | 残り | 進捗率 |',
    '|------------|------------|---------|------|--------|',
  ];
  
  let totalFiles = 0;
  let totalMigrated = 0;
  
  for (const [dir, stat] of Object.entries(stats)) {
    report.push(`| ${dir} | ${stat.total} | ${stat.migrated} | ${stat.remaining} | ${stat.percentage}% |`);
    totalFiles += stat.total;
    totalMigrated += stat.migrated;
  }
  
  const totalPercentage = totalFiles > 0 ? Math.round((totalMigrated / totalFiles) * 100) : 0;
  
  report.push('|------------|------------|---------|------|--------|');
  report.push(`| **合計** | **${totalFiles}** | **${totalMigrated}** | **${totalFiles - totalMigrated}** | **${totalPercentage}%** |`);
  
  report.push('',
    '## 移行履歴',
    '',
    `- 移行成功: ${successCount}`,
    `- 移行失敗: ${errorCount}`,
    '');
  
  if (errorCount > 0) {
    report.push('### 失敗したファイル',
      '',
      '| ソースファイル | ターゲットファイル | エラー |',
      '|--------------|-----------------|--------|');
    
    migrationLog
      .filter(entry => entry.status === 'error')
      .forEach(entry => {
        const relativeSource = path.relative(CONFIG.rootDir, entry.sourceFile);
        const relativeTarget = entry.targetFile === 'unknown' ? '不明' : path.relative(CONFIG.rootDir, entry.targetFile);
        report.push(`| ${relativeSource} | ${relativeTarget} | ${entry.error} |`);
      });
  }
  
  report.push('',
    '## 次のステップ',
    '',
    '1. 残りのテストファイルを移行するには:',
    '```',
    'npm run migrate:tests -- --components  # コンポーネントテストの移行',
    'npm run migrate:tests -- --utils       # ユーティリティテストの移行',
    'npm run migrate:tests -- --all         # すべてのテストの移行',
    '```',
    '',
    '2. 移行をドライランで確認するには:',
    '```',
    'npm run migrate:tests:dry              # 実際の移行は行わず結果のみ確認',
    '```',
    '');
  
  return report.join('\n');
}

// コンソール出力
function printReport(stats: Record<string, DirectoryStats>) {
  console.log('\n===== テストファイル移行状況レポート =====\n');
  
  let totalFiles = 0;
  let totalMigrated = 0;
  
  for (const [dir, stat] of Object.entries(stats)) {
    const percentage = stat.percentage;
    let statusColor = '';
    if (percentage >= 80) {
      statusColor = '\x1b[32m'; // 緑
    } else if (percentage >= 50) {
      statusColor = '\x1b[33m'; // 黄
    } else {
      statusColor = '\x1b[31m'; // 赤
    }
    const resetColor = '\x1b[0m';
    
    console.log(`${dir}:`);
    console.log(`  合計テスト数: ${stat.total}`);
    console.log(`  移行済み: ${stat.migrated}`);
    console.log(`  残り: ${stat.remaining}`);
    console.log(`  進捗率: ${statusColor}${percentage}%${resetColor}\n`);
    
    totalFiles += stat.total;
    totalMigrated += stat.migrated;
  }
  
  const totalPercentage = totalFiles > 0 ? Math.round((totalMigrated / totalFiles) * 100) : 0;
  let totalStatusColor = '';
  if (totalPercentage >= 80) {
    totalStatusColor = '\x1b[32m'; // 緑
  } else if (totalPercentage >= 50) {
    totalStatusColor = '\x1b[33m'; // 黄
  } else {
    totalStatusColor = '\x1b[31m'; // 赤
  }
  const resetColor = '\x1b[0m';
  
  console.log('合計:');
  console.log(`  合計テスト数: ${totalFiles}`);
  console.log(`  移行済み: ${totalMigrated}`);
  console.log(`  残り: ${totalFiles - totalMigrated}`);
  console.log(`  全体進捗率: ${totalStatusColor}${totalPercentage}%${resetColor}\n`);
  
  console.log('次のステップ:');
  const cyanColor = '\x1b[36m';
  console.log(`  残りのテストファイルを移行するには: ${cyanColor}npm run migrate:tests -- --all${resetColor}`);
  console.log(`  詳細レポートを確認するには: ${cyanColor}cat ${path.relative(process.cwd(), CONFIG.reportFile)}${resetColor}\n`);
}

// メイン関数
function main() {
  try {
    const migrationLog = loadMigrationLog();
    const stats = countTestFiles();
    
    // マークダウンレポート生成
    const report = generateMarkdownReport(stats, migrationLog);
    fs.writeFileSync(CONFIG.reportFile, report);
    
    // コンソール出力
    printReport(stats);
    
    console.log(`\x1b[32mレポートを生成しました: ${path.relative(process.cwd(), CONFIG.reportFile)}\x1b[0m`);
  } catch (error) {
    console.error('\x1b[31mエラー:\x1b[0m', error);
    process.exit(1);
  }
}

// スクリプト実行
main(); 
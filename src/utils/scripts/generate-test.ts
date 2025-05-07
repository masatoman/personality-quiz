#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

/**
 * テストファイル生成スクリプト
 * 
 * 使用方法:
 * npm run generate:test -- --component=ComponentName
 * npm run generate:test -- --util=UtilityName
 * npm run generate:test -- --integration=FeatureName
 * npm run generate:test -- --e2e=FlowName
 * npm run generate:test -- --cypress=FeatureName
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// テンプレートのパス
const TEMPLATE_PATHS = {
  unit: path.resolve(__dirname, '../test-templates/unit-test.template.ts'),
  component: path.resolve(__dirname, '../test-templates/component-test.template.tsx'),
  integration: path.resolve(__dirname, '../test-templates/integration-test.template.tsx'),
  e2e: path.resolve(__dirname, '../../tests/e2e/templates/e2e-test.template.ts'),
  cypress: path.resolve(__dirname, '../../cypress/support/templates/cypress-test.template.ts'),
};

// 出力先のパス
const OUTPUT_PATHS = {
  component: (name: string) => path.resolve(__dirname, `../../components/${name.toLowerCase()}/test/${name}.test.tsx`),
  util: (name: string) => path.resolve(__dirname, `../../utils/${name.toLowerCase()}/test/${name}.unit.test.ts`),
  integration: (name: string) => path.resolve(__dirname, `../../app/__tests__/${name}.integration.test.tsx`),
  e2e: (name: string) => path.resolve(__dirname, `../../tests/e2e/${name}.e2e.test.ts`),
  cypress: (name: string) => path.resolve(__dirname, `../../cypress/e2e/${name}.cy.ts`),
};

/**
 * コマンドライン引数の解析
 */
function parseArgs(): { type: string, name: string } | null {
  const args = process.argv.slice(2);
  
  for (const arg of args) {
    // 引数の形式: --type=name
    const match = arg.match(/^--([a-zA-Z]+)=(.+)$/);
    if (match) {
      const [, type, name] = match;
      return { type, name };
    }
  }
  
  return null;
}

/**
 * 出力ディレクトリの作成
 */
function ensureDirectoryExists(filePath: string): void {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return;
  
  console.log(`ディレクトリを作成: ${dirname}`);
  fs.mkdirSync(dirname, { recursive: true });
}

/**
 * テンプレートをコピーしてテストファイル生成
 */
function generateTestFile(type: string, name: string): void {
  let templatePath: string;
  let outputPath: string;
  
  // テンプレートと出力先の決定
  switch (type) {
    case 'component':
      templatePath = TEMPLATE_PATHS.component;
      outputPath = OUTPUT_PATHS.component(name);
      break;
    case 'util':
      templatePath = TEMPLATE_PATHS.unit;
      outputPath = OUTPUT_PATHS.util(name);
      break;
    case 'integration':
      templatePath = TEMPLATE_PATHS.integration;
      outputPath = OUTPUT_PATHS.integration(name);
      break;
    case 'e2e':
      templatePath = TEMPLATE_PATHS.e2e;
      outputPath = OUTPUT_PATHS.e2e(name);
      break;
    case 'cypress':
      templatePath = TEMPLATE_PATHS.cypress;
      outputPath = OUTPUT_PATHS.cypress(name);
      break;
    default:
      console.error(`エラー: 不明なテストタイプ '${type}'`);
      process.exit(1);
  }
  
  // テンプレートファイルの存在確認
  if (!fs.existsSync(templatePath)) {
    console.error(`エラー: テンプレートが見つかりません: ${templatePath}`);
    process.exit(1);
  }
  
  // 出力ディレクトリの作成
  ensureDirectoryExists(outputPath);
  
  // 既存ファイルの確認
  if (fs.existsSync(outputPath)) {
    const override = process.env.FORCE_OVERRIDE === 'true';
    if (!override) {
      console.error(`エラー: ファイルは既に存在します: ${outputPath}`);
      console.error('上書きするには FORCE_OVERRIDE=true を設定してください。');
      process.exit(1);
    }
    console.warn(`警告: 既存のファイルを上書きします: ${outputPath}`);
  }
  
  // テンプレートの読み込みとコピー
  let templateContent = fs.readFileSync(templatePath, 'utf8');
  
  // テンプレート内の変数置換
  templateContent = templateContent.replace(/FIXME: テスト対象の名前/g, name);
  templateContent = templateContent.replace(/FIXME: 機能名/g, name);
  
  // ファイルの書き込み
  fs.writeFileSync(outputPath, templateContent, 'utf8');
  console.log(`テストファイルを生成しました: ${outputPath}`);
  
  // VSCodeでファイルを開く（オプション）
  try {
    execSync(`code ${outputPath}`);
    console.log('VSCodeでファイルが開かれました。');
  } catch (error) {
    console.log('VSCodeが利用できないか、ファイルを開くことができませんでした。');
  }
}

/**
 * メイン実行関数
 */
function main(): void {
  const args = parseArgs();
  
  if (!args) {
    console.error('使用方法:');
    console.error('  npm run generate:test -- --component=ComponentName');
    console.error('  npm run generate:test -- --util=UtilityName');
    console.error('  npm run generate:test -- --integration=FeatureName');
    console.error('  npm run generate:test -- --e2e=FlowName');
    console.error('  npm run generate:test -- --cypress=FeatureName');
    process.exit(1);
  }
  
  const { type, name } = args;
  console.log(`テスト生成: ${type} テスト for "${name}"`);
  
  generateTestFile(type, name);
}

// スクリプト実行
main(); 
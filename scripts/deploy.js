#!/usr/bin/env node

/**
 * 🚀 ShiftWith デプロイ自動化スクリプト
 * 
 * 使用方法:
 * npm run deploy:staging  - ステージング環境デプロイ
 * npm run deploy:production - 本番環境デプロイ
 * npm run deploy:rollback staging - ステージングロールバック
 * npm run deploy:rollback production - 本番ロールバック
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

// 設定
const CONFIG = {
  staging: {
    url: 'https://staging.shiftwith.app',
    name: 'ステージング',
    branch: 'develop'
  },
  production: {
    url: 'https://shiftwith-sigma.vercel.app',
    name: '本番',
    branch: 'main'
  }
};

/**
 * コマンド実行
 */
function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    console.error(chalk.red(`❌ コマンド実行エラー: ${command}`));
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * 品質チェック実行
 */
function runQualityChecks() {
  console.log(chalk.blue('🔍 品質チェック開始...'));
  
  const checks = [
    { name: 'TypeScript型チェック', command: 'npm run type-check' },
    { name: 'ESLint', command: 'npm run lint' },
    { name: 'ビルドテスト', command: 'npm run build' },
    { name: '単体テスト', command: 'npm test' }
  ];

  for (const check of checks) {
    console.log(chalk.yellow(`⏳ ${check.name}...`));
    exec(check.command);
    console.log(chalk.green(`✅ ${check.name} 完了`));
  }
  
  console.log(chalk.green('🎉 全品質チェック完了！'));
}

/**
 * 環境の健全性確認
 */
function checkEnvironment(env) {
  const config = CONFIG[env];
  console.log(chalk.blue(`🔍 ${config.name}環境確認...`));
  
  try {
    // 基本接続確認
    exec(`curl -I "${config.url}/" -m 10`, { silent: true });
    console.log(chalk.green(`✅ ${config.name}環境 正常`));
    
    // API確認
    exec(`curl -s "${config.url}/api/profiles" -m 10`, { silent: true });
    console.log(chalk.green(`✅ API 正常`));
    
  } catch (error) {
    console.log(chalk.red(`❌ ${config.name}環境に問題があります`));
    throw error;
  }
}

/**
 * デプロイ実行
 */
function deploy(env) {
  const config = CONFIG[env];
  
  console.log(chalk.blue(`🚀 ${config.name}環境デプロイ開始`));
  console.log(chalk.gray(`対象: ${config.url}`));
  
  // 品質チェック
  if (env === 'production') {
    runQualityChecks();
  }
  
  // 現在のブランチ確認
  const currentBranch = exec('git branch --show-current', { silent: true }).trim();
  if (currentBranch !== config.branch) {
    console.log(chalk.yellow(`⚠️  現在のブランチ: ${currentBranch}`));
    console.log(chalk.yellow(`⚠️  推奨ブランチ: ${config.branch}`));
    
    // 確認プロンプト（本番時のみ）
    if (env === 'production') {
      throw new Error(`本番デプロイは${config.branch}ブランチから実行してください`);
    }
  }
  
  // デプロイ実行
  const deployCommand = env === 'production' ? 'vercel --prod' : 'vercel';
  exec(deployCommand);
  
  console.log(chalk.green(`🎉 ${config.name}環境デプロイ完了！`));
  
  // デプロイ後確認
  setTimeout(() => {
    try {
      checkEnvironment(env);
      console.log(chalk.green(`✅ ${config.name}環境デプロイ成功確認`));
    } catch (error) {
      console.log(chalk.red(`❌ ${config.name}環境デプロイ後確認でエラー`));
      console.log(chalk.yellow('ロールバックを検討してください: npm run deploy:rollback ' + env));
    }
  }, 10000); // 10秒後に確認
}

/**
 * ロールバック実行
 */
function rollback(env) {
  const config = CONFIG[env];
  
  console.log(chalk.red(`🔄 ${config.name}環境ロールバック開始`));
  
  // 確認プロンプト
  console.log(chalk.yellow(`⚠️  ${config.name}環境をロールバックしますか？`));
  console.log(chalk.gray('この操作は取り消せません。'));
  
  // ロールバック実行
  exec(`vercel rollback ${env}`);
  
  console.log(chalk.green(`✅ ${config.name}環境ロールバック完了`));
  
  // ロールバック後確認
  setTimeout(() => {
    checkEnvironment(env);
    console.log(chalk.green(`✅ ${config.name}環境ロールバック成功確認`));
  }, 5000);
}

/**
 * ログ表示
 */
function showLogs(env) {
  const config = CONFIG[env];
  console.log(chalk.blue(`📋 ${config.name}環境ログ表示`));
  exec(`vercel logs ${env} --limit 50`);
}

/**
 * 状態確認
 */
function checkStatus(env) {
  const config = CONFIG[env];
  console.log(chalk.blue(`📊 ${config.name}環境状態確認`));
  
  checkEnvironment(env);
  
  // Vercel情報表示
  exec(`vercel ls ${env}`);
}

/**
 * メイン実行
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];
  
  console.log(chalk.blue('🚀 ShiftWith デプロイツール'));
  console.log(chalk.gray('============================'));
  
  try {
    switch (command) {
      case 'deploy':
        if (!target || !CONFIG[target]) {
          throw new Error('デプロイ対象を指定してください: staging | production');
        }
        deploy(target);
        break;
        
      case 'rollback':
        if (!target || !CONFIG[target]) {
          throw new Error('ロールバック対象を指定してください: staging | production');
        }
        rollback(target);
        break;
        
      case 'logs':
        if (!target || !CONFIG[target]) {
          throw new Error('ログ対象を指定してください: staging | production');
        }
        showLogs(target);
        break;
        
      case 'status':
        if (!target || !CONFIG[target]) {
          throw new Error('状態確認対象を指定してください: staging | production');
        }
        checkStatus(target);
        break;
        
      case 'check':
        runQualityChecks();
        break;
        
      default:
        console.log(chalk.yellow('使用方法:'));
        console.log('  deploy [staging|production]  - デプロイ実行');
        console.log('  rollback [staging|production] - ロールバック実行');
        console.log('  logs [staging|production]     - ログ表示');
        console.log('  status [staging|production]   - 状態確認');
        console.log('  check                         - 品質チェック');
    }
  } catch (error) {
    console.error(chalk.red('❌ エラー:', error.message));
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { deploy, rollback, checkEnvironment, runQualityChecks };

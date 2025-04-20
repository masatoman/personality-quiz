import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { SupabaseClient } from '@supabase/supabase-js';

// エラーメッセージの定義
const ERROR_MESSAGES = {
  ENV_NOT_FOUND: (envPath: string) => 
    `環境変数ファイル ${envPath} が見つかりません。.env.example を参考に作成してください。`,
  MISSING_ENV_VARS: 
    '必要な環境変数が設定されていません。以下を確認してください：\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- SUPABASE_SERVICE_ROLE_KEY',
  MIGRATION_DIR_NOT_FOUND: (dir: string) =>
    `マイグレーションディレクトリ ${dir} が見つかりません。以下を確認してください：\n` +
    '1. プロジェクトルートに migrations ディレクトリが存在するか\n' +
    '2. migrations ディレクトリに .sql ファイルが存在するか',
  FUNCTIONS_DIR_NOT_FOUND: (dir: string) =>
    `関数ディレクトリ ${dir} が見つかりません。以下を確認してください：\n` +
    '1. プロジェクトルートに functions ディレクトリが存在するか\n' +
    '2. functions ディレクトリに .sql ファイルが存在するか'
};

// 環境変数の読み込み
const envPath = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';

if (!fs.existsSync(envPath)) {
  console.error(ERROR_MESSAGES.ENV_NOT_FOUND(envPath));
  process.exit(1);
}

dotenv.config({ path: envPath });
console.log(`✅ ${envPath} から環境変数を読み込みました`);

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error(ERROR_MESSAGES.MISSING_ENV_VARS);
  process.exit(1);
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

/**
 * SQLファイルを実行する
 */
async function executeSqlFile(filePath: string, description: string): Promise<void> {
  try {
    console.log(`🔄 ${description} の適用を開始します...`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const sqlStatements = sqlContent.split(';');
    
    for (const statement of sqlStatements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: trimmedStatement + ';' 
        });
        
        if (error) {
          throw new Error(
            `SQLの実行に失敗しました。以下を確認してください：\n` +
            `- SQLの文法が正しいか\n` +
            `- 必要なテーブルやスキーマが存在するか\n` +
            `エラー詳細: ${error.message}`
          );
        }
      }
    }
    
    console.log(`✅ ${description} が正常に適用されました`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ${description} の適用に失敗しました:`, error.message);
    } else {
      console.error(`❌ ${description} の適用に失敗しました:`, error);
    }
    throw error;
  }
}

/**
 * マイグレーションを適用する
 */
async function applyMigrations(): Promise<void> {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(ERROR_MESSAGES.MIGRATION_DIR_NOT_FOUND(migrationsDir));
  }

  try {
    const files = fs.readdirSync(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql'));

    if (sqlFiles.length === 0) {
      console.log('⚠️ マイグレーションファイルが見つかりませんでした');
      return;
    }

    console.log(`📁 ${sqlFiles.length}個のマイグレーションファイルを実行します`);
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      await executeSqlFile(filePath, `マイグレーション ${file}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ マイグレーションの適用に失敗しました:', error.message);
    } else {
      console.error('❌ マイグレーションの適用に失敗しました:', error);
    }
    throw error;
  }
}

/**
 * データベース関数をデプロイする
 */
async function deployDatabaseFunctions(): Promise<void> {
  const functionsDir = path.join(process.cwd(), 'functions');
  
  if (!fs.existsSync(functionsDir)) {
    throw new Error(ERROR_MESSAGES.FUNCTIONS_DIR_NOT_FOUND(functionsDir));
  }

  try {
    const files = fs.readdirSync(functionsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql'));

    if (sqlFiles.length === 0) {
      console.log('⚠️ データベース関数ファイルが見つかりませんでした');
      return;
    }

    console.log(`📁 ${sqlFiles.length}個のデータベース関数をデプロイします`);
    for (const file of sqlFiles) {
      const filePath = path.join(functionsDir, file);
      await executeSqlFile(filePath, `データベース関数 ${file}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ データベース関数のデプロイに失敗しました:', error.message);
    } else {
      console.error('❌ データベース関数のデプロイに失敗しました:', error);
    }
    throw error;
  }
}

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 データベースのセットアップを開始します...');
    await applyMigrations();
    await deployDatabaseFunctions();
    console.log('✨ データベースのセットアップが完了しました');
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ データベースのセットアップに失敗しました:', error.message);
    } else {
      console.error('❌ データベースのセットアップに失敗しました:', error);
    }
    process.exit(1);
  }
}

// メイン関数の実行
void main(); 
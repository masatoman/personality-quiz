import { z } from 'zod';
import dotenv from 'dotenv';
import chalk from 'chalk';

// 環境変数のスキーマ定義
const envSchema = z.object({
  // アプリケーション基本設定
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  IS_LOCAL_MODE: z.string().transform((val) => val === 'true'),

  // ポート設定
  PORT: z.string().transform(Number),
  SUPABASE_API_PORT: z.string().transform(Number),
  SUPABASE_AUTH_PORT: z.string().transform(Number),
  SUPABASE_STORAGE_PORT: z.string().transform(Number),

  // データベース設定
  DATABASE_URL: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_DB: z.string().min(1),

  // Supabase認証設定
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
});

async function validateEnv() {
  try {
    // .envファイルの読み込み
    dotenv.config();

    // 環境変数の検証
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error(chalk.red('❌ 環境変数の検証に失敗しました'));
      console.error(chalk.yellow('以下のエラーを修正してください：'));
      
      parsed.error.issues.forEach((issue) => {
        console.error(chalk.red(`- ${issue.path.join('.')}: ${issue.message}`));
      });
      
      process.exit(1);
    }

    console.log(chalk.green('✅ 環境変数の検証に成功しました'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ 予期せぬエラーが発生しました：'), error);
    process.exit(1);
  }
}

// スクリプト実行
validateEnv(); 
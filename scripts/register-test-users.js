#!/usr/bin/env node

// Supabaseにテストユーザーを登録するスクリプト
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 環境変数からSupabase設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ADMIN_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません。.envファイルを確認してください。');
  console.error('必要な環境変数: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (または SUPABASE_ADMIN_KEY)');
  process.exit(1);
}

// Supabaseクライアントの初期化（管理者権限）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// テストユーザーのデータ
const testUsers = [
  {
    email: 'giver@example.com',
    password: 'password123',
    user_metadata: {
      name: 'ギバー太郎',
      personality_type: 'giver',
      giver_score: 80
    }
  },
  {
    email: 'matcher@example.com',
    password: 'password123',
    user_metadata: {
      name: 'マッチャー花子',
      personality_type: 'matcher',
      giver_score: 50
    }
  },
  {
    email: 'taker@example.com',
    password: 'password123',
    user_metadata: {
      name: 'テイカー次郎',
      personality_type: 'taker',
      giver_score: 20
    }
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    user_metadata: {
      name: '管理者',
      role: 'admin',
      giver_score: 100
    }
  }
];

// ユーザー登録関数
async function registerUser(userData) {
  try {
    const { email, password, user_metadata } = userData;
    
    // 既存ユーザーの確認
    const { data: existingUsers } = await supabase.auth.admin.listUsers({
      search: email
    });
    
    const userExists = existingUsers.users.some(user => user.email === email);
    
    if (userExists) {
      console.log(`ユーザー ${email} は既に存在します。スキップします。`);
      return;
    }
    
    // ユーザー登録
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認なしで直接登録
      user_metadata
    });
    
    if (error) {
      throw error;
    }
    
    console.log(`ユーザー ${email} を登録しました。ID: ${data.user.id}`);
    
    // ユーザープロフィールテーブルにも追加（必要に応じて）
    // ここにプロフィールテーブルへの挿入処理を追加できます
    
  } catch (error) {
    console.error(`ユーザー ${userData.email} の登録に失敗しました:`, error.message);
  }
}

// メイン処理
async function main() {
  console.log('テストユーザーの登録を開始します...');
  
  for (const userData of testUsers) {
    await registerUser(userData);
  }
  
  console.log('テストユーザーの登録が完了しました。');
}

// スクリプト実行
main().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
}); 
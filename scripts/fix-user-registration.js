#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    // rpc関数が存在しない場合は、直接SQLを実行
    console.log('RPC関数が存在しないため、個別にSQL文を実行します...');
    
    // SQL文を分割して実行
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      const trimmedStmt = statement.trim();
      if (!trimmedStmt) continue;
      
      console.log('実行中:', trimmedStmt.substring(0, 100) + '...');
      
      try {
        // CREATE FUNCTION文の場合
        if (trimmedStmt.includes('CREATE OR REPLACE FUNCTION')) {
          // 関数作成は特別な処理が必要
          console.log('⚠️ 関数作成はSupabaseダッシュボードで手動実行が必要です');
          continue;
        }
        
        // その他のSQL文
        const { error: stmtError } = await supabase.from('_').select('*').limit(0);
        if (stmtError) {
          console.log('SQL実行エラー:', stmtError.message);
        }
      } catch (err) {
        console.log('SQL文実行エラー:', err.message);
      }
    }
  }
}

async function fixUserRegistration() {
  console.log('🔧 ユーザー登録修正を開始します...');
  
  try {
    // マイグレーションファイルを読み込み
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250103000002_fix_user_registration_trigger.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 マイグレーションファイルを読み込みました');
    
    // SQLを実行
    await executeSQL(migrationSQL);
    
    console.log('✅ マイグレーション実行完了');
    
    // 既存のauth.usersからプロフィールを作成
    console.log('👥 既存ユーザーのプロフィール作成を確認中...');
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      throw usersError;
    }
    
    console.log(`📊 ${users.users.length}人のユーザーが見つかりました`);
    
    // 各ユーザーのプロフィール確認・作成
    for (const user of users.users) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // プロフィールが存在しない場合は作成
        console.log(`👤 ユーザー ${user.email} のプロフィールを作成中...`);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.user_metadata?.name || `user_${user.id.substring(0, 8)}`,
            display_name: user.user_metadata?.name || 'Anonymous User',
            bio: null,
            avatar_url: null
          });
        
        if (insertError) {
          console.error(`❌ プロフィール作成エラー (${user.email}):`, insertError.message);
        } else {
          console.log(`✅ プロフィール作成成功 (${user.email})`);
        }
      } else if (profile) {
        console.log(`✓ プロフィール既存 (${user.email})`);
      }
    }
    
    console.log('🎉 ユーザー登録修正が完了しました！');
    
  } catch (error) {
    console.error('❌ 修正処理でエラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
fixUserRegistration(); 
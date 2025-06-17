#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingProfiles() {
  console.log('🔧 不足しているプロフィールを作成します...');
  
  try {
    // 既存のauth.usersを取得
    console.log('👥 既存ユーザーを取得中...');
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      throw usersError;
    }
    
    console.log(`📊 ${users.users.length}人のユーザーが見つかりました`);
    
    let createdCount = 0;
    let existingCount = 0;
    let errorCount = 0;
    
    // 各ユーザーのプロフィール確認・作成
    for (const user of users.users) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code === 'PGRST116') {
          // プロフィールが存在しない場合は作成
          console.log(`👤 ユーザー ${user.email} のプロフィールを作成中...`);
          
          const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous User';
          const username = displayName.replace(/\s+/g, '_').toLowerCase() || `user_${user.id.substring(0, 8)}`;
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: username,
              display_name: displayName,
              bio: null,
              avatar_url: null
            });
          
          if (insertError) {
            console.error(`❌ プロフィール作成エラー (${user.email}):`, insertError.message);
            errorCount++;
          } else {
            console.log(`✅ プロフィール作成成功 (${user.email})`);
            createdCount++;
          }
        } else if (profile) {
          console.log(`✓ プロフィール既存 (${user.email})`);
          existingCount++;
        } else if (profileError) {
          console.error(`❌ プロフィール確認エラー (${user.email}):`, profileError.message);
          errorCount++;
        }
      } catch (err) {
        console.error(`❌ ユーザー処理エラー (${user.email}):`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`✅ 作成済み: ${existingCount}件`);
    console.log(`🆕 新規作成: ${createdCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    if (errorCount === 0) {
      console.log('🎉 すべてのプロフィール作成が完了しました！');
    } else {
      console.log('⚠️ 一部のプロフィール作成でエラーが発生しました');
    }
    
  } catch (error) {
    console.error('❌ 処理でエラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
createMissingProfiles(); 
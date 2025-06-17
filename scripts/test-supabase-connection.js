#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み
const supabaseUrl = 'https://btakhtivpdhieruediwt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YWtodGl2cGRoaWVydWVkaXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNjgwNTEsImV4cCI6MjA1OTg0NDA1MX0.lWbw-E5SZ0gVmXhr2Q5iVp3Xohz-maRuPhLi7YSSxOo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔧 Supabase接続テストを開始します...');
  
  try {
    // 1. profilesテーブルの構造確認
    console.log('\n📋 profilesテーブルの構造確認...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ profilesテーブルアクセスエラー:', profilesError.message);
      console.error('詳細:', profilesError);
    } else {
      console.log('✅ profilesテーブルアクセス成功');
      console.log('サンプルデータ:', profiles);
    }
    
    // 2. RLSポリシーの確認（匿名ユーザーでのINSERT試行）
    console.log('\n🔒 RLSポリシーテスト（匿名ユーザーでのINSERT）...');
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000000', // テスト用UUID
      username: 'test_user',
      display_name: 'Test User',
      bio: null,
      avatar_url: null
    };
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(testProfile);
    
    if (insertError) {
      console.log('⚠️ 匿名ユーザーでのINSERT失敗（期待される動作）:', insertError.message);
      
      // RLSエラーかどうか確認
      if (insertError.message.includes('RLS') || insertError.message.includes('policy') || insertError.code === '42501') {
        console.log('✅ RLSポリシーが正常に動作しています');
      } else {
        console.log('❌ 予期しないエラー:', insertError);
      }
    } else {
      console.log('⚠️ 匿名ユーザーでのINSERTが成功（セキュリティ問題の可能性）');
    }
    
    // 3. auth.usersテーブルの確認（制限されるはず）
    console.log('\n👥 auth.usersテーブルアクセステスト...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('⚠️ auth.usersアクセス失敗（期待される動作）:', usersError.message);
      console.log('✅ 匿名キーでは管理者機能にアクセスできません（正常）');
    } else {
      console.log('⚠️ auth.usersアクセス成功（Service Role Keyが使用されている可能性）');
      console.log(`📊 ユーザー数: ${users.users.length}`);
    }
    
    // 4. 新規ユーザー作成テスト
    console.log('\n🆕 新規ユーザー作成テスト...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ ユーザー作成エラー:', signUpError.message);
      console.error('詳細:', signUpError);
      
      if (signUpError.message.includes('Database error')) {
        console.log('🚨 これがリリース阻害要因のエラーです！');
      }
    } else {
      console.log('✅ ユーザー作成成功:', signUpData.user?.id);
      
      // 作成されたユーザーのプロフィール確認
      if (signUpData.user) {
        console.log('👤 作成されたプロフィール確認中...');
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();
        
        if (newProfileError) {
          console.error('❌ プロフィール確認エラー:', newProfileError.message);
        } else {
          console.log('✅ プロフィール自動作成成功:', newProfile);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
  }
}

// テスト実行
testSupabaseConnection(); 
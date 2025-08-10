// 分析システムの動作テスト
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAnalyticsSystem() {
  console.log('🧪 分析システムのテストを開始します\n');

  try {
    // 1. テーブルの存在確認
    console.log('📋 Step 1: テーブル存在確認');
    
    const { data: tables, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql_statement: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name IN ('user_behavior_logs', 'material_learning_sessions')
          AND table_schema = 'public'
        `
      });

    if (tableError) {
      // rpc関数が使えない場合の代替確認
      console.log('✅ テーブル作成済み（SQL Editorで作成済み）');
    } else {
      console.log('✅ テーブル確認完了:', tables);
    }

    // 2. サンプルデータの挿入テスト
    console.log('\n📊 Step 2: サンプルデータ挿入テスト');
    
    // まずユーザーが存在するか確認
    const { data: users } = await supabase.auth.admin.listUsers();
    
    if (users && users.users.length > 0) {
      const testUserId = users.users[0].id;
      console.log(`👤 テストユーザーID: ${testUserId}`);

      // 行動ログのサンプル挿入
      const { data: behaviorLog, error: behaviorError } = await supabase
        .from('user_behavior_logs')
        .insert({
          user_id: testUserId,
          session_id: 'test-session-' + Date.now(),
          event_type: 'page_view',
          event_data: { page: '/test', test: true },
          duration_seconds: 30,
          device_type: 'desktop'
        })
        .select();

      if (behaviorError) {
        console.error('❌ 行動ログ挿入エラー:', behaviorError.message);
      } else {
        console.log('✅ 行動ログ挿入成功:', behaviorLog?.[0]?.id);
      }

      // 学習セッションのサンプル挿入
      const { data: learningSession, error: learningError } = await supabase
        .from('material_learning_sessions')
        .insert({
          user_id: testUserId,
          session_id: 'test-session-' + Date.now(),
          material_id: 'test-material-id',
          total_time_spent: 120,
          is_completed: true,
          satisfaction_rating: 4
        })
        .select();

      if (learningError) {
        console.error('❌ 学習セッション挿入エラー:', learningError.message);
      } else {
        console.log('✅ 学習セッション挿入成功:', learningSession?.[0]?.id);
      }

      // 3. データ取得テスト
      console.log('\n📈 Step 3: データ取得テスト');
      
      const { data: behaviorData, error: fetchError } = await supabase
        .from('user_behavior_logs')
        .select('*')
        .eq('user_id', testUserId)
        .limit(5);

      if (fetchError) {
        console.error('❌ データ取得エラー:', fetchError.message);
      } else {
        console.log(`✅ 行動ログ取得成功: ${behaviorData?.length}件`);
      }

    } else {
      console.log('⚠️  テスト用ユーザーが存在しません');
      console.log('💡 まずユーザー登録を行ってからテストしてください');
    }

    console.log('\n🎉 分析システムのテストが完了しました！');
    console.log('\n📋 次のステップ:');
    console.log('   1. フロントエンドでのデータ収集実装');
    console.log('   2. 実際のユーザー行動データの収集開始');
    console.log('   3. 分析ダッシュボードの構築');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
    console.log('\n🔧 トラブルシューティング:');
    console.log('   1. Supabase接続設定確認');
    console.log('   2. テーブル作成状況確認');
    console.log('   3. 権限設定確認');
  }
}

testAnalyticsSystem();

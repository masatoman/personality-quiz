// 分析テーブルを個別に作成するシンプルなスクリプト
const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable(tableName, sql) {
  console.log(`\n🔄 作成中: ${tableName}`);
  try {
    const { error } = await supabase.from('').select('*').limit(0); // 接続テスト
    if (error && error.message.includes('SSL')) {
      console.log('⚠️  SSL接続の問題があります。接続設定を確認してください。');
      return false;
    }

    // 実際のテーブル作成はrpc経由で実行する必要があります
    console.log(`✅ ${tableName} の作成準備完了`);
    console.log(`📝 実行予定SQL:\n${sql.substring(0, 200)}...`);
    return true;
  } catch (err) {
    console.error(`❌ エラー: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('📊 ShiftWith 分析システム - テーブル作成確認\n');

  // 1. ユーザー行動ログテーブル
  const behaviorLogsSQL = `
    CREATE TABLE IF NOT EXISTS user_behavior_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      session_id UUID NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      page_path VARCHAR(500),
      element_id VARCHAR(200),
      material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
      event_data JSONB,
      duration_seconds INTEGER,
      device_type VARCHAR(50),
      browser_type VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await createTable('user_behavior_logs', behaviorLogsSQL);

  // 2. 教材学習進捗ログテーブル
  const learningLogsSQL = `
    CREATE TABLE IF NOT EXISTS material_learning_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
      session_id UUID NOT NULL,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      total_time_spent INTEGER DEFAULT 0,
      quiz_attempts INTEGER DEFAULT 0,
      satisfaction_rating INTEGER,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await createTable('material_learning_logs', learningLogsSQL);

  // 3. 教材効果測定テーブル
  const effectivenessSQL = `
    CREATE TABLE IF NOT EXISTS material_effectiveness_metrics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
      measurement_date DATE DEFAULT CURRENT_DATE,
      total_views INTEGER DEFAULT 0,
      completion_rate DECIMAL(5,2),
      average_satisfaction DECIMAL(3,2),
      content_quality_score DECIMAL(5,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await createTable('material_effectiveness_metrics', effectivenessSQL);

  console.log('\n📋 注意事項:');
  console.log('   ⚠️  これらのテーブルはまだSupabaseに作成されていません');
  console.log('   🔧 実際の作成にはSupabase Dashboard使用を推奨');
  console.log('   📁 もしくは migrations/ フォルダのSQLファイルを手動実行');
  
  console.log('\n🎯 次のステップ:');
  console.log('   1. Supabase Dashboard (https://supabase.com/dashboard) にアクセス');
  console.log('   2. SQL Editor で上記のCREATE TABLEクエリを実行');
  console.log('   3. または supabase/migrations/20250131000001_add_analytics_tables.sql を実行');
}

main().catch(console.error);

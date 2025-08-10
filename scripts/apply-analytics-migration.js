// 分析テーブルのマイグレーションを実行するスクリプト
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQL(sql, description) {
  console.log(`\n🔄 実行中: ${description}`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_statement: sql });
    if (error) {
      console.error(`❌ エラー: ${error.message}`);
      return false;
    }
    console.log(`✅ 成功: ${description}`);
    return true;
  } catch (err) {
    console.error(`❌ 例外エラー: ${err.message}`);
    return false;
  }
}

async function createAnalyticsTables() {
  console.log('📊 ShiftWith 分析テーブル作成開始\n');

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
      section_index INTEGER,
      
      event_data JSONB,
      duration_seconds INTEGER,
      
      device_type VARCHAR(50),
      browser_type VARCHAR(50),
      screen_width INTEGER,
      screen_height INTEGER,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_user_id ON user_behavior_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_material_id ON user_behavior_logs(material_id);
    CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_event_type ON user_behavior_logs(event_type);
    CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_created_at ON user_behavior_logs(created_at);

    ALTER TABLE user_behavior_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own behavior logs" ON user_behavior_logs
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Service role can manage all behavior logs" ON user_behavior_logs
      FOR ALL USING (auth.role() = 'service_role');

    COMMENT ON TABLE user_behavior_logs IS 'ユーザーの詳細行動ログ（分析用）';
  `;

  await executeSQL(behaviorLogsSQL, '1. ユーザー行動ログテーブル');

  // 2. 教材学習進捗ログテーブル
  const learningLogsSQL = `
    CREATE TABLE IF NOT EXISTS material_learning_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
      session_id UUID NOT NULL,
      
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      last_position INTEGER DEFAULT 0,
      total_time_spent INTEGER DEFAULT 0,
      
      quiz_attempts INTEGER DEFAULT 0,
      quiz_correct_answers INTEGER DEFAULT 0,
      quiz_total_questions INTEGER DEFAULT 0,
      quiz_scores JSONB,
      
      difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
      satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
      usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
      
      knowledge_gain_score DECIMAL(5,2),
      completion_rate DECIMAL(5,2),
      
      is_completed BOOLEAN DEFAULT FALSE,
      is_bookmarked BOOLEAN DEFAULT FALSE,
      will_recommend BOOLEAN,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_material_learning_logs_user_id ON material_learning_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_material_learning_logs_material_id ON material_learning_logs(material_id);
    CREATE INDEX IF NOT EXISTS idx_material_learning_logs_completed ON material_learning_logs(is_completed);

    ALTER TABLE material_learning_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own learning logs" ON material_learning_logs
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage own learning logs" ON material_learning_logs
      FOR ALL USING (auth.uid() = user_id);

    COMMENT ON TABLE material_learning_logs IS '教材学習の詳細進捗ログ';
  `;

  await executeSQL(learningLogsSQL, '2. 教材学習進捗ログテーブル');

  // 3. 教材効果測定テーブル  
  const effectivenessSQL = `
    CREATE TABLE IF NOT EXISTS material_effectiveness_metrics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
      measurement_date DATE DEFAULT CURRENT_DATE,
      
      total_views INTEGER DEFAULT 0,
      unique_viewers INTEGER DEFAULT 0,
      average_time_spent DECIMAL(8,2),
      completion_rate DECIMAL(5,2),
      bounce_rate DECIMAL(5,2),
      return_rate DECIMAL(5,2),
      
      total_comments INTEGER DEFAULT 0,
      total_helpful_votes INTEGER DEFAULT 0,
      total_bookmarks INTEGER DEFAULT 0,
      total_shares INTEGER DEFAULT 0,
      
      average_quiz_score DECIMAL(5,2),
      knowledge_retention_rate DECIMAL(5,2),
      skill_improvement_score DECIMAL(5,2),
      
      average_satisfaction DECIMAL(3,2),
      average_usefulness DECIMAL(3,2),
      average_difficulty DECIMAL(3,2),
      recommendation_rate DECIMAL(5,2),
      
      effectiveness_by_level JSONB,
      effectiveness_by_personality JSONB,
      
      content_quality_score DECIMAL(5,2),
      readability_score DECIMAL(5,2),
      engagement_score DECIMAL(5,2),
      educational_value_score DECIMAL(5,2),
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      UNIQUE(material_id, measurement_date)
    );

    CREATE INDEX IF NOT EXISTS idx_material_effectiveness_material_id ON material_effectiveness_metrics(material_id);
    CREATE INDEX IF NOT EXISTS idx_material_effectiveness_date ON material_effectiveness_metrics(measurement_date);

    ALTER TABLE material_effectiveness_metrics ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authors can view their material metrics" ON material_effectiveness_metrics
      FOR SELECT USING (
        material_id IN (
          SELECT id FROM materials WHERE author_id = auth.uid()
        )
      );

    CREATE POLICY "Service role can manage all metrics" ON material_effectiveness_metrics
      FOR ALL USING (auth.role() = 'service_role');

    COMMENT ON TABLE material_effectiveness_metrics IS '教材の効果測定指標（日別集計）';
  `;

  await executeSQL(effectivenessSQL, '3. 教材効果測定テーブル');

  console.log('\n🎉 分析テーブルの作成が完了しました！');
  console.log('\n📋 作成されたテーブル:');
  console.log('   ✅ user_behavior_logs - ユーザー行動ログ');
  console.log('   ✅ material_learning_logs - 教材学習進捗ログ');
  console.log('   ✅ material_effectiveness_metrics - 教材効果測定');
}

// 実行
createAnalyticsTables().catch(console.error);

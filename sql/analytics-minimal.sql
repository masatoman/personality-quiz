-- 分析システム用テーブル（最小限版）
-- Supabase SQL Editor で実行してください

-- 1. ユーザー行動ログテーブル
CREATE TABLE IF NOT EXISTS user_behavior_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- 行動データ
  event_type VARCHAR(100) NOT NULL, -- 'page_view', 'material_view', 'quiz_start', etc.
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  event_data JSONB,
  duration_seconds INTEGER,
  
  -- デバイス情報
  device_type VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_behavior_logs_user_id ON user_behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_material_id ON user_behavior_logs(material_id);

-- RLS
ALTER TABLE user_behavior_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own behavior logs" ON user_behavior_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 2. 教材学習セッションテーブル
CREATE TABLE IF NOT EXISTS material_learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_time_spent INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON material_learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_material_id ON material_learning_sessions(material_id);

-- RLS
ALTER TABLE material_learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own learning sessions" ON material_learning_sessions
  FOR ALL USING (auth.uid() = user_id);

-- テーブル作成確認
SELECT 'user_behavior_logs' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_behavior_logs') 
            THEN '✅ 作成済み' 
            ELSE '❌ 未作成' END as status
UNION ALL
SELECT 'material_learning_sessions' as table_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'material_learning_sessions') 
            THEN '✅ 作成済み' 
            ELSE '❌ 未作成' END as status;

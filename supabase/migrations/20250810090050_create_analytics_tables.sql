-- 分析システム用テーブル作成

-- 1. ユーザー行動ログテーブル
CREATE TABLE IF NOT EXISTS user_behavior_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- 行動データ
  event_type VARCHAR(100) NOT NULL,
  material_id UUID,  -- materialsテーブルが存在しない場合はUUIDのみ
  event_data JSONB,
  duration_seconds INTEGER,
  
  -- デバイス情報
  device_type VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 教材学習セッションテーブル
CREATE TABLE IF NOT EXISTS material_learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID,  -- materialsテーブルが存在しない場合はUUIDのみ
  session_id UUID NOT NULL,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_time_spent INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_behavior_logs_user_id ON user_behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_event_type ON user_behavior_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON material_learning_sessions(user_id);

-- RLS有効化
ALTER TABLE user_behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_learning_sessions ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can view own behavior logs" ON user_behavior_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning sessions" ON material_learning_sessions
  FOR ALL USING (auth.uid() = user_id);

-- コメント追加
COMMENT ON TABLE user_behavior_logs IS 'ユーザー行動ログ（分析用）';
COMMENT ON TABLE material_learning_sessions IS '教材学習セッション記録';

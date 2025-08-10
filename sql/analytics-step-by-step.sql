-- Step 1: ユーザー行動ログテーブルのみ作成
CREATE TABLE IF NOT EXISTS user_behavior_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- 行動データ
  event_type VARCHAR(100) NOT NULL,
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

-- ポリシー作成（重複エラー回避）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_behavior_logs' 
    AND policyname = 'Users can view own behavior logs'
  ) THEN
    CREATE POLICY "Users can view own behavior logs" ON user_behavior_logs
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Step 2: 教材学習セッションテーブル作成
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

-- ポリシー作成（重複エラー回避）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'material_learning_sessions' 
    AND policyname = 'Users can manage own learning sessions'
  ) THEN
    CREATE POLICY "Users can manage own learning sessions" ON material_learning_sessions
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

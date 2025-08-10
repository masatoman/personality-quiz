-- 分析テーブルのみ作成（最小限）

-- 1. ユーザー行動ログテーブル
CREATE TABLE user_behavior_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 教材学習セッションテーブル
CREATE TABLE material_learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  total_time_spent INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 確認
SELECT 'user_behavior_logs' as table_name 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_behavior_logs')
UNION ALL
SELECT 'material_learning_sessions' as table_name
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'material_learning_sessions');

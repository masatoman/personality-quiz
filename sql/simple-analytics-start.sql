-- 分析システム最小セット（Supabase Dashboard で実行）

-- 1. ユーザー行動ログテーブル（シンプル版）
CREATE TABLE IF NOT EXISTS user_behavior_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- 基本行動データ
  event_type VARCHAR(100) NOT NULL, -- 'page_view', 'material_view', 'quiz_start', etc.
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  event_data JSONB, -- 詳細データ
  duration_seconds INTEGER, -- 時間（秒）
  
  -- デバイス情報
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_behavior_logs_user_id ON user_behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_material_id ON user_behavior_logs(material_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_event_type ON user_behavior_logs(event_type);

-- 2. 教材学習記録テーブル（シンプル版）
CREATE TABLE IF NOT EXISTS material_learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  
  -- 学習データ
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_time_spent INTEGER DEFAULT 0, -- 秒
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- 評価データ
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  
  -- フラグ
  is_bookmarked BOOLEAN DEFAULT FALSE,
  will_recommend BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON material_learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_material_id ON material_learning_sessions(material_id);

-- 3. 日次統計テーブル（シンプル版）
CREATE TABLE IF NOT EXISTS daily_material_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  stat_date DATE DEFAULT CURRENT_DATE,
  
  -- 基本統計
  view_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_time_spent DECIMAL(8,2),
  
  -- エンゲージメント
  comment_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  
  -- 満足度
  average_satisfaction DECIMAL(3,2),
  average_difficulty DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(material_id, stat_date)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_daily_stats_material_id ON daily_material_stats(material_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_material_stats(stat_date);

-- RLS (Row Level Security) 設定
ALTER TABLE user_behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_material_stats ENABLE ROW LEVEL SECURITY;

-- ポリシー設定
CREATE POLICY "Users can view own behavior logs" ON user_behavior_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning sessions" ON material_learning_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authors can view their material stats" ON daily_material_stats
  FOR SELECT USING (
    material_id IN (
      SELECT id FROM materials WHERE author_id = auth.uid()
    )
  );

-- コメント追加
COMMENT ON TABLE user_behavior_logs IS 'ユーザー行動ログ（分析用）';
COMMENT ON TABLE material_learning_sessions IS '教材学習セッション記録';
COMMENT ON TABLE daily_material_stats IS '教材の日次統計データ';

-- 既存テーブルを拡張して分析機能を追加

-- user_activities テーブルに分析用カラムを追加
ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id);
ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS device_info JSONB;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_user_activities_session_id ON user_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_material_id ON user_activities(material_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type_material ON user_activities(activity_type, material_id);

-- materials テーブルに統計カラムを追加
ALTER TABLE materials ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;

-- material_comments テーブルは既に存在するので、統計用ビューを作成
CREATE OR REPLACE VIEW material_analytics_summary AS
SELECT 
  m.id as material_id,
  m.title,
  m.category,
  m.difficulty,
  m.view_count,
  m.completion_count,
  m.average_rating,
  
  -- user_activities からの統計
  COUNT(DISTINCT ua_view.user_id) as unique_viewers,
  AVG(ua_time.duration_seconds) as avg_time_spent,
  
  -- material_comments からの統計
  COUNT(DISTINCT mc.id) as comment_count,
  SUM(mc.helpful_count) as total_helpful_votes,
  
  -- 最新活動
  MAX(ua_recent.created_at) as last_activity_at
  
FROM materials m
LEFT JOIN user_activities ua_view ON m.id = ua_view.material_id AND ua_view.activity_type = 'material_view'
LEFT JOIN user_activities ua_time ON m.id = ua_time.material_id AND ua_time.duration_seconds IS NOT NULL
LEFT JOIN material_comments mc ON m.id = mc.material_id
LEFT JOIN user_activities ua_recent ON m.id = ua_recent.material_id
GROUP BY m.id, m.title, m.category, m.difficulty, m.view_count, m.completion_count, m.average_rating;

COMMENT ON VIEW material_analytics_summary IS '教材分析サマリービュー（既存テーブル活用）';

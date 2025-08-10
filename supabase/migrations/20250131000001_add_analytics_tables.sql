-- ====================================
-- 教材効果分析システム用データベーステーブル
-- ====================================

-- ===== 1. ユーザー行動ログテーブル =====
CREATE TABLE IF NOT EXISTS user_behavior_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- セッション識別
  
  -- 基本情報
  event_type VARCHAR(100) NOT NULL, -- 'page_view', 'click', 'scroll', 'time_spent', etc.
  page_path VARCHAR(500), -- どのページか
  element_id VARCHAR(200), -- クリックした要素など
  
  -- 教材関連（該当する場合）
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  section_index INTEGER, -- 教材のどのセクションか
  
  -- 行動データ
  event_data JSONB, -- 詳細データ（スクロール位置、クリック座標など）
  duration_seconds INTEGER, -- 滞在時間・操作時間
  
  -- デバイス・環境情報
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser_type VARCHAR(50),
  screen_width INTEGER,
  screen_height INTEGER,
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_behavior_logs IS 'ユーザーの詳細行動ログ（分析用）';

-- ===== 2. 教材学習進捗ログテーブル =====
CREATE TABLE IF NOT EXISTS material_learning_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- 学習状況
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_position INTEGER DEFAULT 0, -- 最後に見ていた位置（セクション番号など）
  total_time_spent INTEGER DEFAULT 0, -- 累計学習時間（秒）
  
  -- クイズ・演習結果
  quiz_attempts INTEGER DEFAULT 0,
  quiz_correct_answers INTEGER DEFAULT 0,
  quiz_total_questions INTEGER DEFAULT 0,
  quiz_scores JSONB, -- 各回の詳細スコア
  
  -- 理解度・満足度評価
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
  
  -- 学習成果
  knowledge_gain_score DECIMAL(5,2), -- 学習前後のスコア向上
  completion_rate DECIMAL(5,2), -- この教材の完了率
  
  -- フラグ
  is_completed BOOLEAN DEFAULT FALSE,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  will_recommend BOOLEAN,
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE material_learning_logs IS '教材学習の詳細進捗ログ';

-- ===== 3. 教材効果測定テーブル =====
CREATE TABLE IF NOT EXISTS material_effectiveness_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  measurement_date DATE DEFAULT CURRENT_DATE,
  
  -- 基本エンゲージメント指標
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  average_time_spent DECIMAL(8,2), -- 平均滞在時間（秒）
  completion_rate DECIMAL(5,2), -- 完了率
  bounce_rate DECIMAL(5,2), -- 直帰率
  return_rate DECIMAL(5,2), -- 再訪率
  
  -- インタラクション指標
  total_comments INTEGER DEFAULT 0,
  total_helpful_votes INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  
  -- 学習効果指標
  average_quiz_score DECIMAL(5,2),
  knowledge_retention_rate DECIMAL(5,2), -- 知識定着率
  skill_improvement_score DECIMAL(5,2), -- スキル向上度
  
  -- 満足度指標
  average_satisfaction DECIMAL(3,2),
  average_usefulness DECIMAL(3,2),
  average_difficulty DECIMAL(3,2),
  recommendation_rate DECIMAL(5,2), -- 推奨率
  
  -- レベル別効果（JSONB）
  effectiveness_by_level JSONB, -- {"beginner": {...}, "intermediate": {...}, "advanced": {...}}
  effectiveness_by_personality JSONB, -- {"giver": {...}, "matcher": {...}, "taker": {...}}
  
  -- コンテンツ品質スコア
  content_quality_score DECIMAL(5,2), -- 総合品質スコア
  readability_score DECIMAL(5,2), -- 可読性スコア
  engagement_score DECIMAL(5,2), -- エンゲージメントスコア
  educational_value_score DECIMAL(5,2), -- 教育価値スコア
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 日別ユニーク制約
  UNIQUE(material_id, measurement_date)
);

COMMENT ON TABLE material_effectiveness_metrics IS '教材の効果測定指標（日別集計）';

-- ===== 4. 学習者特性分析テーブル =====
CREATE TABLE IF NOT EXISTS learner_analytics_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 学習スタイル（分析で判定）
  preferred_learning_style VARCHAR(50), -- 'visual', 'auditory', 'kinesthetic', 'reading'
  optimal_learning_time VARCHAR(50), -- '朝', '昼', '夜', '深夜'
  preferred_content_length VARCHAR(50), -- 'short', 'medium', 'long'
  preferred_difficulty_progression VARCHAR(50), -- 'gradual', 'steep', 'mixed'
  
  -- 学習パターン
  average_session_duration INTEGER, -- 平均学習セッション時間（分）
  weekly_activity_pattern JSONB, -- 曜日別活動パターン
  monthly_progression JSONB, -- 月別成長パターン
  
  -- 効果的な教材タイプ
  effective_material_types JSONB, -- 効果的だった教材タイプリスト
  effective_content_structures JSONB, -- 効果的だったコンテンツ構造
  challenging_areas JSONB, -- 苦手分野・つまずきパターン
  
  -- パフォーマンス指標
  overall_learning_velocity DECIMAL(5,2), -- 学習速度スコア
  knowledge_retention_rate DECIMAL(5,2), -- 知識定着率
  engagement_consistency DECIMAL(5,2), -- エンゲージメント一貫性
  
  -- 貢献パターン
  contribution_frequency DECIMAL(5,2), -- 貢献頻度
  comment_helpfulness_ratio DECIMAL(5,2), -- コメントの役立ち度
  material_creation_success_rate DECIMAL(5,2), -- 作成教材の成功率
  
  -- 予測・推奨データ
  predicted_next_interests JSONB, -- 次に興味を持ちそうなトピック
  recommended_difficulty_level VARCHAR(50), -- 推奨難易度レベル
  optimal_material_frequency INTEGER, -- 最適な教材配信頻度（日）
  
  -- 時刻
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

COMMENT ON TABLE learner_analytics_profiles IS '学習者の分析プロファイル（AIによる特性分析結果）';

-- ===== 5. A/Bテスト実験テーブル =====
CREATE TABLE IF NOT EXISTS ab_test_experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- 実験設定
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  variant_a_config JSONB, -- バリアントAの設定
  variant_b_config JSONB, -- バリアントBの設定
  traffic_split DECIMAL(3,2) DEFAULT 0.5, -- トラフィック分割率（0.5 = 50/50）
  
  -- 測定指標
  primary_metric VARCHAR(100), -- 主要測定指標
  secondary_metrics JSONB, -- 副次測定指標
  
  -- 実験期間
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 結果
  statistical_significance DECIMAL(5,2), -- 統計的有意性
  winner_variant VARCHAR(10), -- 'A' or 'B' or 'INCONCLUSIVE'
  effect_size DECIMAL(5,2), -- 効果量
  results_summary JSONB, -- 結果サマリー
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE ab_test_experiments IS 'A/Bテスト実験管理';

-- ===== 6. A/Bテスト参加ログテーブル =====
CREATE TABLE IF NOT EXISTS ab_test_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 割り当て
  assigned_variant VARCHAR(10) NOT NULL, -- 'A' or 'B'
  assignment_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 結果測定
  converted BOOLEAN DEFAULT FALSE, -- 目標達成したか
  conversion_timestamp TIMESTAMP WITH TIME ZONE,
  metric_values JSONB, -- 各指標の値
  
  -- セッション情報
  session_id UUID NOT NULL,
  user_agent TEXT,
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(experiment_id, user_id)
);

COMMENT ON TABLE ab_test_participations IS 'A/Bテスト参加記録';

-- ===== インデックス作成 =====

-- user_behavior_logs
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_user_id ON user_behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_material_id ON user_behavior_logs(material_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_session ON user_behavior_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_event_type ON user_behavior_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_created_at ON user_behavior_logs(created_at);

-- material_learning_logs
CREATE INDEX IF NOT EXISTS idx_material_learning_logs_user_id ON material_learning_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_material_learning_logs_material_id ON material_learning_logs(material_id);
CREATE INDEX IF NOT EXISTS idx_material_learning_logs_session ON material_learning_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_material_learning_logs_completed ON material_learning_logs(is_completed);
CREATE INDEX IF NOT EXISTS idx_material_learning_logs_created_at ON material_learning_logs(created_at);

-- material_effectiveness_metrics
CREATE INDEX IF NOT EXISTS idx_material_effectiveness_material_id ON material_effectiveness_metrics(material_id);
CREATE INDEX IF NOT EXISTS idx_material_effectiveness_date ON material_effectiveness_metrics(measurement_date);
CREATE INDEX IF NOT EXISTS idx_material_effectiveness_quality_score ON material_effectiveness_metrics(content_quality_score);

-- learner_analytics_profiles
CREATE INDEX IF NOT EXISTS idx_learner_analytics_user_id ON learner_analytics_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_learner_analytics_learning_style ON learner_analytics_profiles(preferred_learning_style);

-- ab_test_experiments
CREATE INDEX IF NOT EXISTS idx_ab_test_experiments_material_id ON ab_test_experiments(material_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_experiments_active ON ab_test_experiments(is_active);

-- ab_test_participations
CREATE INDEX IF NOT EXISTS idx_ab_test_participations_experiment ON ab_test_participations(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_participations_user ON ab_test_participations(user_id);

-- ===== RLS (Row Level Security) ポリシー =====

-- user_behavior_logs: プライバシー保護のため、本人と管理者のみアクセス可能
ALTER TABLE user_behavior_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own behavior logs" ON user_behavior_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all behavior logs" ON user_behavior_logs
  FOR ALL USING (auth.role() = 'service_role');

-- material_learning_logs: 本人のみアクセス可能
ALTER TABLE material_learning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning logs" ON material_learning_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning logs" ON material_learning_logs
  FOR ALL USING (auth.uid() = user_id);

-- material_effectiveness_metrics: 集計データなので教材作成者と管理者がアクセス可能
ALTER TABLE material_effectiveness_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can view their material metrics" ON material_effectiveness_metrics
  FOR SELECT USING (
    material_id IN (
      SELECT id FROM materials WHERE author_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all metrics" ON material_effectiveness_metrics
  FOR ALL USING (auth.role() = 'service_role');

-- learner_analytics_profiles: 本人のみアクセス可能
ALTER TABLE learner_analytics_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics profile" ON learner_analytics_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- A/Bテストテーブル: 管理者のみ管理、参加者は自分の参加記録のみ閲覧可能
ALTER TABLE ab_test_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage experiments" ON ab_test_experiments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own participations" ON ab_test_participations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage participations" ON ab_test_participations
  FOR ALL USING (auth.role() = 'service_role');

-- ===== 分析用ビュー作成 =====

-- 教材別基本統計ビュー
CREATE OR REPLACE VIEW material_basic_stats AS
SELECT 
  m.id as material_id,
  m.title,
  m.category,
  m.difficulty,
  m.author_id,
  COUNT(DISTINCT mll.user_id) as unique_learners,
  AVG(mll.total_time_spent) as avg_time_spent,
  AVG(CASE WHEN mll.is_completed THEN 1.0 ELSE 0.0 END) as completion_rate,
  AVG(mll.satisfaction_rating) as avg_satisfaction,
  COUNT(mc.id) as total_comments,
  SUM(mc.helpful_count) as total_helpful_votes
FROM materials m
LEFT JOIN material_learning_logs mll ON m.id = mll.material_id
LEFT JOIN material_comments mc ON m.id = mc.material_id
GROUP BY m.id, m.title, m.category, m.difficulty, m.author_id;

COMMENT ON VIEW material_basic_stats IS '教材別基本統計ビュー';

-- ユーザー学習パターンビュー
CREATE OR REPLACE VIEW user_learning_patterns AS
SELECT 
  mll.user_id,
  COUNT(DISTINCT mll.material_id) as materials_studied,
  AVG(mll.total_time_spent) as avg_study_time,
  AVG(CASE WHEN mll.is_completed THEN 1.0 ELSE 0.0 END) as completion_rate,
  AVG(mll.satisfaction_rating) as avg_satisfaction,
  COUNT(mc.id) as comments_posted,
  AVG(mc.helpful_count) as avg_comment_helpfulness
FROM material_learning_logs mll
LEFT JOIN material_comments mc ON mll.user_id = mc.user_id
GROUP BY mll.user_id;

COMMENT ON VIEW user_learning_patterns IS 'ユーザー学習パターンビュー';

-- ===== 自動集計関数 =====

-- 日次指標更新関数
CREATE OR REPLACE FUNCTION update_daily_material_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO material_effectiveness_metrics (
    material_id,
    measurement_date,
    total_views,
    unique_viewers,
    average_time_spent,
    completion_rate,
    total_comments,
    total_helpful_votes,
    average_satisfaction
  )
  SELECT 
    m.id,
    CURRENT_DATE,
    COALESCE(stats.total_views, 0),
    COALESCE(stats.unique_viewers, 0),
    COALESCE(stats.avg_time_spent, 0),
    COALESCE(stats.completion_rate, 0),
    COALESCE(stats.total_comments, 0),
    COALESCE(stats.total_helpful_votes, 0),
    COALESCE(stats.avg_satisfaction, 0)
  FROM materials m
  LEFT JOIN material_basic_stats stats ON m.id = stats.material_id
  ON CONFLICT (material_id, measurement_date) 
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_viewers = EXCLUDED.unique_viewers,
    average_time_spent = EXCLUDED.average_time_spent,
    completion_rate = EXCLUDED.completion_rate,
    total_comments = EXCLUDED.total_comments,
    total_helpful_votes = EXCLUDED.total_helpful_votes,
    average_satisfaction = EXCLUDED.average_satisfaction,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_daily_material_metrics() IS '日次教材指標更新関数';

-- 学習者プロファイル更新関数
CREATE OR REPLACE FUNCTION update_learner_profile(target_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO learner_analytics_profiles (
    user_id,
    average_session_duration,
    overall_learning_velocity,
    knowledge_retention_rate,
    analyzed_at
  )
  SELECT 
    target_user_id,
    AVG(total_time_spent / 60) as avg_session_minutes, -- 分単位
    AVG(CASE WHEN is_completed THEN 1.0 ELSE 0.0 END) as learning_velocity,
    AVG(COALESCE(satisfaction_rating, 3.0)) / 5.0 as retention_proxy,
    NOW()
  FROM material_learning_logs
  WHERE user_id = target_user_id
  ON CONFLICT (user_id)
  DO UPDATE SET
    average_session_duration = EXCLUDED.average_session_duration,
    overall_learning_velocity = EXCLUDED.overall_learning_velocity,
    knowledge_retention_rate = EXCLUDED.knowledge_retention_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_learner_profile(UUID) IS '学習者プロファイル更新関数';

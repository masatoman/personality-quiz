-- Phase 6: 学習リソース管理システム SQL
-- 実行日: 2024年
-- 概要: 学習リソース管理、進捗トラッキング、評価システムの実装

-- ===== STEP 1: リソースカテゴリテーブル =====

CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT, -- アイコン識別子
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- カテゴリの初期データ
INSERT INTO resource_categories (name, description, icon_name, display_order) 
VALUES 
  ('English Grammar', '英文法に関する学習リソース', 'grammar', 1),
  ('Vocabulary', '語彙力向上のためのリソース', 'vocabulary', 2),
  ('Listening', 'リスニング力向上のリソース', 'headphones', 3),
  ('Speaking', 'スピーキング力向上のリソース', 'microphone', 4),
  ('Reading', 'リーディング力向上のリソース', 'book', 5),
  ('Writing', 'ライティング力向上のリソース', 'edit', 6),
  ('Business English', 'ビジネス英語のリソース', 'briefcase', 7),
  ('TOEIC/TOEFL', '試験対策のリソース', 'test', 8),
  ('Daily Conversation', '日常会話のリソース', 'chat', 9),
  ('Culture & News', '文化・ニュース関連のリソース', 'globe', 10)
ON CONFLICT (name) DO NOTHING;

-- ===== STEP 2: 難易度レベルテーブル =====

CREATE TABLE IF NOT EXISTS difficulty_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_code TEXT NOT NULL UNIQUE, -- 'beginner', 'intermediate', 'advanced', 'expert'
  display_name TEXT NOT NULL,
  description TEXT,
  min_score INTEGER DEFAULT 0, -- 最小ギバースコア要件
  color_code TEXT, -- UI表示用の色コード
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 難易度レベルの初期データ
INSERT INTO difficulty_levels (level_code, display_name, description, min_score, color_code, display_order)
VALUES 
  ('beginner', '初級', '英語学習を始めたばかりの方向け', 0, '#22c55e', 1),
  ('intermediate', '中級', '基本的な英語力がある方向け', 100, '#f59e0b', 2),
  ('advanced', '上級', '高い英語力を持つ方向け', 500, '#ef4444', 3),
  ('expert', '最上級', '専門的な英語力を持つ方向け', 1000, '#8b5cf6', 4)
ON CONFLICT (level_code) DO NOTHING;

-- ===== STEP 3: 学習リソーステーブル =====

CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'audio', 'interactive', 'quiz', 'pdf')),
  content_url TEXT, -- 外部リンクまたはファイルパス
  content_data JSONB, -- インタラクティブコンテンツのデータ
  
  -- カテゴリと難易度
  category_id UUID REFERENCES resource_categories(id) ON DELETE SET NULL,
  difficulty_level_id UUID REFERENCES difficulty_levels(id) ON DELETE SET NULL,
  
  -- 作成者情報
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- メタデータ
  estimated_duration INTEGER, -- 推定学習時間（分）
  tags TEXT[], -- タグ配列
  language TEXT DEFAULT 'ja', -- コンテンツ言語
  target_language TEXT DEFAULT 'en', -- 学習対象言語
  
  -- 統計情報
  view_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  
  -- ステータス
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  
  -- 時刻
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 4: 学習進捗管理テーブル =====

CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  
  -- 進捗情報
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP WITH TIME ZONE,
  
  -- 時間記録
  total_time_spent INTEGER DEFAULT 0, -- 総学習時間（分）
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- セクション別進捗（JSONBで柔軟に管理）
  section_progress JSONB DEFAULT '{}',
  
  -- 学習メモ
  user_notes TEXT,
  bookmarked_sections TEXT[], -- ブックマークしたセクション
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, resource_id)
);

-- ===== STEP 5: リソース評価・コメントテーブル =====

CREATE TABLE IF NOT EXISTS resource_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  
  -- 評価
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- メタデータ
  is_verified_completion BOOLEAN DEFAULT false, -- 完了済みユーザーの評価か
  helpful_count INTEGER DEFAULT 0, -- 「役立った」カウント
  
  -- モデレーション
  is_approved BOOLEAN DEFAULT true,
  moderation_notes TEXT,
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, resource_id)
);

-- ===== STEP 6: コメントシステム =====

CREATE TABLE IF NOT EXISTS resource_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES resource_comments(id) ON DELETE CASCADE, -- 返信用
  
  -- コンテンツ
  comment_text TEXT NOT NULL,
  
  -- エンゲージメント
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  -- モデレーション
  is_approved BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false, -- 固定コメント
  moderation_notes TEXT,
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 7: インデックス作成 =====

-- resource_categories
CREATE INDEX IF NOT EXISTS idx_resource_categories_active ON resource_categories(is_active, display_order);

-- difficulty_levels
CREATE INDEX IF NOT EXISTS idx_difficulty_levels_order ON difficulty_levels(display_order);

-- learning_resources
CREATE INDEX IF NOT EXISTS idx_learning_resources_category ON learning_resources(category_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_difficulty ON learning_resources(difficulty_level_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_author ON learning_resources(author_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_published ON learning_resources(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_resources_featured ON learning_resources(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_resources_content_type ON learning_resources(content_type);
CREATE INDEX IF NOT EXISTS idx_learning_resources_tags ON learning_resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_learning_resources_rating ON learning_resources(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_learning_resources_views ON learning_resources(view_count DESC);

-- learning_progress
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_resource ON learning_progress(resource_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_completed ON learning_progress(is_completed, completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_progress_last_accessed ON learning_progress(last_accessed_at DESC);

-- resource_reviews
CREATE INDEX IF NOT EXISTS idx_resource_reviews_resource ON resource_reviews(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_reviews_user ON resource_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_reviews_rating ON resource_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_resource_reviews_helpful ON resource_reviews(helpful_count DESC);

-- resource_comments
CREATE INDEX IF NOT EXISTS idx_resource_comments_resource ON resource_comments(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_parent ON resource_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_user ON resource_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_created ON resource_comments(created_at DESC);

-- ===== STEP 8: RLS (Row Level Security) ポリシー設定 =====

-- resource_categories: 全員が閲覧可能
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON resource_categories;
CREATE POLICY "Categories are viewable by everyone" ON resource_categories
  FOR SELECT USING (true);

-- difficulty_levels: 全員が閲覧可能
ALTER TABLE difficulty_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Difficulty levels are viewable by everyone" ON difficulty_levels;
CREATE POLICY "Difficulty levels are viewable by everyone" ON difficulty_levels
  FOR SELECT USING (true);

-- learning_resources: 公開済みは全員、その他は作成者のみ
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published resources are viewable by everyone" ON learning_resources;
CREATE POLICY "Published resources are viewable by everyone" ON learning_resources
  FOR SELECT USING (is_published = true AND moderation_status = 'approved');

DROP POLICY IF EXISTS "Users can view own resources" ON learning_resources;
CREATE POLICY "Users can view own resources" ON learning_resources
  FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can insert own resources" ON learning_resources;
CREATE POLICY "Users can insert own resources" ON learning_resources
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own resources" ON learning_resources;
CREATE POLICY "Users can update own resources" ON learning_resources
  FOR UPDATE USING (auth.uid() = author_id);

-- learning_progress: ユーザー自身のみ
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON learning_progress;
CREATE POLICY "Users can view own progress" ON learning_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own progress" ON learning_progress;
CREATE POLICY "Users can manage own progress" ON learning_progress
  FOR ALL USING (auth.uid() = user_id);

-- resource_reviews: 全員が閲覧、投稿者が作成・更新
ALTER TABLE resource_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON resource_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON resource_reviews
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can manage own reviews" ON resource_reviews;
CREATE POLICY "Users can manage own reviews" ON resource_reviews
  FOR ALL USING (auth.uid() = user_id);

-- resource_comments: 全員が閲覧、投稿者が作成・更新
ALTER TABLE resource_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON resource_comments;
CREATE POLICY "Comments are viewable by everyone" ON resource_comments
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can manage own comments" ON resource_comments;
CREATE POLICY "Users can manage own comments" ON resource_comments
  FOR ALL USING (auth.uid() = user_id);

-- ===== STEP 9: トリガー関数とビュー =====

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_resource_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを追加
DROP TRIGGER IF EXISTS resource_categories_updated_at_trigger ON resource_categories;
CREATE TRIGGER resource_categories_updated_at_trigger
  BEFORE UPDATE ON resource_categories
  FOR EACH ROW EXECUTE FUNCTION update_resource_updated_at();

DROP TRIGGER IF EXISTS difficulty_levels_updated_at_trigger ON difficulty_levels;
CREATE TRIGGER difficulty_levels_updated_at_trigger
  BEFORE UPDATE ON difficulty_levels
  FOR EACH ROW EXECUTE FUNCTION update_resource_updated_at();

DROP TRIGGER IF EXISTS learning_resources_updated_at_trigger ON learning_resources;
CREATE TRIGGER learning_resources_updated_at_trigger
  BEFORE UPDATE ON learning_resources
  FOR EACH ROW EXECUTE FUNCTION update_resource_updated_at();

DROP TRIGGER IF EXISTS learning_progress_updated_at_trigger ON learning_progress;
CREATE TRIGGER learning_progress_updated_at_trigger
  BEFORE UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_resource_updated_at();

DROP TRIGGER IF EXISTS resource_reviews_updated_at_trigger ON resource_reviews;
CREATE TRIGGER resource_reviews_updated_at_trigger
  BEFORE UPDATE ON resource_reviews
  FOR EACH ROW EXECUTE FUNCTION update_resource_updated_at();

DROP TRIGGER IF EXISTS resource_comments_updated_at_trigger ON resource_comments;
CREATE TRIGGER resource_comments_updated_at_trigger
  BEFORE UPDATE ON resource_comments
  FOR EACH ROW EXECUTE FUNCTION update_resource_updated_at();

-- ===== STEP 10: 統計ビュー =====

-- リソース統計ビュー
CREATE OR REPLACE VIEW resource_statistics AS
SELECT 
  lr.id,
  lr.title,
  lr.content_type,
  lr.author_id,
  rc.name as category_name,
  dl.display_name as difficulty_name,
  lr.view_count,
  lr.completion_count,
  lr.like_count,
  lr.average_rating,
  lr.review_count,
  COALESCE(progress_stats.unique_learners, 0) as unique_learners,
  COALESCE(progress_stats.completion_rate, 0) as completion_rate,
  lr.created_at,
  lr.published_at
FROM learning_resources lr
LEFT JOIN resource_categories rc ON lr.category_id = rc.id
LEFT JOIN difficulty_levels dl ON lr.difficulty_level_id = dl.id
LEFT JOIN (
  SELECT 
    resource_id,
    COUNT(DISTINCT user_id) as unique_learners,
    ROUND(
      (COUNT(CASE WHEN is_completed THEN 1 END) * 100.0) / 
      NULLIF(COUNT(*), 0), 2
    ) as completion_rate
  FROM learning_progress
  GROUP BY resource_id
) progress_stats ON lr.id = progress_stats.resource_id
WHERE lr.is_published = true;

-- ユーザー学習統計ビュー
CREATE OR REPLACE VIEW user_learning_statistics AS
SELECT 
  lp.user_id,
  COUNT(*) as total_resources_accessed,
  COUNT(CASE WHEN lp.is_completed THEN 1 END) as completed_resources,
  ROUND(
    (COUNT(CASE WHEN lp.is_completed THEN 1 END) * 100.0) / 
    NULLIF(COUNT(*), 0), 2
  ) as completion_rate,
  SUM(lp.total_time_spent) as total_learning_time,
  AVG(lp.total_time_spent) as avg_time_per_resource,
  MAX(lp.last_accessed_at) as last_learning_activity
FROM learning_progress lp
GROUP BY lp.user_id;

-- ===== STEP 11: 便利な関数群 =====

-- リソース詳細取得関数
CREATE OR REPLACE FUNCTION get_resource_details(resource_id UUID, user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'resource', row_to_json(lr.*),
    'category', row_to_json(rc.*),
    'difficulty', row_to_json(dl.*),
    'author', json_build_object('id', p.id, 'username', p.username, 'display_name', p.display_name),
    'user_progress', CASE 
      WHEN user_id IS NOT NULL THEN row_to_json(lp.*)
      ELSE NULL
    END,
    'statistics', json_build_object(
      'view_count', lr.view_count,
      'completion_count', lr.completion_count,
      'average_rating', lr.average_rating,
      'review_count', lr.review_count
    )
  ) INTO result
  FROM learning_resources lr
  LEFT JOIN resource_categories rc ON lr.category_id = rc.id
  LEFT JOIN difficulty_levels dl ON lr.difficulty_level_id = dl.id
  LEFT JOIN profiles p ON lr.author_id = p.id
  LEFT JOIN learning_progress lp ON lr.id = lp.resource_id AND lp.user_id = get_resource_details.user_id
  WHERE lr.id = resource_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- リソース推薦関数（基本版）
CREATE OR REPLACE FUNCTION get_recommended_resources(target_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', lr.id,
      'title', lr.title,
      'description', lr.description,
      'content_type', lr.content_type,
      'category_name', rc.name,
      'difficulty_name', dl.display_name,
      'average_rating', lr.average_rating,
      'estimated_duration', lr.estimated_duration,
      'view_count', lr.view_count,
      'recommendation_score', recommendation_score
    )
  ) INTO result
  FROM (
    SELECT 
      lr.*,
      -- 簡単な推薦スコア計算
      (
        COALESCE(lr.average_rating * 20, 0) +
        LEAST(lr.view_count / 10, 30) +
        CASE WHEN lr.is_featured THEN 25 ELSE 0 END +
        -- 未完了のリソースに加点
        CASE WHEN lp.id IS NULL THEN 15 ELSE 0 END
      ) as recommendation_score
    FROM learning_resources lr
    LEFT JOIN learning_progress lp ON lr.id = lp.resource_id AND lp.user_id = target_user_id
    WHERE lr.is_published = true 
      AND lr.moderation_status = 'approved'
      AND (lp.is_completed IS NULL OR lp.is_completed = false)
    ORDER BY recommendation_score DESC
    LIMIT limit_count
  ) lr
  LEFT JOIN resource_categories rc ON lr.category_id = rc.id
  LEFT JOIN difficulty_levels dl ON lr.difficulty_level_id = dl.id;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 実行完了メッセージ
SELECT 'Phase 6: 学習リソース管理システム データベース設計完了' as message; 
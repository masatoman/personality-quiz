-- auth スキーマの作成（Supabase Auth 用）
CREATE SCHEMA IF NOT EXISTS auth;
COMMENT ON SCHEMA auth IS 'スキーマに含まれるのは認証関連の情報です';

-- auth.uid()関数の作成
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claim.sub', true),
    current_setting('request.jwt.claims', true)::json->>'sub'
  )::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- storage スキーマの作成（Supabase Storage 用）
CREATE SCHEMA IF NOT EXISTS storage;
COMMENT ON SCHEMA storage IS 'スキーマに含まれるのはファイルストレージ関連のオブジェクトです';

-- RLSポリシーを適用するための役割
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;

-- テーブル定義開始

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  personality_type TEXT CHECK (personality_type IN ('giver', 'matcher', 'taker')),
  giver_score INTEGER DEFAULT 50 CHECK (giver_score BETWEEN 0 AND 100),
  points INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE users IS 'ユーザー基本情報とギバースコア';

-- プロフィールテーブル
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT TRUE
);
COMMENT ON TABLE profiles IS 'ユーザープロフィール詳細情報';

-- コンテンツ/教材テーブル
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE materials IS '教材コンテンツ情報（JSONBフィールドに構造化コンテンツを格納）';

-- コンテンツへのフィードバックテーブル
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_helpful BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(material_id, user_id) -- 一人のユーザーが一つの教材に対して1つのフィードバック
);
COMMENT ON TABLE feedback IS '教材へのフィードバック・評価情報';

-- 学習進捗テーブル
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, material_id)
);
COMMENT ON TABLE learning_progress IS 'ユーザーごとの教材学習進捗状況';

-- ユーザーアクティビティログテーブル
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  points INTEGER DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE activities IS 'ユーザーアクション履歴とポイント付与記録';
CREATE INDEX activities_user_id_idx ON activities(user_id);
CREATE INDEX activities_created_at_idx ON activities(created_at);

-- バッジ定義テーブル
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  criteria JSONB NOT NULL, -- バッジ獲得条件をJSON形式で保存
  points INTEGER DEFAULT 0,
  badge_type TEXT CHECK (badge_type IN ('achievement', 'skill', 'participation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE badges IS 'バッジ定義とその獲得条件';

-- ユーザーバッジテーブル
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  UNIQUE(user_id, badge_id)
);
COMMENT ON TABLE user_badges IS 'ユーザーが獲得したバッジ情報';

-- 心理タイプ診断質問テーブル
CREATE TABLE IF NOT EXISTS personality_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- 選択肢と各タイプへのスコア配分
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE personality_questions IS 'ギバー/マッチャー/テイカー診断用の質問';

-- 診断結果履歴テーブル
CREATE TABLE IF NOT EXISTS personality_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  result_type TEXT CHECK (result_type IN ('giver', 'matcher', 'taker')),
  giver_score INTEGER NOT NULL CHECK (giver_score BETWEEN 0 AND 100),
  answers JSONB, -- 回答内容の保存（オプション）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE personality_results IS 'ユーザーの診断結果履歴（スコア変動の追跡用）';

-- インデックス作成
CREATE INDEX materials_user_id_idx ON materials(user_id);
CREATE INDEX materials_category_idx ON materials(category);
CREATE INDEX materials_created_at_idx ON materials(created_at);
CREATE INDEX materials_rating_idx ON materials(rating);
CREATE INDEX learning_progress_user_id_idx ON learning_progress(user_id);
CREATE INDEX user_badges_user_id_idx ON user_badges(user_id);
CREATE INDEX personality_results_user_id_idx ON personality_results(user_id);

-- RLS（Row Level Security）ポリシーの作成
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_results ENABLE ROW LEVEL SECURITY;

-- ユーザー用ポリシー
CREATE POLICY users_read_own ON users FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY profiles_read_public ON profiles FOR SELECT
  USING (is_public OR user_id = auth.uid() OR is_admin());

CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

-- 教材用ポリシー
CREATE POLICY materials_read_published ON materials FOR SELECT
  USING (is_published OR user_id = auth.uid() OR is_admin());

CREATE POLICY materials_crud_own ON materials FOR ALL
  USING (user_id = auth.uid() OR is_admin());

-- フィードバック用ポリシー
CREATE POLICY feedback_read_all ON feedback FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY feedback_crud_own ON feedback FOR ALL
  USING (user_id = auth.uid() OR is_admin());

-- 学習進捗用ポリシー
CREATE POLICY learning_progress_read_own ON learning_progress FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY learning_progress_update_own ON learning_progress FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

-- アクティビティログ用ポリシー
CREATE POLICY activities_read_own ON activities FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- ヘルパー関数
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND email IN (SELECT admin_email FROM admin_settings)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者設定テーブル
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  admin_email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS適用
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_settings_read ON admin_settings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY admin_settings_write ON admin_settings FOR ALL TO service_role USING (TRUE);

-- トリガー関数: 教材更新時に更新日時を設定
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_materials_modtime
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 
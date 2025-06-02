-- テーブル定義開始

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  personality_type TEXT CHECK (personality_type IN ('giver', 'matcher', 'taker')),
  giver_score INTEGER DEFAULT 50 CHECK (giver_score BETWEEN 0 AND 100),
  points INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE public.users IS 'ユーザー基本情報とギバースコア';

-- プロフィールテーブル
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT TRUE
);
COMMENT ON TABLE public.profiles IS 'ユーザープロフィール詳細情報';

-- コンテンツ/教材テーブル
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  allow_comments BOOLEAN DEFAULT TRUE,
  target_audience TEXT[] DEFAULT '{}',
  prerequisites TEXT,
  language TEXT DEFAULT 'ja',
  version TEXT DEFAULT '1.0.0',
  view_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE public.materials IS '教材コンテンツ情報（JSONBフィールドに構造化コンテンツを格納）';

-- 教材セクションテーブル（新規追加）
CREATE TABLE IF NOT EXISTS public.material_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'quiz')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  options TEXT[],
  answer INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE public.material_sections IS '教材内のセクション・コンテンツ情報';

-- コンテンツへのフィードバックテーブル
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_helpful BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(material_id, user_id) -- 一人のユーザーが一つの教材に対して1つのフィードバック
);
COMMENT ON TABLE public.feedback IS '教材へのフィードバック・評価情報';

-- 学習進捗テーブル
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, material_id)
);
COMMENT ON TABLE public.learning_progress IS 'ユーザーごとの教材学習進捗状況';

-- ユーザーアクティビティログテーブル
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  points INTEGER DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE public.activities IS 'ユーザーアクション履歴とポイント付与記録';
CREATE INDEX activities_user_id_idx ON public.activities(user_id);
CREATE INDEX activities_created_at_idx ON public.activities(created_at);

-- バッジ定義テーブル
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  criteria JSONB NOT NULL, -- バッジ獲得条件をJSON形式で保存
  points INTEGER DEFAULT 0,
  badge_type TEXT CHECK (badge_type IN ('achievement', 'skill', 'participation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE public.badges IS 'バッジ定義とその獲得条件';

-- ユーザーバッジテーブル
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  UNIQUE(user_id, badge_id)
);
COMMENT ON TABLE public.user_badges IS 'ユーザーが獲得したバッジ情報';

-- 心理タイプ診断質問テーブル
CREATE TABLE IF NOT EXISTS public.personality_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- 選択肢と各タイプへのスコア配分
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE public.personality_questions IS 'ギバー/マッチャー/テイカー診断用の質問';

-- 診断結果履歴テーブル
CREATE TABLE IF NOT EXISTS public.personality_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  result_type TEXT CHECK (result_type IN ('giver', 'matcher', 'taker')),
  giver_score INTEGER NOT NULL CHECK (giver_score BETWEEN 0 AND 100),
  answers JSONB, -- 回答内容の保存（オプション）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE public.personality_results IS 'ユーザーの診断結果履歴（スコア変動の追跡用）';

-- クイズ結果テーブル
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE public.quiz_results IS 'ユーザーのクイズ結果';
CREATE INDEX quiz_results_user_id_idx ON public.quiz_results(user_id);
CREATE INDEX quiz_results_created_at_idx ON public.quiz_results(created_at);

-- インデックス作成
CREATE INDEX materials_user_id_idx ON public.materials(author_id);
CREATE INDEX materials_category_idx ON public.materials(category);
CREATE INDEX materials_created_at_idx ON public.materials(created_at);
CREATE INDEX materials_rating_idx ON public.materials(rating);
CREATE INDEX learning_progress_user_id_idx ON public.learning_progress(user_id);
CREATE INDEX user_badges_user_id_idx ON public.user_badges(user_id);
CREATE INDEX personality_results_user_id_idx ON public.personality_results(user_id);

-- 管理者設定テーブル
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  admin_email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 管理者判定関数
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND email IN (SELECT admin_email FROM public.admin_settings)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS（Row Level Security）ポリシーの作成
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- ユーザー用ポリシー
CREATE POLICY users_read_own ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_read_public ON public.profiles FOR SELECT
  USING (is_public OR user_id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- 教材用ポリシー
CREATE POLICY materials_read_published ON public.materials FOR SELECT
  USING (status = 'published' OR author_id = auth.uid() OR public.is_admin());

CREATE POLICY materials_crud_own ON public.materials FOR ALL
  USING (author_id = auth.uid() OR public.is_admin());

-- フィードバック用ポリシー
CREATE POLICY feedback_read_all ON public.feedback FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY feedback_crud_own ON public.feedback FOR ALL
  USING (user_id = auth.uid() OR public.is_admin());

-- 学習進捗用ポリシー
CREATE POLICY learning_progress_read_own ON public.learning_progress FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY learning_progress_update_own ON public.learning_progress FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- アクティビティログ用ポリシー
CREATE POLICY activities_read_own ON public.activities FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- 管理者設定ポリシー
CREATE POLICY admin_settings_read ON public.admin_settings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY admin_settings_write ON public.admin_settings FOR ALL TO service_role USING (TRUE);

-- トリガー関数: 教材更新時に更新日時を設定
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_materials_modtime
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column(); 
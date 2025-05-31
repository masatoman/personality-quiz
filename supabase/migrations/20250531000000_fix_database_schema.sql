-- user_activitiesテーブルの作成
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- materialsテーブルの作成（author_idカラム含む）
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    estimated_time INTEGER, -- 分単位
    author_id UUID REFERENCES public.profiles(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 既存のmaterialsテーブルにauthor_idカラムが存在しない場合は追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' 
        AND column_name = 'author_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.materials ADD COLUMN author_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- user_pointsテーブルの作成
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- point_historyテーブルの作成
CREATE TABLE IF NOT EXISTS public.point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    points_change INTEGER NOT NULL,
    reason VARCHAR(255),
    activity_id UUID REFERENCES public.user_activities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- badgesテーブルの作成
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    criteria JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- user_badgesテーブルの作成
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    badge_id UUID REFERENCES public.badges(id) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS user_activities_user_id_idx ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS user_activities_created_at_idx ON public.user_activities(created_at);
CREATE INDEX IF NOT EXISTS materials_author_id_idx ON public.materials(author_id);
CREATE INDEX IF NOT EXISTS materials_category_idx ON public.materials(category);
CREATE INDEX IF NOT EXISTS user_points_user_id_idx ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS point_history_user_id_idx ON public.point_history(user_id);
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON public.user_badges(user_id);

-- RLSポリシーの設定
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- user_activitiesのRLSポリシー
CREATE POLICY "ユーザー活動は本人のみ参照可能" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザー活動は本人のみ作成可能" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- materialsのRLSポリシー
CREATE POLICY "公開教材は誰でも参照可能" ON public.materials
    FOR SELECT USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "教材は作成者のみ更新可能" ON public.materials
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "教材は認証済みユーザーが作成可能" ON public.materials
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- user_pointsのRLSポリシー
CREATE POLICY "ポイントは本人のみ参照可能" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

-- point_historyのRLSポリシー
CREATE POLICY "ポイント履歴は本人のみ参照可能" ON public.point_history
    FOR SELECT USING (auth.uid() = user_id);

-- badgesのRLSポリシー
CREATE POLICY "バッジは誰でも参照可能" ON public.badges
    FOR SELECT USING (true);

-- user_badgesのRLSポリシー
CREATE POLICY "ユーザーバッジは本人のみ参照可能" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

-- materialsテーブルの更新トリガー
CREATE TRIGGER handle_materials_updated_at
    BEFORE UPDATE ON public.materials
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 初期データの投入（基本的なバッジ）
INSERT INTO public.badges (name, description, criteria) VALUES
    ('初回診断完了', 'ギバー診断を初めて完了した', '{"type": "quiz_completion", "count": 1}'),
    ('学習熱心', '5つの教材を閲覧した', '{"type": "material_view", "count": 5}'),
    ('貢献者', '初めて教材を作成した', '{"type": "material_creation", "count": 1}')
ON CONFLICT DO NOTHING; 
-- profiles テーブルの作成
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSポリシーの設定
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "プロフィールは誰でも参照可能" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "プロフィールは本人のみ更新可能" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 新規プロフィール作成用ポリシーを追加
CREATE POLICY "認証ユーザーは自分のプロフィールを作成可能" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- giver_scores テーブルの作成
CREATE TABLE public.giver_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    score_type VARCHAR(50) NOT NULL,
    score_value INTEGER NOT NULL CHECK (score_value >= 0 AND score_value <= 100),
    activity_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- インデックスの作成
CREATE INDEX giver_scores_user_id_idx ON public.giver_scores(user_id);
CREATE INDEX giver_scores_created_at_idx ON public.giver_scores(created_at);
CREATE INDEX giver_scores_score_type_idx ON public.giver_scores(score_type);

-- RLSポリシーの設定
ALTER TABLE public.giver_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ギバースコアは誰でも参照可能" ON public.giver_scores
    FOR SELECT USING (true);

CREATE POLICY "ギバースコアは本人のみ作成可能" ON public.giver_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 更新関数の作成
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- プロフィール更新時のトリガー
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
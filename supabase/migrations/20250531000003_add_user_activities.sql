-- user_activitiesテーブルの作成
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
CREATE POLICY "Users can view their own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- システムによる活動記録を許可するポリシー
CREATE POLICY "Service role can manage all activities" ON public.user_activities
    FOR ALL USING (auth.role() = 'service_role');

-- コメント追加
COMMENT ON TABLE public.user_activities IS 'ユーザーの活動履歴を記録するテーブル';
COMMENT ON COLUMN public.user_activities.user_id IS 'ユーザーのID（外部キー）';
COMMENT ON COLUMN public.user_activities.activity_type IS '活動タイプ（quiz_completed, material_created等）';
COMMENT ON COLUMN public.user_activities.activity_data IS '活動の詳細データ（JSON形式）';
COMMENT ON COLUMN public.user_activities.points_earned IS 'この活動で獲得したポイント数';
COMMENT ON COLUMN public.user_activities.created_at IS '活動が記録された日時'; 
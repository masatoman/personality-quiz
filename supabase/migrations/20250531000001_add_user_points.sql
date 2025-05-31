-- user_pointsテーブルの作成
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_last_updated ON public.user_points(last_updated);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
CREATE POLICY "Users can view their own points" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON public.user_points
    FOR UPDATE USING (auth.uid() = user_id);

-- システムによるポイント操作を許可するポリシー
CREATE POLICY "Service role can manage all points" ON public.user_points
    FOR ALL USING (auth.role() = 'service_role');

-- コメント追加
COMMENT ON TABLE public.user_points IS 'ユーザーのポイント残高を管理するテーブル';
COMMENT ON COLUMN public.user_points.user_id IS 'ユーザーのID（外部キー）';
COMMENT ON COLUMN public.user_points.points IS 'ユーザーの現在のポイント数';
COMMENT ON COLUMN public.user_points.last_updated IS 'ポイントが最後に更新された日時'; 
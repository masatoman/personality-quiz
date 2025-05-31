-- user_badgesテーブルの作成
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id VARCHAR(100) NOT NULL,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_acquired_at ON public.user_badges(acquired_at);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

-- システムによるバッジ操作を許可するポリシー
CREATE POLICY "Service role can manage all badges" ON public.user_badges
    FOR ALL USING (auth.role() = 'service_role');

-- 公開バッジ表示ポリシー（他のユーザーのバッジを閲覧可能）
CREATE POLICY "Public badge viewing" ON public.user_badges
    FOR SELECT USING (true);

-- コメント追加
COMMENT ON TABLE public.user_badges IS 'ユーザーの獲得バッジを管理するテーブル';
COMMENT ON COLUMN public.user_badges.user_id IS 'ユーザーのID（外部キー）';
COMMENT ON COLUMN public.user_badges.badge_id IS 'バッジのID（文字列）';
COMMENT ON COLUMN public.user_badges.acquired_at IS 'バッジを獲得した日時'; 
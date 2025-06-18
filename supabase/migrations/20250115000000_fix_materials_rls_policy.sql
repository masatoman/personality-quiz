-- materialsテーブルのRLSポリシーを修正
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "公開教材は誰でも参照可能" ON public.materials;
DROP POLICY IF EXISTS "教材は作成者のみ更新可能" ON public.materials;
DROP POLICY IF EXISTS "教材は認証済みユーザーが作成可能" ON public.materials;

-- 正しいカラム名（is_published）を使用した新しいポリシーを作成
CREATE POLICY "公開教材は誰でも参照可能" ON public.materials
    FOR SELECT USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY "教材は作成者のみ更新可能" ON public.materials
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "教材は認証済みユーザーが作成可能" ON public.materials
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- is_publishedカラムが存在しない場合は追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' 
        AND column_name = 'is_published'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.materials ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
END $$;

-- is_publicカラムが存在する場合は、is_publishedにデータを移行
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' 
        AND column_name = 'is_public'
        AND table_schema = 'public'
    ) THEN
        UPDATE public.materials SET is_published = is_public WHERE is_published IS NULL;
        ALTER TABLE public.materials DROP COLUMN IF EXISTS is_public;
    END IF;
END $$; 
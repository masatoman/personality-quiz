-- お気に入り教材テーブル
CREATE TABLE IF NOT EXISTS public.user_material_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, material_id)
);

-- 教材セクションテーブル（コンテンツの構造化）
CREATE TABLE IF NOT EXISTS public.material_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'text', -- text, image, video, quiz, code
    title VARCHAR(500),
    content TEXT,
    options JSONB, -- クイズの選択肢など
    answer INTEGER, -- クイズの正解番号
    "order" INTEGER DEFAULT 0,
    format VARCHAR(50) DEFAULT 'markdown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- materialsテーブルに不足している重要カラムを追加
DO $$ 
BEGIN
    -- view_count カラム（閲覧数）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'view_count') THEN
        ALTER TABLE public.materials ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    
    -- rating カラム（評価）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'rating') THEN
        ALTER TABLE public.materials ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0;
    END IF;
    
    -- is_public カラム（公開状態）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'is_public') THEN
        ALTER TABLE public.materials ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    
    -- category カラム（カテゴリ）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'category') THEN
        ALTER TABLE public.materials ADD COLUMN category VARCHAR(100);
    END IF;
    
    -- language カラム（言語）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'language') THEN
        ALTER TABLE public.materials ADD COLUMN language VARCHAR(10) DEFAULT 'ja';
    END IF;
    
    -- version カラム（バージョン）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'version') THEN
        ALTER TABLE public.materials ADD COLUMN version VARCHAR(20) DEFAULT '1.0.0';
    END IF;
    
    -- target_audience カラム（対象者）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'target_audience') THEN
        ALTER TABLE public.materials ADD COLUMN target_audience TEXT[];
    END IF;
    
    -- allow_comments カラム（コメント許可）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'allow_comments') THEN
        ALTER TABLE public.materials ADD COLUMN allow_comments BOOLEAN DEFAULT true;
    END IF;
    
    -- prerequisites カラム（前提知識）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'prerequisites') THEN
        ALTER TABLE public.materials ADD COLUMN prerequisites TEXT;
    END IF;
END $$;

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_user_material_favorites_user_id ON public.user_material_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_material_favorites_material_id ON public.user_material_favorites(material_id);
CREATE INDEX IF NOT EXISTS idx_material_sections_material_id ON public.material_sections(material_id);
CREATE INDEX IF NOT EXISTS idx_material_sections_order ON public.material_sections(material_id, "order");
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_view_count ON public.materials(view_count);
CREATE INDEX IF NOT EXISTS idx_materials_rating ON public.materials(rating);
CREATE INDEX IF NOT EXISTS idx_materials_is_public ON public.materials(is_public);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.user_material_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_sections ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成

-- お気に入り教材: ユーザーは自分のお気に入りのみ見る・操作可能
CREATE POLICY "Users can manage their own favorites" ON public.user_material_favorites
    FOR ALL USING (auth.uid() = user_id);

-- 教材セクション: 作成者は編集可能、公開教材は誰でも閲覧可能
CREATE POLICY "Material sections are viewable by everyone for public materials" ON public.material_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.materials 
            WHERE materials.id = material_sections.material_id 
            AND (materials.is_public = true OR materials.author_id = auth.uid())
        )
    );

CREATE POLICY "Authors can manage their material sections" ON public.material_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.materials 
            WHERE materials.id = material_sections.material_id 
            AND materials.author_id = auth.uid()
        )
    );

-- 既存ポリシーが存在する場合のエラーを無視
DO $$ 
BEGIN
    -- materialsテーブルのRLS有効化（既に有効化されている可能性）
    BEGIN
        ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- エラーを無視
    END;

    -- 既存のmaterialsポリシーがない場合のみ作成
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materials' AND policyname = 'Public materials are viewable by everyone') THEN
        CREATE POLICY "Public materials are viewable by everyone" ON public.materials
            FOR SELECT USING (is_public = true OR author_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materials' AND policyname = 'Authors can manage their own materials') THEN
        CREATE POLICY "Authors can manage their own materials" ON public.materials
            FOR ALL USING (author_id = auth.uid());
    END IF;
END $$; 
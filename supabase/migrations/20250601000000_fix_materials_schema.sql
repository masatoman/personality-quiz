-- materialsテーブルの構造を統一
-- user_idをオプショナルにして、author_idを統一する

-- user_idのNOT NULL制約を削除
ALTER TABLE public.materials ALTER COLUMN user_id DROP NOT NULL;

-- difficulty関連のカラムを統一
-- difficultyカラムが存在しない場合は追加
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));

-- difficulty_levelからdifficultyにデータ移行
UPDATE public.materials 
SET difficulty = CASE 
  WHEN difficulty_level = 1 THEN 'beginner'
  WHEN difficulty_level = 2 THEN 'beginner'
  WHEN difficulty_level = 3 THEN 'intermediate'
  WHEN difficulty_level = 4 THEN 'advanced'
  WHEN difficulty_level = 5 THEN 'advanced'
  ELSE 'beginner'
END
WHERE difficulty IS NULL AND difficulty_level IS NOT NULL;

-- author_idを優先し、user_idが設定されている場合はauthor_idに移行
UPDATE public.materials 
SET author_id = user_id 
WHERE author_id IS NULL AND user_id IS NOT NULL;

-- 追加の必要なカラムを追加
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'published';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT TRUE;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT '{}';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS prerequisites TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ja';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0';

-- is_publishedをstatusに変換
UPDATE public.materials 
SET status = CASE 
  WHEN is_published = true THEN 'published'
  ELSE 'draft'
END
WHERE status = 'published';

-- material_sectionsテーブルが存在しない場合は作成
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

-- インデックスの追加
CREATE INDEX IF NOT EXISTS material_sections_material_id_idx ON public.material_sections(material_id);
CREATE INDEX IF NOT EXISTS material_sections_order_idx ON public.material_sections(material_id, "order");

-- materialsテーブルのポリシーを更新
DROP POLICY IF EXISTS materials_read_published ON public.materials;
CREATE POLICY materials_read_published ON public.materials FOR SELECT
  USING (status = 'published' OR author_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS materials_crud_own ON public.materials;
CREATE POLICY materials_crud_own ON public.materials FOR ALL
  USING (author_id = auth.uid() OR user_id = auth.uid()); 
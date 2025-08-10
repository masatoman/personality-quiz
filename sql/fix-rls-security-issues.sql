-- ========================================
-- RLSセキュリティエラー修復スクリプト
-- 2025-06-18 緊急修復
-- ========================================

-- 1. materialsテーブルのRLS有効化
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- 2. user_material_favoritesテーブルのRLS有効化  
ALTER TABLE public.user_material_favorites ENABLE ROW LEVEL SECURITY;

-- 3. material_sectionsテーブルのRLS有効化
ALTER TABLE public.material_sections ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLSポリシー設定
-- ========================================

-- materialsテーブル用ポリシー
DROP POLICY IF EXISTS "materials_select_policy" ON public.materials;
CREATE POLICY "materials_select_policy" ON public.materials
    FOR SELECT USING (
        is_published = true OR 
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "materials_insert_policy" ON public.materials;
CREATE POLICY "materials_insert_policy" ON public.materials
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "materials_update_policy" ON public.materials;
CREATE POLICY "materials_update_policy" ON public.materials
    FOR UPDATE USING (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "materials_delete_policy" ON public.materials;
CREATE POLICY "materials_delete_policy" ON public.materials
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- user_material_favoritesテーブル用ポリシー
DROP POLICY IF EXISTS "favorites_select_policy" ON public.user_material_favorites;
CREATE POLICY "favorites_select_policy" ON public.user_material_favorites
    FOR SELECT USING (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "favorites_insert_policy" ON public.user_material_favorites;
CREATE POLICY "favorites_insert_policy" ON public.user_material_favorites
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "favorites_delete_policy" ON public.user_material_favorites;
CREATE POLICY "favorites_delete_policy" ON public.user_material_favorites
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- material_sectionsテーブル用ポリシー
DROP POLICY IF EXISTS "sections_select_policy" ON public.material_sections;
CREATE POLICY "sections_select_policy" ON public.material_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.materials m 
            WHERE m.id = material_sections.material_id 
            AND (m.is_published = true OR m.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "sections_insert_policy" ON public.material_sections;
CREATE POLICY "sections_insert_policy" ON public.material_sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.materials m 
            WHERE m.id = material_sections.material_id 
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "sections_update_policy" ON public.material_sections;
CREATE POLICY "sections_update_policy" ON public.material_sections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.materials m 
            WHERE m.id = material_sections.material_id 
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "sections_delete_policy" ON public.material_sections;
CREATE POLICY "sections_delete_policy" ON public.material_sections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.materials m 
            WHERE m.id = material_sections.material_id 
            AND m.user_id = auth.uid()
        )
    );

-- ========================================
-- 匿名アクセス用ポリシー（公開教材用）
-- ========================================

-- 匿名ユーザーが公開教材を閲覧できるようにする
DROP POLICY IF EXISTS "materials_anonymous_select" ON public.materials;
CREATE POLICY "materials_anonymous_select" ON public.materials
    FOR SELECT USING (
        is_published = true
    );

-- ========================================
-- セキュリティ設定確認用クエリ
-- ========================================

-- RLS有効化状況確認
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t 
WHERE schemaname = 'public' 
AND tablename IN ('materials', 'user_material_favorites', 'material_sections')
ORDER BY tablename;

-- ポリシー一覧確認  
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('materials', 'user_material_favorites', 'material_sections')
ORDER BY tablename, policyname; 
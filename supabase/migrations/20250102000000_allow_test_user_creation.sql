-- テストユーザー作成のためのRLSポリシーを追加

-- プロフィールテーブルのINSERTポリシーを追加（開発環境でのテスト用）
CREATE POLICY "テストユーザープロフィール作成許可" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- ギバースコアテーブルのINSERTポリシーを更新（テスト用）
DROP POLICY IF EXISTS "ギバースコアは本人のみ作成可能" ON public.giver_scores;

CREATE POLICY "ギバースコア作成許可" ON public.giver_scores
    FOR INSERT WITH CHECK (true); 
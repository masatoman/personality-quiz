-- 2025/01/03: profilesテーブルのINSERTポリシー修正
-- 問題: 新規ユーザー登録時にプロフィール作成ができない
-- 解決: 認証済みユーザーが自分のプロフィールを作成できるINSERTポリシーを追加

-- 既存のINSERTポリシーがあれば削除（冪等性保証）
DROP POLICY IF EXISTS "認証ユーザーは自分のプロフィールを作成可能" ON public.profiles;

-- 新規プロフィール作成用ポリシーを追加
CREATE POLICY "認証ユーザーは自分のプロフィールを作成可能" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 確認: profilesテーブルのポリシー一覧表示
-- \d+ public.profiles 
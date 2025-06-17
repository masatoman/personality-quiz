-- 2025/01/03: 新規ユーザー登録時のプロフィール自動作成修正
-- 問題: 新規ユーザー登録時にプロフィールが自動作成されない
-- 解決: トリガー関数を修正し、確実にプロフィールが作成されるようにする

-- 既存のトリガーを削除（冪等性保証）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 新規ユーザー登録時にプロフィールを自動作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- profilesテーブルにプロフィールを作成
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'user_' || SUBSTR(NEW.id::TEXT, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous User'),
    NULL,
    NULL
  );
  
  -- user_pointsテーブルにポイント情報を作成（存在する場合）
  INSERT INTO public.user_points (user_id, total_points, giver_score)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生してもユーザー作成は続行
    RAISE WARNING 'プロフィール作成でエラーが発生しました: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新規ユーザー作成時のトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- profilesテーブルのRLSポリシーを確認・修正
DROP POLICY IF EXISTS "認証ユーザーは自分のプロフィールを作成可能" ON public.profiles;
CREATE POLICY "認証ユーザーは自分のプロフィールを作成可能" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 確認用: 既存のauth.usersからプロフィールを作成（必要な場合）
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'user_' || SUBSTR(id::TEXT, 1, 8)),
  COALESCE(raw_user_meta_data->>'name', 'Anonymous User'),
  NULL,
  NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 実行完了メッセージ
SELECT 'ユーザー登録トリガー関数の修正完了' as message; 
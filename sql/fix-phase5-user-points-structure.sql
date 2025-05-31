-- Phase 5: user_pointsテーブル構造修正 SQL
-- user_pointsテーブルが存在しない、または構造が異なる場合の対応

-- 1. 現在のuser_pointsテーブル構造を確認
DO $$
BEGIN
  -- user_pointsテーブルが存在するかチェック
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_points') THEN
    RAISE NOTICE 'user_pointsテーブルが存在します';
  ELSE
    RAISE NOTICE 'user_pointsテーブルが存在しません。作成します。';
  END IF;
END $$;

-- 2. user_pointsテーブルを作成（存在しない場合）
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  giver_score INTEGER DEFAULT 0,
  last_earned_at TIMESTAMP WITH TIME ZONE NULL,
  last_spent_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. 必要なカラムを追加（存在しない場合）
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS giver_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_earned_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS last_spent_at TIMESTAMP WITH TIME ZONE NULL;

-- 4. インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_giver_score ON user_points(giver_score DESC);

-- 5. RLS (Row Level Security) ポリシー設定
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のポイント情報のみ閲覧可能
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

-- 認証済みユーザーは自分のポイント情報を更新可能
DROP POLICY IF EXISTS "Users can update own points" ON user_points;
CREATE POLICY "Users can update own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);

-- 認証済みユーザーは自分のポイント情報を作成可能
DROP POLICY IF EXISTS "Users can insert own points" ON user_points;
CREATE POLICY "Users can insert own points" ON user_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_user_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_points_updated_at_trigger ON user_points;
CREATE TRIGGER user_points_updated_at_trigger
  BEFORE UPDATE ON user_points
  FOR EACH ROW EXECUTE FUNCTION update_user_points_updated_at();

-- 7. 既存のusersテーブルからのデータ移行（pointsカラムが存在する場合）
DO $$
BEGIN
  -- usersテーブルにpointsカラムが存在する場合、データを移行
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'points'
  ) THEN
    INSERT INTO user_points (user_id, total_points)
    SELECT id, COALESCE(points, 0)
    FROM users
    WHERE id NOT IN (SELECT user_id FROM user_points)
    ON CONFLICT (user_id) DO UPDATE SET
      total_points = EXCLUDED.total_points;
    
    RAISE NOTICE 'usersテーブルからポイントデータを移行しました';
  END IF;
END $$;

-- 8. テーブル構造確認のための情報表示
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_points'
ORDER BY ordinal_position;

SELECT 'user_pointsテーブル構造修正完了' as message; 
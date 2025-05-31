-- Phase 5: ポイントシステム拡張 SQL (修正版)
-- 実行日: 2024年
-- 概要: ポイント取引履歴テーブルとギバースコア機能の追加

-- ===== STEP 1: user_pointsテーブル構造確認・作成 =====

-- user_pointsテーブルを作成（存在しない場合）
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

-- 必要なカラムを追加（存在しない場合）
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS giver_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_earned_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS last_spent_at TIMESTAMP WITH TIME ZONE NULL;

-- ===== STEP 2: ポイント取引履歴テーブル作成 =====

CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'consumed')),
  points INTEGER NOT NULL CHECK (points > 0),
  activity_type TEXT NOT NULL,
  reference_id UUID NULL, -- 参照先のID（教材ID、クイズIDなど）
  reference_type TEXT NULL, -- 参照先のタイプ（material, quiz, commentなど）
  description TEXT,
  previous_balance INTEGER NOT NULL DEFAULT 0,
  new_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 3: インデックス作成 =====

-- user_pointsテーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_giver_score ON user_points(giver_score DESC);

-- point_transactionsテーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_activity ON point_transactions(activity_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_point_transactions_reference ON point_transactions(reference_id, reference_type);

-- ===== STEP 4: RLS (Row Level Security) ポリシー設定 =====

-- user_pointsテーブルのRLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own points" ON user_points;
CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own points" ON user_points;
CREATE POLICY "Users can update own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own points" ON user_points;
CREATE POLICY "Users can insert own points" ON user_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- point_transactionsテーブルのRLS
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON point_transactions;
CREATE POLICY "Users can view own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON point_transactions;
CREATE POLICY "Authenticated users can insert transactions" ON point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== STEP 5: トリガー関数 =====

-- user_pointsテーブル用updated_at自動更新
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

-- point_transactionsテーブル用updated_at自動更新
CREATE OR REPLACE FUNCTION update_point_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS point_transactions_updated_at_trigger ON point_transactions;
CREATE TRIGGER point_transactions_updated_at_trigger
  BEFORE UPDATE ON point_transactions
  FOR EACH ROW EXECUTE FUNCTION update_point_transactions_updated_at();

-- ===== STEP 6: ポイント統計ビュー作成 =====

CREATE OR REPLACE VIEW user_point_statistics AS
SELECT 
  up.user_id,
  up.total_points,
  up.giver_score,
  up.last_earned_at,
  up.last_spent_at,
  COALESCE(earn_stats.total_earned, 0) as lifetime_earned,
  COALESCE(spend_stats.total_spent, 0) as lifetime_spent,
  COALESCE(earn_stats.earn_count, 0) as earn_transaction_count,
  COALESCE(spend_stats.spend_count, 0) as spend_transaction_count
FROM user_points up
LEFT JOIN (
  SELECT 
    user_id,
    SUM(points) as total_earned,
    COUNT(*) as earn_count
  FROM point_transactions 
  WHERE transaction_type = 'earned'
  GROUP BY user_id
) earn_stats ON up.user_id = earn_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(points) as total_spent,
    COUNT(*) as spend_count
  FROM point_transactions 
  WHERE transaction_type = 'consumed'
  GROUP BY user_id
) spend_stats ON up.user_id = spend_stats.user_id;

-- ===== STEP 7: ギバーランキングビュー作成 =====

CREATE OR REPLACE VIEW giver_rankings AS
SELECT 
  up.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  up.giver_score,
  up.total_points,
  ROW_NUMBER() OVER (ORDER BY up.giver_score DESC, up.total_points DESC) as rank,
  COALESCE(weekly_giver.weekly_score, 0) as weekly_giver_score,
  COALESCE(monthly_giver.monthly_score, 0) as monthly_giver_score
FROM user_points up
JOIN profiles p ON up.user_id = p.id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(points_earned) as weekly_score
  FROM user_activities 
  WHERE activity_type LIKE 'giver_%' 
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY user_id
) weekly_giver ON up.user_id = weekly_giver.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(points_earned) as monthly_score
  FROM user_activities 
  WHERE activity_type LIKE 'giver_%' 
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
) monthly_giver ON up.user_id = monthly_giver.user_id
WHERE up.giver_score > 0
ORDER BY up.giver_score DESC;

-- ===== STEP 8: 便利な関数群 =====

-- ユーザーポイント概要取得関数
CREATE OR REPLACE FUNCTION get_user_point_summary(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', target_user_id,
    'total_points', COALESCE(total_points, 0),
    'giver_score', COALESCE(giver_score, 0),
    'lifetime_earned', COALESCE(lifetime_earned, 0),
    'lifetime_spent', COALESCE(lifetime_spent, 0),
    'last_activity', GREATEST(last_earned_at, last_spent_at)
  ) INTO result
  FROM user_point_statistics
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(result, json_build_object(
    'user_id', target_user_id,
    'total_points', 0,
    'giver_score', 0,
    'lifetime_earned', 0,
    'lifetime_spent', 0,
    'last_activity', null
  ));
END;
$$ LANGUAGE plpgsql;

-- ギバーランク取得関数
CREATE OR REPLACE FUNCTION get_user_giver_rank(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_rank INTEGER;
BEGIN
  SELECT rank INTO user_rank
  FROM giver_rankings
  WHERE user_id = target_user_id;
  
  RETURN user_rank;
END;
$$ LANGUAGE plpgsql;

-- 全体統計関数
CREATE OR REPLACE FUNCTION get_points_system_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users_with_points', (SELECT COUNT(*) FROM user_points WHERE total_points > 0),
    'total_points_in_circulation', (SELECT SUM(total_points) FROM user_points),
    'total_giver_score', (SELECT SUM(giver_score) FROM user_points),
    'total_transactions', (SELECT COUNT(*) FROM point_transactions),
    'points_earned_today', (
      SELECT COALESCE(SUM(points), 0) 
      FROM point_transactions 
      WHERE transaction_type = 'earned' 
        AND created_at >= CURRENT_DATE
    ),
    'points_spent_today', (
      SELECT COALESCE(SUM(points), 0) 
      FROM point_transactions 
      WHERE transaction_type = 'consumed' 
        AND created_at >= CURRENT_DATE
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===== STEP 9: 既存データ移行（必要な場合） =====

-- usersテーブルからのポイントデータ移行（pointsカラムが存在する場合）
DO $$
BEGIN
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

-- 実行完了メッセージ
SELECT 'Phase 5: ポイントシステム拡張 SQL実行完了 (修正版)' as message; 
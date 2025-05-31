-- Phase 5: ポイントシステム拡張 SQL
-- 実行日: 2024年
-- 概要: ポイント取引履歴テーブルとギバースコア機能の追加

-- 1. ポイント取引履歴テーブル作成
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

-- 2. user_pointsテーブルにギバースコアカラムを追加
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS giver_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_spent_at TIMESTAMP WITH TIME ZONE NULL;

-- 3. インデックス作成
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_activity ON point_transactions(activity_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_point_transactions_reference ON point_transactions(reference_id, reference_type);

-- ギバースコア用インデックス
CREATE INDEX IF NOT EXISTS idx_user_points_giver_score ON user_points(giver_score DESC);

-- 4. RLS (Row Level Security) ポリシー設定
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の取引履歴のみ閲覧可能
CREATE POLICY "Users can view own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 認証済みユーザーは取引履歴を作成可能（システム用）
CREATE POLICY "Authenticated users can insert transactions" ON point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. トリガー関数：updated_at自動更新
CREATE OR REPLACE FUNCTION update_point_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成
DROP TRIGGER IF EXISTS point_transactions_updated_at_trigger ON point_transactions;
CREATE TRIGGER point_transactions_updated_at_trigger
  BEFORE UPDATE ON point_transactions
  FOR EACH ROW EXECUTE FUNCTION update_point_transactions_updated_at();

-- 6. ポイント統計ビュー作成
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

-- 7. ギバーランキングビュー作成
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

-- 8. ポイント関連の便利な関数
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

-- 9. 管理用：全体統計関数
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

-- 実行完了メッセージ
SELECT 'Phase 5: ポイントシステム拡張 SQL実行完了' as message; 
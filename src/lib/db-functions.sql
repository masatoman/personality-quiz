-- ユーザーポイントを増加させる関数
CREATE OR REPLACE FUNCTION increment_user_points(
  user_id TEXT,
  points_to_add INTEGER,
  action_type TEXT,
  reference_id TEXT DEFAULT NULL,
  reference_type TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- ユーザーが存在するか確認
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RAISE EXCEPTION 'ユーザーID: % が見つかりません', user_id;
  END IF;

  -- ポイントを更新
  UPDATE users
  SET 
    points = points + points_to_add,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- ポイント履歴を記録
  INSERT INTO points_history (
    user_id,
    points,
    action_type,
    reference_id,
    reference_type,
    description,
    created_at
  ) VALUES (
    user_id,
    points_to_add,
    action_type,
    reference_id,
    reference_type,
    description,
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- ユーザーポイントを消費する関数
CREATE OR REPLACE FUNCTION consume_user_points(
  user_id TEXT,
  points_to_consume INTEGER,
  action_type TEXT,
  reference_id TEXT DEFAULT NULL,
  reference_type TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  current_points INTEGER;
BEGIN
  -- ユーザーが存在するか確認
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RAISE EXCEPTION 'ユーザーID: % が見つかりません', user_id;
  END IF;

  -- 現在のポイントを取得
  SELECT points INTO current_points FROM users WHERE id = user_id;
  
  -- ポイントが足りるか確認
  IF current_points < points_to_consume THEN
    RETURN FALSE;
  END IF;
  
  -- ポイントを更新
  UPDATE users
  SET 
    points = points - points_to_consume,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- ポイント履歴を記録（マイナス値として記録）
  INSERT INTO points_history (
    user_id,
    points,
    action_type,
    reference_id,
    reference_type,
    description,
    created_at
  ) VALUES (
    user_id,
    -points_to_consume,
    action_type,
    reference_id,
    reference_type,
    description,
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ギバースコアを増加させる関数
CREATE OR REPLACE FUNCTION increment_giver_score(
  user_id TEXT,
  score_to_add INTEGER
) RETURNS VOID AS $$
BEGIN
  -- ユーザーが存在するか確認
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RAISE EXCEPTION 'ユーザーID: % が見つかりません', user_id;
  END IF;

  -- ギバースコアを更新または挿入
  INSERT INTO giver_scores (user_id, score, last_updated)
  VALUES (user_id, score_to_add, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    score = giver_scores.score + EXCLUDED.score,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- ギバーランキングを取得する関数
CREATE OR REPLACE FUNCTION get_giver_ranking(
  period TEXT
) RETURNS TABLE (
  rank BIGINT,
  user_id TEXT,
  display_name TEXT,
  avatar_url TEXT,
  score INTEGER
) AS $$
BEGIN
  IF period = 'weekly' THEN
    RETURN QUERY
      SELECT 
        ROW_NUMBER() OVER (ORDER BY gs.score DESC) as rank,
        u.id as user_id,
        u.display_name,
        u.avatar_url,
        gs.score
      FROM users u
      LEFT JOIN giver_scores gs ON u.id = gs.user_id
      WHERE gs.last_updated >= NOW() - INTERVAL '1 week'
      ORDER BY gs.score DESC
      LIMIT 100;
  ELSIF period = 'monthly' THEN
    RETURN QUERY
      SELECT 
        ROW_NUMBER() OVER (ORDER BY gs.score DESC) as rank,
        u.id as user_id,
        u.display_name,
        u.avatar_url,
        gs.score
      FROM users u
      LEFT JOIN giver_scores gs ON u.id = gs.user_id
      WHERE gs.last_updated >= NOW() - INTERVAL '1 month'
      ORDER BY gs.score DESC
      LIMIT 100;
  ELSE
    RAISE EXCEPTION '対応していない期間です: %。「weekly」または「monthly」を使用してください', period;
  END IF;
END;
$$ LANGUAGE plpgsql; 
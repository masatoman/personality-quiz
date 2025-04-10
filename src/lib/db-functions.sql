-- ユーザーポイントを増加させる関数
CREATE OR REPLACE FUNCTION increment_user_points(
  user_id TEXT,
  points_to_add INTEGER
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
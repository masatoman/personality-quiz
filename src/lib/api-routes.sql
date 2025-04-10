-- APIルートとエンドポイントのための関数定義

-- ユーザー認証チェック関数
CREATE OR REPLACE FUNCTION check_auth(
  session_token TEXT
) RETURNS TABLE (
  user_id TEXT,
  display_name TEXT,
  is_authenticated BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.display_name,
    CASE WHEN u.id IS NOT NULL THEN TRUE ELSE FALSE END
  FROM users u
  JOIN sessions s ON u.id = s.user_id
  WHERE 
    s.token = session_token
    AND s.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- パーソナリティタイプに基づく学習リソースを取得する関数
CREATE OR REPLACE FUNCTION get_learning_resources_by_type(
  personality_type TEXT,
  difficulty TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 10
) RETURNS TABLE (
  id INTEGER,
  title TEXT,
  description TEXT,
  url TEXT,
  resource_type TEXT,
  personality_type TEXT,
  difficulty TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.id,
    lr.title,
    lr.description,
    lr.url,
    lr.resource_type,
    lr.personality_type,
    lr.difficulty
  FROM learning_resources lr
  WHERE 
    lr.personality_type = personality_type
    AND (difficulty IS NULL OR lr.difficulty = difficulty)
  ORDER BY 
    CASE 
      WHEN lr.difficulty = 'beginner' THEN 1
      WHEN lr.difficulty = 'intermediate' THEN 2
      WHEN lr.difficulty = 'advanced' THEN 3
      ELSE 4
    END
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- コミュニティの投稿を取得する関数
CREATE OR REPLACE FUNCTION get_community_posts(
  sort_by TEXT DEFAULT 'recent',
  tag_filter TEXT DEFAULT NULL,
  page INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10
) RETURNS TABLE (
  post_id INTEGER,
  user_id TEXT,
  display_name TEXT,
  avatar_url TEXT,
  title TEXT,
  content TEXT,
  tags TEXT[],
  likes_count INTEGER,
  comments_count BIGINT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (page - 1) * page_size;
  
  RETURN QUERY
  SELECT 
    cp.id as post_id,
    u.id as user_id,
    u.display_name,
    u.avatar_url,
    cp.title,
    cp.content,
    cp.tags,
    cp.likes_count,
    COUNT(c.id) as comments_count,
    cp.created_at,
    cp.updated_at
  FROM community_posts cp
  JOIN users u ON cp.user_id = u.id
  LEFT JOIN comments c ON cp.id = c.post_id
  WHERE 
    (tag_filter IS NULL OR tag_filter = ANY(cp.tags))
  GROUP BY 
    cp.id, u.id, u.display_name, u.avatar_url
  ORDER BY 
    CASE
      WHEN sort_by = 'recent' THEN cp.created_at
      WHEN sort_by = 'popular' THEN cp.likes_count
    END DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- 投稿にコメントを追加する関数
CREATE OR REPLACE FUNCTION add_comment_to_post(
  user_id TEXT,
  post_id INTEGER,
  comment_text TEXT
) RETURNS INTEGER AS $$
DECLARE
  new_comment_id INTEGER;
BEGIN
  -- ユーザーと投稿が存在するか確認
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RAISE EXCEPTION 'ユーザーID: % が見つかりません', user_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM community_posts WHERE id = post_id) THEN
    RAISE EXCEPTION '投稿ID: % が見つかりません', post_id;
  END IF;
  
  -- コメントを追加
  INSERT INTO comments (post_id, user_id, content, created_at)
  VALUES (post_id, user_id, comment_text, NOW())
  RETURNING id INTO new_comment_id;
  
  -- ユーザーポイントを増加（コメント投稿報酬）
  PERFORM increment_user_points(user_id, 2);
  
  -- ギバースコアも増加（貢献活動）
  PERFORM increment_giver_score(user_id, 1);
  
  RETURN new_comment_id;
END;
$$ LANGUAGE plpgsql;

-- 学習進捗を更新する関数
CREATE OR REPLACE FUNCTION update_learning_progress(
  user_id TEXT,
  resource_id INTEGER,
  completion_percentage INTEGER,
  notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- ユーザーとリソースが存在するか確認
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
    RAISE EXCEPTION 'ユーザーID: % が見つかりません', user_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM learning_resources WHERE id = resource_id) THEN
    RAISE EXCEPTION 'リソースID: % が見つかりません', resource_id;
  END IF;
  
  -- 進捗を更新または挿入
  INSERT INTO learning_progress 
    (user_id, resource_id, completion_percentage, notes, last_updated)
  VALUES 
    (user_id, resource_id, completion_percentage, notes, NOW())
  ON CONFLICT (user_id, resource_id) 
  DO UPDATE SET 
    completion_percentage = EXCLUDED.completion_percentage,
    notes = EXCLUDED.notes,
    last_updated = NOW();
    
  -- 完了した場合、ポイントを付与
  IF completion_percentage = 100 THEN
    PERFORM increment_user_points(user_id, 10);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ユーザーの学習統計を取得する関数
CREATE OR REPLACE FUNCTION get_user_learning_stats(
  target_user_id TEXT
) RETURNS TABLE (
  total_resources INTEGER,
  completed_resources INTEGER,
  in_progress_resources INTEGER,
  total_points INTEGER,
  personality_type TEXT,
  giver_score INTEGER,
  giver_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM learning_progress WHERE user_id = target_user_id) as total_resources,
    (SELECT COUNT(*) FROM learning_progress WHERE user_id = target_user_id AND completion_percentage = 100) as completed_resources,
    (SELECT COUNT(*) FROM learning_progress WHERE user_id = target_user_id AND completion_percentage > 0 AND completion_percentage < 100) as in_progress_resources,
    u.points as total_points,
    u.personality_type,
    COALESCE(gs.score, 0) as giver_score,
    (
      SELECT r.rank FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY score DESC) as rank
        FROM giver_scores
      ) r
      WHERE r.user_id = target_user_id
    ) as giver_rank
  FROM users u
  LEFT JOIN giver_scores gs ON u.id = gs.user_id
  WHERE u.id = target_user_id;
END;
$$ LANGUAGE plpgsql; 
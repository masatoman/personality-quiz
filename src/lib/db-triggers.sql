-- データベーストリガー関数

-- コミュニティ投稿時のポイント更新とギバースコア更新
CREATE OR REPLACE FUNCTION update_user_on_post_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- ユーザーにポイントを追加（投稿作成で10ポイント）
  PERFORM increment_user_points(
    NEW.user_id, 
    10, 
    'create_post', 
    NEW.id::TEXT, 
    'community_posts', 
    '投稿作成によるポイント付与'
  );
  
  -- ギバースコアを更新（投稿作成で5ポイント）
  INSERT INTO giver_scores (user_id, score, last_updated) 
  VALUES (NEW.user_id, 5, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET score = giver_scores.score + 5, last_updated = NOW();
  
  -- アクティビティログに記録
  INSERT INTO user_activity (user_id, activity_type, details, created_at)
  VALUES (NEW.user_id, 'create_post', jsonb_build_object('post_id', NEW.id, 'title', NEW.title), NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_creation_trigger
AFTER INSERT ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_user_on_post_creation();

-- コメント投稿時のポイント更新とギバースコア更新
CREATE OR REPLACE FUNCTION update_user_on_comment_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- ユーザーにポイントを追加（コメント作成で5ポイント）
  PERFORM increment_user_points(
    NEW.user_id, 
    5, 
    'create_comment', 
    NEW.id::TEXT, 
    'comments', 
    'コメント作成によるポイント付与'
  );
  
  -- ギバースコアを更新（コメント作成で3ポイント）
  INSERT INTO giver_scores (user_id, score, last_updated) 
  VALUES (NEW.user_id, 3, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET score = giver_scores.score + 3, last_updated = NOW();
  
  -- アクティビティログに記録
  INSERT INTO user_activity (user_id, activity_type, details, created_at)
  VALUES (NEW.user_id, 'create_comment', jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id), NOW());
  
  -- 投稿者に通知を送信（自分以外の投稿にコメントした場合）
  INSERT INTO notifications (user_id, type, message, link, created_at)
  SELECT p.user_id, 'comment', 
         (SELECT display_name FROM users WHERE id = NEW.user_id) || 'さんがあなたの投稿にコメントしました', 
         '/community/post/' || p.id, 
         NOW()
  FROM community_posts p
  WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_creation_trigger
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_user_on_comment_creation();

-- いいね時のポイントとギバースコア更新
CREATE OR REPLACE FUNCTION update_on_like()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id TEXT;
  target_id INTEGER;
  target_type TEXT;
  post_title TEXT;
BEGIN
  -- いいねの対象によってユーザーIDを取得
  IF NEW.target_type = 'post' THEN
    SELECT user_id, id, 'post', title INTO target_user_id, target_id, target_type, post_title
    FROM community_posts
    WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'comment' THEN
    SELECT c.user_id, c.id, 'comment', p.title INTO target_user_id, target_id, target_type, post_title
    FROM comments c
    JOIN community_posts p ON c.post_id = p.id
    WHERE c.id = NEW.target_id;
  ELSE
    RAISE EXCEPTION 'Unknown target_type: %', NEW.target_type;
  END IF;
  
  -- ユーザーにポイントを追加（いいね付与で2ポイント）
  PERFORM increment_user_points(
    NEW.user_id, 
    2, 
    'give_like', 
    NEW.target_id::TEXT, 
    NEW.target_type, 
    'いいね付与によるポイント獲得'
  );
  
  -- アクティビティログに記録
  INSERT INTO user_activity (user_id, activity_type, details, created_at)
  VALUES (
    NEW.user_id, 
    'give_like', 
    jsonb_build_object(
      'target_id', NEW.target_id,
      'target_type', NEW.target_type,
      'post_title', post_title
    ), 
    NOW()
  );
  
  -- ギバースコアを更新（いいね付与で1ポイント）
  INSERT INTO giver_scores (user_id, score, last_updated) 
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET score = giver_scores.score + 1, last_updated = NOW();
  
  -- 自分以外のコンテンツにいいねした場合のみ通知とポイント付与
  IF target_user_id != NEW.user_id THEN
    -- ユーザーにいいねされた通知を追加
    INSERT INTO notifications (user_id, type, message, link, created_at)
    VALUES (
      target_user_id,
      'like',
      (SELECT display_name FROM users WHERE id = NEW.user_id) || 'さんがあなたの' || 
      CASE WHEN target_type = 'post' THEN '投稿' ELSE 'コメント' END || 'にいいねしました',
      '/community/post/' || target_id,
      NOW()
    );
    
    -- いいねされたユーザーにポイントを追加（1ポイント）
    PERFORM increment_user_points(
      target_user_id, 
      1, 
      'receive_like', 
      NEW.id::TEXT, 
      'likes', 
      'いいねを受け取ることによるポイント獲得'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_creation_trigger
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION update_on_like();

-- 学習リソース完了時のポイント更新
CREATE OR REPLACE FUNCTION update_on_learning_progress()
RETURNS TRIGGER AS $$
DECLARE
  resource_record RECORD;
  points_to_add INTEGER := 0;
  was_completed BOOLEAN := FALSE;
BEGIN
  -- 完了状態になった場合のみポイント付与
  IF NEW.completion_percentage = 100 AND (OLD IS NULL OR OLD.completion_percentage < 100) THEN
    was_completed := TRUE;
    
    -- リソース情報を取得
    SELECT * INTO resource_record
    FROM learning_resources
    WHERE id = NEW.resource_id;
    
    -- リソースの難易度に応じてポイントを設定
    CASE resource_record.difficulty
      WHEN 'beginner' THEN points_to_add := 5;
      WHEN 'intermediate' THEN points_to_add := 10;
      WHEN 'advanced' THEN points_to_add := 15;
      ELSE points_to_add := 5;
    END CASE;
    
    -- ユーザーにポイントを追加
    PERFORM increment_user_points(
      NEW.user_id, 
      points_to_add, 
      'complete_resource', 
      NEW.resource_id::TEXT, 
      'learning_resources', 
      resource_record.title || 'の完了によるポイント獲得'
    );
    
    -- アクティビティログに記録
    INSERT INTO user_activity (user_id, activity_type, details, created_at)
    VALUES (NEW.user_id, 'complete_resource', 
            jsonb_build_object(
              'resource_id', NEW.resource_id,
              'resource_title', resource_record.title,
              'points', points_to_add
            ), 
            NOW());
  END IF;
  
  -- 更新であれば常に最終更新日時を更新
  IF OLD IS NOT NULL THEN
    NEW.last_updated := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER learning_progress_trigger
BEFORE INSERT OR UPDATE ON learning_progress
FOR EACH ROW
EXECUTE FUNCTION update_on_learning_progress();

-- パーソナリティ診断完了時のユーザー更新
CREATE OR REPLACE FUNCTION update_user_on_personality_result()
RETURNS TRIGGER AS $$
BEGIN
  -- ユーザーのパーソナリティタイプを更新
  UPDATE users 
  SET personality_type = NEW.personality_type
  WHERE id = NEW.user_id;
  
  -- アクティビティログに記録
  INSERT INTO user_activity (user_id, activity_type, details, created_at)
  VALUES (NEW.user_id, 'quiz_complete', 
          jsonb_build_object(
            'personality_type', NEW.personality_type,
            'giver_score', NEW.giver_score,
            'matcher_score', NEW.matcher_score,
            'taker_score', NEW.taker_score
          ), 
          NOW());
  
  -- 初回利用時にポイントを追加（20ポイント）
  IF NOT EXISTS (SELECT 1 FROM personality_results WHERE user_id = NEW.user_id AND id != NEW.id) THEN
    PERFORM increment_user_points(
      NEW.user_id, 
      20, 
      'complete_quiz', 
      NEW.id::TEXT, 
      'personality_results', 
      'ギバー診断初回完了によるポイント獲得'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER personality_result_trigger
AFTER INSERT ON personality_results
FOR EACH ROW
EXECUTE FUNCTION update_user_on_personality_result();

-- 週間・月間ギバーランキングの更新関数（スケジューラで実行）
CREATE OR REPLACE FUNCTION update_weekly_giver_ranking()
RETURNS VOID AS $$
DECLARE
  current_week DATE := date_trunc('week', CURRENT_DATE)::DATE;
BEGIN
  -- 先週のスコアを計算して保存
  INSERT INTO weekly_giver_scores (user_id, week_start, score)
  SELECT 
    gs.user_id,
    current_week - interval '7 days',
    COALESCE(
      (SELECT SUM(
        CASE 
          WHEN ua.activity_type = 'create_post' THEN 5
          WHEN ua.activity_type = 'create_comment' THEN 3
          ELSE 0
        END
      )
      FROM user_activity ua
      WHERE ua.user_id = gs.user_id
      AND ua.created_at >= current_week - interval '7 days'
      AND ua.created_at < current_week
      AND ua.activity_type IN ('create_post', 'create_comment')
      ), 0
    )
  FROM giver_scores gs
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET score = EXCLUDED.score;
  
  -- ランキングを更新
  UPDATE weekly_giver_scores
  SET rank = subquery.rank
  FROM (
    SELECT 
      id,
      RANK() OVER (PARTITION BY week_start ORDER BY score DESC) as rank
    FROM weekly_giver_scores
    WHERE week_start = current_week - interval '7 days'
  ) AS subquery
  WHERE weekly_giver_scores.id = subquery.id;
  
  -- 上位ランカーに通知
  INSERT INTO notifications (user_id, type, message, link, created_at)
  SELECT 
    wgs.user_id,
    'rank_change',
    CASE 
      WHEN wgs.rank = 1 THEN '先週のギバーランキングで1位になりました！おめでとうございます！'
      WHEN wgs.rank <= 3 THEN '先週のギバーランキングでトップ3に入りました！おめでとうございます！'
      WHEN wgs.rank <= 10 THEN '先週のギバーランキングでトップ10に入りました！'
    END,
    '/rankings/weekly',
    NOW()
  FROM weekly_giver_scores wgs
  WHERE wgs.week_start = current_week - interval '7 days'
  AND wgs.rank <= 10;
END;
$$ LANGUAGE plpgsql;

-- 月間ランキング更新関数
CREATE OR REPLACE FUNCTION update_monthly_giver_ranking()
RETURNS VOID AS $$
DECLARE
  current_month DATE := date_trunc('month', CURRENT_DATE)::DATE;
BEGIN
  -- 先月のスコアを計算して保存
  INSERT INTO monthly_giver_scores (user_id, month_start, score)
  SELECT 
    gs.user_id,
    current_month - interval '1 month',
    COALESCE(
      (SELECT SUM(
        CASE 
          WHEN ua.activity_type = 'create_post' THEN 5
          WHEN ua.activity_type = 'create_comment' THEN 3
          ELSE 0
        END
      )
      FROM user_activity ua
      WHERE ua.user_id = gs.user_id
      AND ua.created_at >= current_month - interval '1 month'
      AND ua.created_at < current_month
      AND ua.activity_type IN ('create_post', 'create_comment')
      ), 0
    )
  FROM giver_scores gs
  ON CONFLICT (user_id, month_start)
  DO UPDATE SET score = EXCLUDED.score;
  
  -- ランキングを更新
  UPDATE monthly_giver_scores
  SET rank = subquery.rank
  FROM (
    SELECT 
      id,
      RANK() OVER (PARTITION BY month_start ORDER BY score DESC) as rank
    FROM monthly_giver_scores
    WHERE month_start = current_month - interval '1 month'
  ) AS subquery
  WHERE monthly_giver_scores.id = subquery.id;
  
  -- 上位ランカーに通知
  INSERT INTO notifications (user_id, type, message, link, created_at)
  SELECT 
    mgs.user_id,
    'rank_change',
    CASE 
      WHEN mgs.rank = 1 THEN '先月のギバーランキングで1位になりました！おめでとうございます！'
      WHEN mgs.rank <= 3 THEN '先月のギバーランキングでトップ3に入りました！おめでとうございます！'
      WHEN mgs.rank <= 10 THEN '先月のギバーランキングでトップ10に入りました！'
    END,
    '/rankings/monthly',
    NOW()
  FROM monthly_giver_scores mgs
  WHERE mgs.month_start = current_month - interval '1 month'
  AND mgs.rank <= 10;
END;
$$ LANGUAGE plpgsql; 
-- 貢献数の統計を取得する関数
CREATE OR REPLACE FUNCTION get_contributions_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_contributions INTEGER;
    yesterday_contributions INTEGER;
    today_contributions INTEGER;
BEGIN
    -- 全体の貢献数を取得
    SELECT COUNT(*)
    INTO total_contributions
    FROM activities
    WHERE activity_type IN ('CREATE_CONTENT', 'PROVIDE_FEEDBACK', 'SHARE_RESOURCE');

    -- 昨日の貢献数を取得
    SELECT COUNT(*)
    INTO yesterday_contributions
    FROM activities
    WHERE activity_type IN ('CREATE_CONTENT', 'PROVIDE_FEEDBACK', 'SHARE_RESOURCE')
    AND created_at::date = CURRENT_DATE - 1;

    -- 今日の貢献数を取得
    SELECT COUNT(*)
    INTO today_contributions
    FROM activities
    WHERE activity_type IN ('CREATE_CONTENT', 'PROVIDE_FEEDBACK', 'SHARE_RESOURCE')
    AND created_at::date = CURRENT_DATE;

    -- 結果をJSONで返す
    RETURN json_build_object(
        'total', total_contributions,
        'change', today_contributions - yesterday_contributions
    );
END;
$$;

-- ポイントの統計を取得する関数
CREATE OR REPLACE FUNCTION get_points_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_points INTEGER;
    yesterday_points INTEGER;
    today_points INTEGER;
BEGIN
    -- 全体のポイントを取得
    SELECT COALESCE(SUM(points), 0)
    INTO total_points
    FROM activities;

    -- 昨日のポイントを取得
    SELECT COALESCE(SUM(points), 0)
    INTO yesterday_points
    FROM activities
    WHERE created_at::date = CURRENT_DATE - 1;

    -- 今日のポイントを取得
    SELECT COALESCE(SUM(points), 0)
    INTO today_points
    FROM activities
    WHERE created_at::date = CURRENT_DATE;

    -- 結果をJSONで返す
    RETURN json_build_object(
        'total', total_points,
        'change', today_points - yesterday_points
    );
END;
$$;

-- 連続ログイン日数の統計を取得する関数
CREATE OR REPLACE FUNCTION get_streak_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_streak INTEGER;
    yesterday_streak INTEGER;
    today_streak INTEGER;
BEGIN
    -- 全体の連続ログイン日数を取得
    WITH consecutive_days AS (
        SELECT user_id,
               COUNT(*) as streak_count
        FROM (
            SELECT DISTINCT user_id, created_at::date
            FROM activities
            WHERE activity_type = 'DAILY_LOGIN'
        ) daily_logins
        GROUP BY user_id
    )
    SELECT COALESCE(MAX(streak_count), 0)
    INTO total_streak
    FROM consecutive_days;

    -- 昨日の連続ログイン日数を取得
    SELECT COUNT(DISTINCT user_id)
    INTO yesterday_streak
    FROM activities
    WHERE activity_type = 'DAILY_LOGIN'
    AND created_at::date = CURRENT_DATE - 1;

    -- 今日の連続ログイン日数を取得
    SELECT COUNT(DISTINCT user_id)
    INTO today_streak
    FROM activities
    WHERE activity_type = 'DAILY_LOGIN'
    AND created_at::date = CURRENT_DATE;

    -- 結果をJSONで返す
    RETURN json_build_object(
        'total', total_streak,
        'change', today_streak - yesterday_streak
    );
END;
$$;

-- 関数に対するコメントを追加
COMMENT ON FUNCTION get_contributions_stats() IS 'ユーザーの貢献活動の統計情報を取得します';
COMMENT ON FUNCTION get_points_stats() IS 'ユーザーのポイントの統計情報を取得します';
COMMENT ON FUNCTION get_streak_stats() IS 'ユーザーの連続ログイン日数の統計情報を取得します'; 
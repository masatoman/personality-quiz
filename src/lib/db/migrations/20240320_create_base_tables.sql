-- マイグレーション: 基本テーブルの作成
-- 作成日: 2024-03-20

-- ユーザーテーブルの作成
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    giver_score DECIMAL(10,2) DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- アクティビティテーブルの作成
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    points INTEGER DEFAULT 0,
    giver_impact DECIMAL(10,2) DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_activity_type CHECK (
        activity_type IN (
            'CREATE_CONTENT',
            'PROVIDE_FEEDBACK',
            'SHARE_RESOURCE',
            'DAILY_LOGIN',
            'COMPLETE_QUIZ',
            'HELP_OTHERS'
        )
    )
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities(activity_type);

-- コメントの追加
COMMENT ON TABLE users IS 'ユーザー情報を管理するテーブル';
COMMENT ON TABLE activities IS 'ユーザーのアクティビティを記録するテーブル';

-- バージョン管理用のメタデータを追加
INSERT INTO schema_migrations (version, name, created_at)
VALUES ('20240320', 'create_base_tables', NOW()); 
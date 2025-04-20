-- マイグレーション: スキーママイグレーション管理テーブルの作成
-- 作成日: 2024-03-20

-- スキーママイグレーション管理テーブルの作成
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(14) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_schema_migrations_created_at ON schema_migrations(created_at);

-- コメントの追加
COMMENT ON TABLE schema_migrations IS 'データベースマイグレーションの履歴を管理するテーブル';
COMMENT ON COLUMN schema_migrations.version IS 'マイグレーションのバージョン（YYYYMMDD形式）';
COMMENT ON COLUMN schema_migrations.name IS 'マイグレーションの名前';
COMMENT ON COLUMN schema_migrations.created_at IS 'マイグレーションファイルの作成日時';
COMMENT ON COLUMN schema_migrations.applied_at IS 'マイグレーションの適用日時'; 
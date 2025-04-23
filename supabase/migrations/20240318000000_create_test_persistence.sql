-- テスト用のテーブルを作成
CREATE TABLE IF NOT EXISTS test_persistence (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- キーにユニーク制約を追加
CREATE UNIQUE INDEX IF NOT EXISTS test_persistence_key_idx ON test_persistence(key);

-- 更新時のタイムスタンプを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時のトリガーを設定
CREATE TRIGGER update_test_persistence_updated_at
    BEFORE UPDATE ON test_persistence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
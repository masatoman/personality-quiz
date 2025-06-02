-- エラーログテーブルの作成
-- 2024年6月1日: エラーログ機能実装

-- error_logsテーブルの作成
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    error_name TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    error_digest TEXT,
    page_url TEXT NOT NULL,
    user_agent TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    occurred_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- インデックス用制約
    CONSTRAINT error_logs_error_name_check CHECK (length(error_name) <= 255),
    CONSTRAINT error_logs_page_url_check CHECK (length(page_url) <= 2048),
    CONSTRAINT error_logs_user_agent_check CHECK (length(user_agent) <= 512)
);

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_name ON error_logs(error_name);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_page_url ON error_logs(page_url);

-- Row Level Security (RLS) の有効化
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: 管理者のみがエラーログを閲覧可能
CREATE POLICY "error_logs_admin_read" ON error_logs
    FOR SELECT
    USING (
        -- 管理者権限チェック（将来の管理者システム用）
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS ポリシー: システムからの挿入を許可（API経由）
CREATE POLICY "error_logs_system_insert" ON error_logs
    FOR INSERT
    WITH CHECK (true); -- APIレベルでの制御を信頼

-- RLS ポリシー: ユーザーは自分のエラーログのみ閲覧可能（オプション）
CREATE POLICY "error_logs_user_own_read" ON error_logs
    FOR SELECT
    USING (user_id = auth.uid());

-- コメント追加
COMMENT ON TABLE error_logs IS 'システムエラーログの記録用テーブル';
COMMENT ON COLUMN error_logs.error_name IS 'エラーの名前/タイプ';
COMMENT ON COLUMN error_logs.error_message IS 'エラーメッセージ';
COMMENT ON COLUMN error_logs.error_stack IS 'スタックトレース（開発環境用）';
COMMENT ON COLUMN error_logs.error_digest IS 'Next.jsのエラーダイジェスト';
COMMENT ON COLUMN error_logs.page_url IS 'エラーが発生したページURL';
COMMENT ON COLUMN error_logs.user_agent IS 'ユーザーエージェント情報';
COMMENT ON COLUMN error_logs.user_id IS 'エラーが発生したユーザーID（匿名の場合はNULL）';
COMMENT ON COLUMN error_logs.occurred_at IS 'エラーが発生した時刻';
COMMENT ON COLUMN error_logs.created_at IS 'ログがデータベースに保存された時刻'; 
-- 教材用コメントシステムの修正
-- materialsテーブル用のコメント機能を追加

-- ===== STEP 1: 教材コメントテーブル作成 =====

CREATE TABLE IF NOT EXISTS material_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES material_comments(id) ON DELETE CASCADE, -- 返信用
  
  -- コンテンツ
  comment_text TEXT NOT NULL CHECK (length(comment_text) <= 2000),
  
  -- 階層管理
  depth INTEGER DEFAULT 0 CHECK (depth >= 0 AND depth <= 2), -- 最大3階層
  
  -- エンゲージメント
  helpful_count INTEGER DEFAULT 0,
  
  -- モデレーション
  is_approved BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false, -- 固定コメント
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE material_comments IS '教材コメント・気づき共有';
COMMENT ON COLUMN material_comments.depth IS '0:親コメント, 1:返信, 2:返信の返信';
COMMENT ON COLUMN material_comments.helpful_count IS '役立った数のカウント';

-- ===== STEP 2: コメント役立ち投票テーブル =====

CREATE TABLE IF NOT EXISTS comment_helpful_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES material_comments(id) ON DELETE CASCADE,
  
  -- 投票内容
  is_helpful BOOLEAN NOT NULL, -- true: 役立った, false: 役立たなかった
  
  -- 時刻
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 一人のユーザーが一つのコメントに一回だけ投票
  UNIQUE(user_id, comment_id)
);

COMMENT ON TABLE comment_helpful_votes IS 'コメント役立ち度投票';

-- ===== STEP 3: インデックス作成 =====

-- material_comments
CREATE INDEX IF NOT EXISTS idx_material_comments_material ON material_comments(material_id);
CREATE INDEX IF NOT EXISTS idx_material_comments_parent ON material_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_material_comments_user ON material_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_material_comments_created ON material_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_material_comments_helpful ON material_comments(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_material_comments_approved ON material_comments(is_approved, created_at DESC);

-- comment_helpful_votes
CREATE INDEX IF NOT EXISTS idx_comment_helpful_votes_comment ON comment_helpful_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_helpful_votes_user ON comment_helpful_votes(user_id);

-- ===== STEP 4: RLS (Row Level Security) ポリシー設定 =====

-- material_comments: 承認済みコメントは全員閲覧可能、作成者は自分のコメント管理可能
ALTER TABLE material_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON material_comments;
CREATE POLICY "Approved comments are viewable by everyone" ON material_comments
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can create comments" ON material_comments;
CREATE POLICY "Users can create comments" ON material_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON material_comments;
CREATE POLICY "Users can update own comments" ON material_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON material_comments;
CREATE POLICY "Users can delete own comments" ON material_comments
  FOR DELETE USING (auth.uid() = user_id);

-- comment_helpful_votes: 全員閲覧可能、認証ユーザーは投票可能
ALTER TABLE comment_helpful_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Votes are viewable by everyone" ON comment_helpful_votes;
CREATE POLICY "Votes are viewable by everyone" ON comment_helpful_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own votes" ON comment_helpful_votes;
CREATE POLICY "Users can manage own votes" ON comment_helpful_votes
  FOR ALL USING (auth.uid() = user_id);

-- ===== STEP 5: トリガー関数とビュー =====

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_material_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー適用
DROP TRIGGER IF EXISTS material_comments_updated_at_trigger ON material_comments;
CREATE TRIGGER material_comments_updated_at_trigger
  BEFORE UPDATE ON material_comments
  FOR EACH ROW EXECUTE FUNCTION update_material_comment_updated_at();

DROP TRIGGER IF EXISTS comment_helpful_votes_updated_at_trigger ON comment_helpful_votes;
CREATE TRIGGER comment_helpful_votes_updated_at_trigger
  BEFORE UPDATE ON comment_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION update_material_comment_updated_at();

-- ===== STEP 6: 役立ち度カウント更新関数 =====

CREATE OR REPLACE FUNCTION update_comment_helpful_count(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE material_comments 
  SET helpful_count = (
    SELECT COUNT(*) 
    FROM comment_helpful_votes 
    WHERE comment_helpful_votes.comment_id = update_comment_helpful_count.comment_id 
    AND is_helpful = true
  )
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- ===== STEP 7: ビュー作成（プロフィール情報付きコメント取得用） =====

CREATE OR REPLACE VIEW material_comments_with_profiles AS
SELECT 
  mc.id,
  mc.user_id,
  mc.material_id,
  mc.parent_comment_id,
  mc.comment_text,
  mc.depth,
  mc.helpful_count,
  mc.is_approved,
  mc.is_pinned,
  mc.created_at,
  mc.updated_at,
  p.display_name,
  p.avatar_url,
  u.personality_type,
  u.giver_score
FROM material_comments mc
LEFT JOIN profiles p ON mc.user_id = p.id
LEFT JOIN users u ON mc.user_id = u.id
WHERE mc.is_approved = true;

COMMENT ON VIEW material_comments_with_profiles IS 'プロフィール情報付きの教材コメント一覧';

-- ===== STEP 8: データ移行（もし既存のfeedbackテーブルからコメントがある場合） =====

-- feedbackテーブルのコメントをmaterial_commentsに移行
INSERT INTO material_comments (user_id, material_id, comment_text, created_at)
SELECT 
  user_id, 
  material_id, 
  comment, 
  created_at
FROM feedback 
WHERE comment IS NOT NULL 
AND comment != ''
ON CONFLICT DO NOTHING; -- 重複回避

-- テスト用コメントデータの挿入
-- 実際のコメント表示をテストするためのサンプルデータ

-- まず、テスト用のテーブルが存在するか確認
-- material_comments テーブルが存在しない場合は先にマイグレーションを実行

-- サンプルコメント1: 親コメント（役立った数が多い）
INSERT INTO material_comments (
  id,
  user_id, 
  material_id, 
  comment_text, 
  helpful_count,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- 最初のユーザーを使用
  'af255933-d4be-4325-9e1c-3cc51f9e16a4', -- 基本英文法クイズのID
  '現在進行形のコツは、動作が「今まさに進行中」であることを意識することです！例えば「I am studying English now.」は、まさに今この瞬間に英語を勉強していることを表します。日本語では時制があいまいになりがちですが、英語では明確に区別する必要がありますね。',
  8,
  NOW() - INTERVAL '2 hours'
);

-- サンプルコメント2: 親コメント（最近投稿）
INSERT INTO material_comments (
  id,
  user_id,
  material_id,
  comment_text,
  helpful_count, 
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'af255933-d4be-4325-9e1c-3cc51f9e16a4',
  'この問題でつまずいていました！特に「yesterday」があるのに現在進行形を使ってしまう間違いをよくしていました。過去の出来事は必ず過去形で表現する、という基本を改めて確認できました。とても勉強になります！',
  3,
  NOW() - INTERVAL '30 minutes'
);

-- サンプルコメント3: 返信コメント
INSERT INTO material_comments (
  id,
  user_id,
  material_id,
  parent_comment_id,
  comment_text,
  depth,
  helpful_count,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'af255933-d4be-4325-9e1c-3cc51f9e16a4',
  (SELECT id FROM material_comments WHERE comment_text LIKE '%現在進行形のコツは%' LIMIT 1),
  'その通りですね！私も最初は時制が曖昧でしたが、「今している動作」というイメージを持つようにしてから理解が深まりました。特にリアルタイムで起こっていることを表現するときの feel が分かるようになりました。',
  1,
  2,
  NOW() - INTERVAL '1 hour'
);

-- サンプルコメント4: 気づき系のコメント
INSERT INTO material_comments (
  id,
  user_id,
  material_id,
  comment_text,
  helpful_count,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'af255933-d4be-4325-9e1c-3cc51f9e16a4',
  '覚え方のコツをシェアします！過去形は「〜した」、現在進行形は「〜している」と日本語に直してみると分かりやすいです。また、時を表す副詞（yesterday, now, usually など）に注目すると正解率が上がりますよ！',
  5,
  NOW() - INTERVAL '45 minutes'
);

-- 役立ち投票のサンプルデータも追加
INSERT INTO comment_helpful_votes (
  user_id,
  comment_id,
  is_helpful,
  created_at
) VALUES 
  ((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM material_comments WHERE helpful_count = 8 LIMIT 1), true, NOW() - INTERVAL '1 hour'),
  ((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM material_comments WHERE helpful_count = 5 LIMIT 1), true, NOW() - INTERVAL '30 minutes'),
  ((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM material_comments WHERE helpful_count = 3 LIMIT 1), true, NOW() - INTERVAL '20 minutes');

-- プロフィール情報を更新（表示用）
UPDATE profiles 
SET 
  display_name = COALESCE(display_name, 'テストユーザー'),
  avatar_url = COALESCE(avatar_url, '/avatars/giver.png')
WHERE display_name IS NULL OR display_name = 'Anonymous User';

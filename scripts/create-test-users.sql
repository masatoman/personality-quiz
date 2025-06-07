-- テストユーザーを直接profiles テーブルに作成
-- UUIDは手動で生成した固定値を使用

INSERT INTO public.profiles (id, username, display_name, bio, created_at, updated_at) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'giver_taro',
    'ギバー太郎',
    'ギバータイプのテストユーザーです。積極的に教えることで学ぶ姿勢を持っています。',
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'matcher_hanako',
    'マッチャー花子',
    'マッチャータイプのテストユーザーです。バランスの取れた学習スタイルです。',
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'taker_jiro',
    'テイカー次郎',
    'テイカータイプのテストユーザーです。学びを受け取ることを重視しています。',
    NOW(),
    NOW()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'admin_user',
    '管理者',
    '管理者アカウントです。',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ギバースコアも追加
INSERT INTO public.giver_scores (user_id, score_type, score_value, description, created_at) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'overall',
    80,
    'ギバータイプの初期スコア',
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'overall',
    50,
    'マッチャータイプの初期スコア',
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'overall',
    20,
    'テイカータイプの初期スコア',
    NOW()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'overall',
    100,
    '管理者の初期スコア',
    NOW()
  )
ON CONFLICT DO NOTHING; 
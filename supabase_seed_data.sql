-- 管理者設定の追加
INSERT INTO public.admin_settings (admin_email) VALUES
  ('admin@example.com');

-- テストユーザーの作成（本来はAuthサービスを通して作成されるが、開発環境用に直接挿入）
INSERT INTO public.users (id, email, personality_type, giver_score, points) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', 'giver', 85, 1000),
  ('550e8400-e29b-41d4-a716-446655440001', 'giver@example.com', 'giver', 80, 500),
  ('550e8400-e29b-41d4-a716-446655440002', 'matcher@example.com', 'matcher', 50, 250),
  ('550e8400-e29b-41d4-a716-446655440003', 'taker@example.com', 'taker', 20, 100);

-- テストユーザープロフィールの作成
INSERT INTO public.profiles (user_id, display_name, bio) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '管理者', '心理学×英語学習アプリの管理者です'),
  ('550e8400-e29b-41d4-a716-446655440001', 'ギバー太郎', '人に教えることが好きです。TOEIC 900点。'),
  ('550e8400-e29b-41d4-a716-446655440002', 'マッチャー花子', '互恵的な関係を大切にします。英検準1級。'),
  ('550e8400-e29b-41d4-a716-446655440003', 'テイカー次郎', '効率的に英語を学びたいです。TOEIC 600点目標。');

-- 診断質問の追加
INSERT INTO public.personality_questions (question, options, category) VALUES
  (
    '英語の勉強をする理由は何ですか？',
    '[
      {"text": "将来のキャリアのため", "scores": {"giver": 3, "matcher": 5, "taker": 7}},
      {"text": "他の人を助けられるようになるため", "scores": {"giver": 8, "matcher": 5, "taker": 2}},
      {"text": "世界中の人と交流するため", "scores": {"giver": 6, "matcher": 7, "taker": 3}},
      {"text": "自分の知識を広げるため", "scores": {"giver": 5, "matcher": 6, "taker": 5}}
    ]',
    'motivation'
  ),
  (
    'グループ学習の際、あなたはどのような役割を取りますか？',
    '[
      {"text": "リーダーとなり、全体をまとめる", "scores": {"giver": 7, "matcher": 6, "taker": 4}},
      {"text": "自分の得意な部分を担当する", "scores": {"giver": 5, "matcher": 7, "taker": 5}},
      {"text": "他のメンバーが困っているところを助ける", "scores": {"giver": 9, "matcher": 4, "taker": 2}},
      {"text": "自分の学びになる部分に集中する", "scores": {"giver": 3, "matcher": 5, "taker": 8}}
    ]',
    'teamwork'
  ),
  (
    '新しく覚えた英語表現を、どのように活用しますか？',
    '[
      {"text": "すぐに日常会話に取り入れる", "scores": {"giver": 6, "matcher": 7, "taker": 4}},
      {"text": "他の人に教えてあげる", "scores": {"giver": 9, "matcher": 4, "taker": 2}},
      {"text": "自分の英作文に活用する", "scores": {"giver": 5, "matcher": 6, "taker": 6}},
      {"text": "テストでいい点を取るために覚える", "scores": {"giver": 2, "matcher": 5, "taker": 9}}
    ]',
    'application'
  );

-- バッジの作成
INSERT INTO public.badges (name, description, icon_url, criteria, points, badge_type) VALUES
  (
    'コンテンツクリエイター',
    '5つ以上の教材を作成した人に贈られるバッジ',
    '/images/badges/creator.png',
    '{"materials_created": 5}',
    50,
    'achievement'
  ),
  (
    'フィードバックマスター',
    '10件以上のフィードバックを提供した人に贈られるバッジ',
    '/images/badges/feedback.png',
    '{"feedback_given": 10}',
    30,
    'participation'
  ),
  (
    '真のギバー',
    'ギバースコアが80以上の人に贈られるバッジ',
    '/images/badges/giver.png',
    '{"giver_score": 80}',
    100,
    'achievement'
  );

-- サンプル教材の作成
INSERT INTO public.materials (user_id, title, description, content, category, tags, difficulty_level, is_published) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'ギバーのための英会話フレーズ集',
    '日常会話で相手を助けるための便利なフレーズを集めました',
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object(
          'type', 'text',
          'title', 'はじめに',
          'content', 'このコンテンツでは、相手を助けたり支援したりするための英語フレーズを紹介します。'
        ),
        jsonb_build_object(
          'type', 'list',
          'title', '便利なフレーズ10選',
          'items', jsonb_build_array(
            'Can I help you with that?',
            'Let me show you how to do it.',
            'Would you like me to explain it again?',
            'I''d be happy to assist you.',
            'Is there anything else you need?',
            'Don''t worry, I''ll guide you through it.',
            'Feel free to ask me anytime.',
            'I think I might have a solution for you.',
            'Let me know if you need any support.',
            'I''d recommend trying this approach.'
          )
        ),
        jsonb_build_object(
          'type', 'quiz',
          'title', '確認クイズ',
          'questions', jsonb_build_array(
            jsonb_build_object(
              'question', 'Which phrase would you use to offer guidance?',
              'options', jsonb_build_array(
                'Let me show you how to do it.',
                'Is there anything else you need?',
                'I''d recommend trying this approach.',
                'Feel free to ask me anytime.'
              ),
              'answer', 0
            )
          )
        )
      )
    ),
    'conversation',
    ARRAY['giver', 'phrases', 'helpful'],
    2,
    TRUE
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'ビジネス英語：互恵的関係の構築',
    'ビジネスパートナーとWin-Winの関係を築くための英語表現',
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object(
          'type', 'text',
          'title', '互恵的関係とは',
          'content', 'ビジネスにおいて互恵的関係（Win-Win）を築くことは非常に重要です。このコンテンツでは、そのための英語表現を学びます。'
        ),
        jsonb_build_object(
          'type', 'list',
          'title', 'ネゴシエーションフレーズ',
          'items', jsonb_build_array(
            'I believe we can find a solution that works for both of us.',
            'What would be a fair compromise from your perspective?',
            'How can we ensure this benefits everyone involved?',
            'I value our partnership and want to ensure we both succeed.',
            'Let''s explore options that address both our concerns.'
          )
        )
      )
    ),
    'business',
    ARRAY['matcher', 'negotiation', 'business'],
    3,
    TRUE
  );

-- サンプルフィードバックの追加
INSERT INTO public.feedback (material_id, user_id, comment, rating, is_helpful) VALUES
  (
    (SELECT id FROM public.materials WHERE title = 'ギバーのための英会話フレーズ集'),
    '550e8400-e29b-41d4-a716-446655440002',
    'とても役立つフレーズ集でした。日常会話で早速使ってみます！',
    5,
    TRUE
  ),
  (
    (SELECT id FROM public.materials WHERE title = 'ビジネス英語：互恵的関係の構築'),
    '550e8400-e29b-41d4-a716-446655440001',
    'ビジネス交渉に役立つ表現が学べました。もう少し例文があると良いかも。',
    4,
    TRUE
  );

-- 新しいサンプル教材の作成
INSERT INTO public.materials (user_id, title, description, content, category, tags, difficulty_level, is_published) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'ポリートレスポンスガイド',
    '異なる状況でのポリートレスポンスを学ぶためのガイド',
    jsonb_build_object(
      'introduction', 'Welcome to our guide on polite responses!',
      'examples', jsonb_build_array(
        jsonb_build_object(
          'phrase', 'Thank you for your question',
          'usage', 'Use this when acknowledging someone''s inquiry'
        ),
        jsonb_build_object(
          'phrase', 'I''d be happy to assist you.',
          'usage', 'Use this when offering help'
        ),
        jsonb_build_object(
          'phrase', 'Could you please clarify?',
          'usage', 'Use this when asking for more information politely'
        )
      ),
      'practice', 'Try creating your own polite responses for different situations'
    ),
    'communication',
    ARRAY['politeness', 'responses', 'formal'],
    1,
    TRUE
  );

-- テストユーザーの追加
INSERT INTO public.users (id, email, username)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test1@example.com', 'テストユーザー1'),
  ('22222222-2222-2222-2222-222222222222', 'test2@example.com', 'テストユーザー2'),
  ('33333333-3333-3333-3333-333333333333', 'test3@example.com', 'テストユーザー3')
ON CONFLICT (id) DO NOTHING;

-- テストクイズ結果の追加
INSERT INTO public.quiz_results (user_id, score, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 100, NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', 80, NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 90, NOW() - INTERVAL '3 days'),
  ('22222222-2222-2222-2222-222222222222', 70, NOW() - INTERVAL '4 days'),
  ('33333333-3333-3333-3333-333333333333', 60, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING; 
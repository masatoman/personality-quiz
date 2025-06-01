-- 実際の教材データを挿入するSQLスクリプト
-- ShiftWithの「ギバー精神で英語学習」のコンセプトに基づいた教材

-- 詳細なJSONBコンテンツを含む教材を挿入
INSERT INTO public.materials (
  user_id, 
  title, 
  description, 
  content, 
  category, 
  tags, 
  difficulty_level, 
  view_count, 
  rating, 
  is_published
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'ギバー英語：相手を助ける英会話フレーズ集',
  '人を助けることで自分も成長する。相手をサポートする英語表現を学びます',
  jsonb_build_object(
    'introduction', 'ギバー精神とは、他者を助けることで結果的に自分も成長し、成功を収める考え方です。この教材では、相手をサポートする英語表現を通じて、ギバー精神を実践しながら英語力を向上させます。',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'type', 'text',
        'title', '第1章：基本的な助けの申し出',
        'content', '日常的な場面で相手を助ける基本的な英語表現を学びます。',
        'examples', jsonb_build_array(
          jsonb_build_object('phrase', 'Can I help you?', 'japanese', 'お手伝いしましょうか？', 'situation', '困っている人を見かけた時'),
          jsonb_build_object('phrase', 'Is there anything I can do for you?', 'japanese', '何かお手伝いできることはありますか？', 'situation', 'より丁寧に支援を申し出る時'),
          jsonb_build_object('phrase', 'Let me help you with that.', 'japanese', 'それをお手伝いさせてください。', 'situation', '具体的な手助けを提案する時'),
          jsonb_build_object('phrase', 'Would you like me to...?', 'japanese', '私が...しましょうか？', 'situation', '特定の行動を提案する時')
        )
      ),
      jsonb_build_object(
        'type', 'text',
        'title', '第2章：職場でのサポート表現',
        'content', '同僚や部下をサポートするビジネス英語を学びます。',
        'examples', jsonb_build_array(
          jsonb_build_object('phrase', 'I can take care of that for you.', 'japanese', 'それは私がやっておきます。', 'situation', 'タスクを引き受ける時'),
          jsonb_build_object('phrase', 'Would you like me to review your work?', 'japanese', 'あなたの作業をレビューしましょうか？', 'situation', '品質向上を支援する時'),
          jsonb_build_object('phrase', 'I''m available if you need backup.', 'japanese', 'サポートが必要でしたら声をかけてください。', 'situation', '継続的な支援を約束する時'),
          jsonb_build_object('phrase', 'Let''s work on this together.', 'japanese', '一緒にこれに取り組みましょう。', 'situation', '協力を提案する時')
        )
      ),
      jsonb_build_object(
        'type', 'quiz',
        'title', '理解度チェック',
        'questions', jsonb_build_array(
          jsonb_build_object(
            'question', '困っている同僚に丁寧に支援を申し出る適切な表現は？',
            'options', jsonb_build_array(
              'What do you want?',
              'Is there anything I can do for you?',
              'You look confused.',
              'Figure it out yourself.'
            ),
            'correct_answer', 1,
            'explanation', '「Is there anything I can do for you?」が最も丁寧で適切な支援の申し出です。'
          ),
          jsonb_build_object(
            'question', 'チームワークを促進する表現として最適なのは？',
            'options', jsonb_build_array(
              'I''ll do it myself.',
              'That''s not my job.',
              'Let''s work on this together.',
              'You should handle this.'
            ),
            'correct_answer', 2,
            'explanation', '「Let''s work on this together.」は協力的な姿勢を示し、チームワークを促進します。'
          )
        )
      )
    ),
    'conclusion', 'ギバー精神を持って英語でコミュニケーションすることで、相手との良好な関係を築き、同時に自分の英語力も向上させることができます。これらの表現を日常的に使って、周りの人をサポートしていきましょう。'
  ),
  '英会話',
  ARRAY['ギバー', '英会話', 'サポート', 'コミュニケーション', '基礎'],
  2,
  245,
  4.7,
  TRUE
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'ビジネス英語：Win-Win関係を築く表現術',
  'ビジネスシーンで互恵的な関係を構築する英語コミュニケーション技術',
  jsonb_build_object(
    'introduction', 'ビジネスの世界では、一方的な関係ではなく、双方が利益を得られる「Win-Win」の関係構築が成功の鍵です。この教材では、ビジネス英語を通じて相互利益を生み出すコミュニケーション技術を学びます。',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'type', 'text',
        'title', '第1章：会議での協力的な表現',
        'content', '会議で相手の意見を求め、協力的な雰囲気を作る表現を学びます。',
        'examples', jsonb_build_array(
          jsonb_build_object('phrase', 'What are your thoughts on this?', 'japanese', 'これについてどう思われますか？', 'purpose', '相手の意見を尊重する'),
          jsonb_build_object('phrase', 'I''d like to hear your perspective.', 'japanese', 'あなたの視点をお聞かせください。', 'purpose', '多角的な意見を求める'),
          jsonb_build_object('phrase', 'How would this benefit your team?', 'japanese', 'これはあなたのチームにどのような利益をもたらしますか？', 'purpose', '相手の利益を考慮する'),
          jsonb_build_object('phrase', 'Let''s explore this together.', 'japanese', '一緒に検討してみましょう。', 'purpose', '協力的な姿勢を示す')
        )
      ),
      jsonb_build_object(
        'type', 'text',
        'title', '第2章：ネゴシエーション（交渉）スキル',
        'content', '相手の立場を理解し、双方にとって良い解決策を見つける交渉技術。',
        'examples', jsonb_build_array(
          jsonb_build_object('phrase', 'I understand your concerns.', 'japanese', 'あなたの懸念を理解します。', 'purpose', '共感を示す'),
          jsonb_build_object('phrase', 'What would make this work for you?', 'japanese', 'どうすればあなたにとって良い案になりますか？', 'purpose', '相手のニーズを確認する'),
          jsonb_build_object('phrase', 'This could work for both of us.', 'japanese', 'これは双方にとって良い案です。', 'purpose', 'Win-Winを提案する'),
          jsonb_build_object('phrase', 'Let''s find a solution that works for everyone.', 'japanese', '全員にとって良い解決策を見つけましょう。', 'purpose', '包括的な解決を目指す')
        )
      ),
      jsonb_build_object(
        'type', 'case_study',
        'title', 'ケーススタディ：サプライヤーとの交渉',
        'scenario', 'あなたは購買部門のマネージャーです。コスト削減が必要ですが、サプライヤーとの良好な関係も維持したいという状況です。',
        'dialogue', jsonb_build_array(
          jsonb_build_object('speaker', 'You', 'text', 'I understand you''re facing increased costs, but we need to discuss pricing.'),
          jsonb_build_object('speaker', 'Supplier', 'text', 'Yes, our raw material costs have gone up 15% this quarter.'),
          jsonb_build_object('speaker', 'You', 'text', 'What if we increased our order volume in exchange for maintaining current pricing?'),
          jsonb_build_object('speaker', 'Supplier', 'text', 'That could work. Higher volume would help offset our increased costs.'),
          jsonb_build_object('speaker', 'You', 'text', 'Great! This way we both benefit - you get volume stability, and we maintain our budget.')
        ),
        'analysis', 'この対話では、双方のニーズを理解し、創造的な解決策を見つけています。'
      )
    ),
    'practical_tips', jsonb_build_array(
      '常に相手の立場を考慮する',
      '批判ではなく、建設的な提案をする',
      '長期的な関係性を重視する',
      '感情的にならず、事実に基づいて話す',
      '複数の選択肢を用意する'
    ),
    'conclusion', '互恵的な関係を築くビジネス英語は、単なる言語スキル以上の価値を提供します。相手の立場を理解し、共通の利益を見つけ、長期的な成功を目指すコミュニケーションを実践しましょう。'
  ),
  'ビジネス英語',
  ARRAY['ビジネス', 'ネゴシエーション', 'Win-Win', '交渉', '中級'],
  3,
  189,
  4.5,
  TRUE
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'TOEIC対策：他者支援で学ぶリスニング戦略',
  '仲間と助け合いながら効率的にTOEICスコアを向上させる学習法',
  jsonb_build_object(
    'introduction', 'TOEICの学習は一人で行うものではありません。仲間と助け合いながら学習することで、理解が深まり、モチベーションも維持しやすくなります。この教材では、協働学習の原理を活用した効果的なTOEICリスニング対策を学びます。',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'type', 'overview',
        'title', 'TOEICリスニングセクション概要',
        'content', 'TOEICリスニングセクションの構成と協働学習のメリットを理解します。',
        'parts', jsonb_build_object(
          'part1', jsonb_build_object('name', '写真描写問題', 'questions', 6, 'strategy', '仲間と写真の詳細を話し合う'),
          'part2', jsonb_build_object('name', '応答問題', 'questions', 25, 'strategy', 'ペアで質問-応答練習'),
          'part3', jsonb_build_object('name', '会話問題', 'questions', 39, 'strategy', 'グループで役割分担'),
          'part4', jsonb_build_object('name', '説明文問題', 'questions', 30, 'strategy', 'チームで要約練習')
        ),
        'benefits', jsonb_build_array(
          '聞き逃した情報を仲間が補完',
          '異なる視点からの解釈',
          'モチベーションの維持',
          '実践的なディスカッション機会'
        )
      ),
      jsonb_build_object(
        'type', 'strategy',
        'title', 'Part 1-2 攻略戦略（ペア練習法）',
        'content', '写真描写問題と応答問題を仲間と効果的に練習する方法。',
        'part1_methods', jsonb_build_array(
          jsonb_build_object('method', '写真説明練習', 'description', '仲間が写真を見せ、あなたが英語で説明'),
          jsonb_build_object('method', 'キーワード共有', 'description', '重要な語彙を互いに教え合う'),
          jsonb_build_object('method', '間違い分析', 'description', 'なぜその選択肢を選んだか説明し合う')
        ),
        'part2_methods', jsonb_build_array(
          jsonb_build_object('method', '質問→応答ゲーム', 'description', '一人が質問、他が適切な応答を考える'),
          jsonb_build_object('method', '不適切応答分析', 'description', 'なぜその応答が間違いか話し合う'),
          jsonb_build_object('method', 'パターン暗記', 'description', 'よくある質問パターンを分担して覚える')
        ),
        'common_phrases', jsonb_build_object(
          'people_descriptions', jsonb_build_array(
            'A man is wearing a suit.',
            'A woman is holding a briefcase.',
            'People are gathering around the table.'
          ),
          'question_patterns', jsonb_build_array(
            'When questions: At 3 PM / Tomorrow morning',
            'Who questions: Mr. Smith / A client',
            'Where questions: In the conference room / Downtown'
          )
        )
      ),
      jsonb_build_object(
        'type', 'advanced_strategy',
        'title', 'Part 3-4 攻略戦略（チーム学習）',
        'content', '会話問題と説明文問題をチームで効率的に攻略する方法。',
        'team_methods', jsonb_build_array(
          jsonb_build_object('method', '3人1組学習法', 'roles', jsonb_build_array('Speaker A', 'Speaker B', '分析者')),
          jsonb_build_object('method', '先読み練習', 'description', '質問を事前に読み、仲間と予測を共有'),
          jsonb_build_object('method', '情報整理', 'description', '聞いた内容を仲間と確認し合う')
        ),
        'topic_specialization', jsonb_build_object(
          'member_a', 'Business announcements',
          'member_b', 'Phone messages',
          'member_c', 'News reports',
          'member_d', 'Advertisements'
        ),
        'daily_routine', jsonb_build_object(
          'morning', jsonb_build_array('仲間と単語クイズ', '昨日の間違い問題の確認'),
          'lunch', jsonb_build_array('Part 2 応答練習（ペアワーク）', '新しい表現の共有'),
          'evening', jsonb_build_array('Part 3, 4 の模擬試験', 'グループディスカッション')
        )
      ),
      jsonb_build_object(
        'type', 'quiz',
        'title', '実践問題',
        'questions', jsonb_build_array(
          jsonb_build_object(
            'audio_description', 'Part 2形式: "When is the quarterly meeting scheduled?"',
            'question', '適切な応答を選んでください：',
            'options', jsonb_build_array(
              'It''s in the main conference room.',
              'Next Friday at 2 PM.',
              'About the budget review.',
              'Mr. Johnson will attend.'
            ),
            'correct_answer', 1,
            'explanation', '「When（いつ）」の質問には時間を答える必要があります。「Next Friday at 2 PM」が正解。'
          )
        )
      )
    ),
    'support_system', jsonb_build_object(
      'buddy_system', jsonb_build_array(
        '学習パートナーを決める',
        '毎日の進捗を報告し合う',
        '困った時は相談できる関係を築く',
        '成功を一緒に喜ぶ'
      ),
      'weekly_review', jsonb_build_array(
        '各自の弱点を共有',
        '解決策をチームで検討',
        '次週の目標設定',
        'モチベーション向上活動'
      )
    ),
    'conclusion', '一人では挫折しがちなTOEIC学習も、仲間と助け合うことで継続できます。お互いの強みを活かし、弱点を補完し合いながら、全員でスコアアップを目指しましょう。'
  ),
  'TOEIC',
  ARRAY['TOEIC', 'リスニング', '協働学習', 'テスト対策', '中級'],
  3,
  312,
  4.8,
  TRUE
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '英語プレゼンテーション：聴衆を魅了する話し方',
  'ギバー精神で聴衆に価値を提供する英語プレゼンテーション技術',
  jsonb_build_object(
    'introduction', '優れたプレゼンテーションは、聴衆への「贈り物」です。あなたの知識、経験、アイデアを相手にとって価値のある形で提供することで、聴衆の人生やビジネスにポジティブな影響を与えることができます。',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'type', 'mindset',
        'title', 'ギバー・プレゼンターの心構え',
        'content', 'プレゼンテーションの目的を「自分の評価」から「聴衆への価値提供」に変える。',
        'mindset_shift', jsonb_build_object(
          'traditional', jsonb_build_array(
            '自分の内容を伝える',
            '評価されたい',
            '完璧に話したい'
          ),
          'giver_approach', jsonb_build_array(
            '聴衆の問題を解決する',
            '価値を提供したい',
            '相手の役に立ちたい'
          )
        ),
        'audience_focus', jsonb_build_array(
          'What challenges are my audience facing?',
          'How can my content help them?',
          'What value can I provide today?'
        )
      ),
      jsonb_build_object(
        'type', 'structure',
        'title', '構造化された英語プレゼンテーション',
        'content', '聴衆に価値を提供する構造的なプレゼンテーションの組み立て方。',
        'opening', jsonb_build_object(
          'attention_grabbers', jsonb_build_array(
            'Imagine if you could... (もし...できるとしたら...)',
            'What if I told you that... (もし私が...と言ったら...)',
            'By the end of this presentation, you''ll be able to... (このプレゼンテーションが終わる頃には、あなたは...できるようになります)'
          ),
          'value_propositions', jsonb_build_array(
            'Today, I''m here to share with you... (今日は...をシェアするためにここにいます)',
            'I want to give you practical tools that... (実践的なツールを提供したいと思います...)',
            'My goal is to help you... (私の目標はあなたが...することを助けることです)'
          )
        ),
        'body', jsonb_build_object(
          'transitions', jsonb_build_array(
            'Now, let me share with you... (それでは...をシェアします)',
            'Here''s what I''ve learned that might help you... (あなたの役に立つかもしれない学びを...)',
            'Based on my experience... (私の経験から...)'
          ),
          'evidence', jsonb_build_array(
            'Let me give you a concrete example... (具体例を挙げましょう...)',
            'Here''s a case study that illustrates... (これを説明するケーススタディがあります...)',
            'The data shows that... (データによると...)'
          )
        ),
        'closing', jsonb_build_object(
          'actionable_takeaways', jsonb_build_array(
            'Here are three things you can do starting today...',
            'I challenge you to try this approach...',
            'The next step for you is...'
          ),
          'continued_support', jsonb_build_array(
            'I''m available for questions after the presentation.',
            'Feel free to connect with me if you need further guidance.',
            'I''ve prepared additional resources for you.'
          )
        )
      ),
      jsonb_build_object(
        'type', 'engagement',
        'title', '聴衆エンゲージメント技術',
        'content', '聴衆を積極的に参加させ、価値のある体験を提供する技術。',
        'interactive_elements', jsonb_build_object(
          'reflection_questions', jsonb_build_array(
            'Take a moment to think about...',
            'Who here has experienced...?',
            'What would you do in this situation?'
          ),
          'polls_surveys', jsonb_build_array(
            'Raise your hand if...',
            'How many of you have tried...?',
            'On a scale of 1 to 10...'
          ),
          'group_discussions', jsonb_build_array(
            'Turn to the person next to you and discuss...',
            'In groups of three, brainstorm...',
            'Share your thoughts with your table...'
          )
        ),
        'storytelling', jsonb_build_object(
          'personal_stories', jsonb_build_array(
            'Let me tell you about a time when...',
            'I remember when I first...',
            'This reminds me of a story...'
          ),
          'case_studies', jsonb_build_array(
            'One of my clients faced a similar challenge...',
            'Here''s how another company solved this problem...',
            'Let me share a success story...'
          )
        )
      ),
      jsonb_build_object(
        'type', 'practical_exercise',
        'title', '実践演習：ミニプレゼンテーション',
        'scenario', 'あなたは新しいチームメンバーに、効果的な時間管理方法を教える3分間のプレゼンテーションを行います。',
        'structure_template', jsonb_build_object(
          'opening', 'How many of you feel overwhelmed by your daily tasks? Today, I want to share a simple technique that helped me increase my productivity by 40%.',
          'body_points', jsonb_build_array(
            'Point 1: The Pomodoro Technique - work in 25-minute focused blocks',
            'Point 2: Prioritize using the Eisenhower Matrix',
            'Point 3: Use time-blocking to protect your most important work'
          ),
          'closing', 'I challenge you to try one of these techniques this week. I''m happy to share my personal templates and answer any questions you have.'
        ),
        'evaluation_criteria', jsonb_build_array(
          'Value provided to audience',
          'Clear and engaging delivery',
          'Interactive elements used',
          'Actionable takeaways given',
          'Genuine desire to help others'
        )
      )
    ),
    'technical_skills', jsonb_build_object(
      'voice_control', jsonb_build_object(
        'pace_variation', 'Slow down for important points, speed up for energy',
        'volume_control', 'Speak louder for key messages, lower voice for intimate moments',
        'tone_modulation', 'Enthusiastic for exciting ideas, serious for important warnings'
      ),
      'body_language', jsonb_build_object(
        'eye_contact', 'Connect with individuals, scan entire audience',
        'gestures', 'Open palms for honesty, hand movements for emphasis',
        'movement', 'Step forward for importance, move toward audience for connection'
      )
    ),
    'follow_up', jsonb_build_object(
      'immediate', jsonb_build_array(
        'Thank you for your attention today.',
        'I hope this was valuable for you.',
        'Please don''t hesitate to reach out.'
      ),
      'resource_sharing', jsonb_build_array(
        'I''ll send you the slides and additional resources.',
        'Here''s a list of recommended reading.',
        'I''ve compiled some useful tools for you.'
      ),
      'long_term', jsonb_build_array(
        'I''m here if you need any guidance implementing this.',
        'Feel free to update me on your progress.',
        'I''d love to hear how this works out for you.'
      )
    ),
    'conclusion', '英語プレゼンテーションの真の目的は、言語スキルの披露ではなく、聴衆への価値提供です。ギバー精神を持って、相手の成功を心から願い、そのためのサポートを提供することで、あなた自身も成長し、より影響力のある話し手になることができます。'
  ),
  'プレゼンテーション',
  ARRAY['プレゼンテーション', 'スピーキング', '上級', 'リーダーシップ', 'パブリックスピーキング'],
  4,
  156,
  4.9,
  TRUE
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '英語基礎文法：支援の表現で学ぶ助動詞',
  '「助ける」をテーマにした助動詞の使い方と基礎文法',
  jsonb_build_object(
    'introduction', '助動詞（Modal Verbs）は、話し手の気持ちや態度を表現する重要な文法要素です。この教材では、「人を助ける」というギバー精神をテーマに、助動詞の使い方を楽しく学びます。',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'type', 'grammar_lesson',
        'title', 'Can - 能力と可能性の助動詞',
        'content', '相手を助ける場面でのCanの使い方を学びます。',
        'basic_usage', jsonb_build_object(
          'positive', 'I can help you. (私はあなたを助けることができます。)',
          'negative', 'I can''t do this alone. (一人ではこれはできません。)',
          'question', 'Can you help me? (私を助けてもらえますか？)'
        ),
        'helping_contexts', jsonb_build_array(
          jsonb_build_object(
            'type', 'ability',
            'examples', jsonb_build_array(
              'I can teach you English. (英語を教えることができます。)',
              'She can solve this problem. (彼女はこの問題を解決できます。)',
              'We can work together. (一緒に働くことができます。)'
            )
          ),
          jsonb_build_object(
            'type', 'permission',
            'examples', jsonb_build_array(
              'Can I help you carry that? (それを運ぶのを手伝ってもいいですか？)',
              'Can we use your expertise? (あなたの専門知識を使わせてもらえますか？)'
            )
          )
        ),
        'practice_sentences', jsonb_build_array(
          jsonb_build_object('sentence', 'I ___ help you with your homework.', 'answer', 'can'),
          jsonb_build_object('sentence', '___ you show me how to do this?', 'answer', 'Can'),
          jsonb_build_object('sentence', 'She ___ explain it better than I can.', 'answer', 'can')
        )
      ),
      jsonb_build_object(
        'type', 'grammar_lesson',
        'title', 'Will - 未来と意志の助動詞',
        'content', '将来の支援を約束し、強い意志を表現するWillの使い方。',
        'basic_usage', jsonb_build_object(
          'positive', 'I will help you tomorrow. (明日あなたを助けます。)',
          'negative', 'I won''t give up on you. (あなたを諦めません。)',
          'question', 'Will you support me? (私をサポートしてくれますか？)'
        ),
        'support_promises', jsonb_build_array(
          'I will always be there for you. (いつもあなたのそばにいます。)',
          'We will work through this together. (これを一緒に乗り越えます。)',
          'I will teach you everything I know. (知っていることをすべて教えます。)'
        ),
        'will_vs_going_to', jsonb_build_object(
          'will_spontaneous', 'I will help you! (今決めました：助けます！)',
          'going_to_planned', 'I''m going to help you tomorrow. (明日助ける予定です。)'
        )
      ),
      jsonb_build_object(
        'type', 'grammar_lesson',
        'title', 'Should - アドバイスと義務の助動詞',
        'content', '相手にアドバイスを与える時のShouldの適切な使い方。',
        'advice_examples', jsonb_build_array(
          'You should ask for help when you need it. (必要な時は助けを求めるべきです。)',
          'We should work as a team. (チームとして働くべきです。)',
          'You should believe in yourself. (自分を信じるべきです。)'
        ),
        'moral_obligation', jsonb_build_array(
          'We should help those in need. (困っている人を助けるべきです。)',
          'I should share my knowledge. (知識を共有するべきです。)',
          'Everyone should contribute to the team. (みんながチームに貢献するべきです。)'
        ),
        'past_regret', jsonb_build_array(
          'I should have offered help earlier. (もっと早く助けを申し出るべきでした。)',
          'We should have worked together. (一緒に働くべきでした。)',
          'You should have asked for support. (サポートを求めるべきでした。)'
        )
      ),
      jsonb_build_object(
        'type', 'conversation_practice',
        'title', '実践的な会話練習',
        'scenarios', jsonb_build_array(
          jsonb_build_object(
            'title', 'シチュエーション1：職場での支援',
            'dialogue', jsonb_build_array(
              jsonb_build_object('speaker', 'A', 'line', 'I''m struggling with this report.'),
              jsonb_build_object('speaker', 'B', 'line', 'I can help you organize the data.'),
              jsonb_build_object('speaker', 'A', 'line', 'Would you really? That would be great!'),
              jsonb_build_object('speaker', 'B', 'line', 'Of course! We should support each other.')
            )
          ),
          jsonb_build_object(
            'title', 'シチュエーション2：友人への相談',
            'dialogue', jsonb_build_array(
              jsonb_build_object('speaker', 'A', 'line', 'I don''t know what to do about this problem.'),
              jsonb_build_object('speaker', 'B', 'line', 'You might want to talk to someone with experience.'),
              jsonb_build_object('speaker', 'A', 'line', 'Should I ask our teacher?'),
              jsonb_build_object('speaker', 'B', 'line', 'You should. I''m sure she will help.')
            )
          )
        )
      ),
      jsonb_build_object(
        'type', 'quiz',
        'title', '理解度チェッククイズ',
        'questions', jsonb_build_array(
          jsonb_build_object(
            'question', '丁寧に支援を依頼する表現として適切なのは？',
            'options', jsonb_build_array(
              'Can you help me?',
              'Could you help me?',
              'Would you help me?',
              'All of the above'
            ),
            'correct_answer', 3,
            'explanation', 'すべて適切ですが、Could/Wouldの方がより丁寧な表現です。'
          ),
          jsonb_build_object(
            'question', '将来の支援を約束する表現は？',
            'options', jsonb_build_array(
              'I can support you.',
              'I will support you.',
              'I should support you.',
              'I might support you.'
            ),
            'correct_answer', 1,
            'explanation', '「I will support you.」が将来の約束を表す最も適切な表現です。'
          ),
          jsonb_build_object(
            'question', 'アドバイスを与える時に使う助動詞は？',
            'options', jsonb_build_array(
              'can',
              'will',
              'should',
              'must'
            ),
            'correct_answer', 2,
            'explanation', '「should」がアドバイスを与える時の最も適切な助動詞です。'
          )
        )
      )
    ),
    'modal_comparison', jsonb_build_object(
      'strength_order', jsonb_build_array(
        'might (弱い可能性)',
        'could (可能性・丁寧な依頼)',
        'should (アドバイス)',
        'must (強い義務)',
        'have to (外的必要性)'
      ),
      'politeness_level', jsonb_build_object(
        'casual', 'Can you help?',
        'polite', 'Could you help?',
        'very_polite', 'Would you mind helping?'
      )
    ),
    'conclusion', '助動詞を正しく使うことで、より丁寧で思いやりのある英語コミュニケーションができます。「助ける」という気持ちを様々な助動詞で表現し、相手に寄り添う英語を身につけましょう。'
  ),
  '文法',
  ARRAY['文法', '基礎', '助動詞', '初級', 'コミュニケーション'],
  2,
  278,
  4.6,
  TRUE
); 
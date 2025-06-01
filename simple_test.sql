-- 最初のテスト用教材データ
INSERT INTO materials (
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
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'ギバー英語：相手を助ける英会話フレーズ集',
  '人を助けることで自分も成長する。相手をサポートする英語表現を学びます',
  '{"introduction": "ギバー精神とは、他者を助けることで結果的に自分も成長し、成功を収める考え方です。この教材では、相手をサポートする英語表現を通じて、ギバー精神を実践しながら英語力を向上させます。", "sections": [{"type": "text", "title": "第1章：基本的な助けの申し出", "content": "日常的な場面で相手を助ける基本的な英語表現を学びます。", "examples": [{"phrase": "Can I help you?", "japanese": "お手伝いしましょうか？", "situation": "困っている人を見かけた時"}, {"phrase": "Is there anything I can do for you?", "japanese": "何かお手伝いできることはありますか？", "situation": "より丁寧に支援を申し出る時"}]}], "conclusion": "ギバー精神を持って英語でコミュニケーションすることで、相手との良好な関係を築き、同時に自分の英語力も向上させることができます。"}',
  '英会話',
  ARRAY['ギバー', '英会話', 'サポート', 'コミュニケーション', '基礎'],
  2,
  245,
  4.7,
  TRUE
); 
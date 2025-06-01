const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 教材データ
const materials = [
  {
    title: '日常英会話：ギバーのための基本フレーズ',
    description: '他者を助ける際に使える基本的な英語フレーズを学びます',
    content: `# ギバーのための英会話フレーズ

## 基本的な助けの申し出
- "Can I help you with that?" - それをお手伝いしましょうか？
- "Let me give you a hand." - お手伝いします。
- "Is there anything I can do for you?" - 何かお手伝いできることはありますか？

## 情報共有
- "I'd be happy to share what I know." - 知っていることを喜んでお教えします。
- "Here's something that might help." - これが役に立つかもしれません。

## 練習問題
1. 困っている同僚に声をかける時の表現は？
2. 知識を共有する時の丁寧な表現は？`,
    category: 'conversation',
    difficulty_level: 1, // 1=beginner
    tags: ['giver', 'conversation', 'helping']
  },
  {
    title: '英文法：助動詞の使い分け',
    description: 'can, could, may, mightなどの助動詞を正しく使い分ける方法を学習します',
    content: `# 助動詞の使い分け

## Can vs Could
- **Can**: 現在の能力や可能性
  - "I can help you now." - 今お手伝いできます。
- **Could**: 過去の能力や丁寧な依頼
  - "Could you help me?" - お手伝いいただけますか？

## May vs Might
- **May**: 許可や可能性（50%程度）
  - "You may use my notes." - 私のノートを使ってもいいです。
- **Might**: 低い可能性（30%程度）
  - "It might rain today." - 今日は雨が降るかもしれません。

## 練習問題
1. 丁寧に依頼する時はどの助動詞を使う？
2. 低い可能性を表す助動詞は？`,
    category: 'grammar',
    difficulty_level: 2, // 2=intermediate
    tags: ['grammar', 'modals', 'intermediate']
  },
  {
    title: '語彙力強化：ビジネス英語基本単語100',
    description: 'ビジネスシーンで頻出する重要単語100個をマスターします',
    content: `# ビジネス英語基本単語100

## 会議関連
- **agenda** - 議題
- **deadline** - 締切
- **proposal** - 提案
- **feedback** - フィードバック
- **collaborate** - 協力する

## プロジェクト管理
- **milestone** - マイルストーン
- **deliverable** - 成果物
- **stakeholder** - 利害関係者
- **budget** - 予算
- **timeline** - スケジュール

## コミュニケーション
- **clarify** - 明確にする
- **confirm** - 確認する
- **update** - 更新する
- **notify** - 通知する
- **coordinate** - 調整する

## 練習問題
1. 「締切」を英語で言うと？
2. 「利害関係者」の英語は？`,
    category: 'vocabulary',
    difficulty_level: 2, // 2=intermediate
    tags: ['vocabulary', 'business', 'intermediate']
  },
  {
    title: 'リスニング練習：TED Talksで学ぶギバー精神',
    description: 'TED Talksの音声を使って、ギバー精神に関する英語リスニング力を向上させます',
    content: `# TED Talksリスニング練習

## 今回の動画
**"Give and Take" by Adam Grant**

## 重要フレーズ
- "Givers are people who enjoy helping others."
- "The most successful people are often givers."
- "Helping others can lead to personal success."

## リスニングのコツ
1. **キーワードに注目**: giver, success, helping
2. **文脈を理解**: 話の流れを追う
3. **繰り返し聞く**: 理解できるまで何度も

## 練習問題
1. ギバーの特徴として挙げられているものは？
2. 成功するギバーの共通点は？

## 追加リソース
- TED公式サイトでの視聴
- 字幕機能の活用方法`,
    category: 'listening',
    difficulty_level: 2, // 2=intermediate
    tags: ['listening', 'ted', 'giver']
  },
  {
    title: 'スピーキング練習：プレゼンテーション基礎',
    description: '効果的なプレゼンテーションのための英語表現とテクニックを学習します',
    content: `# プレゼンテーション基礎

## 導入部分
- "Good morning, everyone. Thank you for coming."
- "Today, I'd like to talk about..."
- "The purpose of this presentation is to..."

## 本論の構成
- "First, let me explain..."
- "Moving on to the next point..."
- "This brings us to..."

## 結論部分
- "To summarize..."
- "In conclusion..."
- "Thank you for your attention."

## 質疑応答
- "Are there any questions?"
- "That's a great question."
- "Let me clarify that point."

## 練習課題
1. 自己紹介プレゼンテーション（2分）
2. 好きな趣味について（3分）
3. 将来の目標について（5分）`,
    category: 'speaking',
    difficulty_level: 2, // 2=intermediate
    tags: ['speaking', 'presentation', 'business']
  },
  {
    title: 'リーディング：英字新聞で学ぶ時事英語',
    description: '英字新聞の記事を通じて時事英語と読解力を向上させます',
    content: `# 英字新聞リーディング

## 今週の記事
**"Community Volunteers Make a Difference"**

## 重要語彙
- **volunteer** - ボランティア
- **community** - 地域社会
- **impact** - 影響
- **initiative** - 取り組み
- **contribution** - 貢献

## 読解のコツ
1. **見出しから内容を予測**
2. **段落ごとの要点を把握**
3. **未知の単語は文脈から推測**

## 記事の要約
地域のボランティア活動が社会に与える positive impact について述べた記事。特に若者の参加が増加していることが強調されている。

## 理解度チェック
1. 記事の主なテーマは？
2. ボランティア活動の効果として挙げられているものは？
3. 若者の参加が増えている理由は？`,
    category: 'reading',
    difficulty_level: 2, // 2=intermediate
    tags: ['reading', 'news', 'current-events']
  },
  {
    title: 'TOEIC対策：Part 5 文法問題攻略',
    description: 'TOEIC Part 5の文法問題を効率的に解くためのテクニックを学習します',
    content: `# TOEIC Part 5 攻略法

## 問題の特徴
- 短文の空欄補充
- 文法・語彙問題
- 時間配分が重要（1問20秒目標）

## 頻出文法項目
1. **時制**: 現在完了、過去完了
2. **関係詞**: who, which, that
3. **前置詞**: in, on, at, for
4. **接続詞**: because, although, while

## 解答テクニック
1. **品詞を判断**: 空欄の前後を見る
2. **文の構造を把握**: 主語・動詞を特定
3. **文脈を理解**: 論理的な流れを確認

## 練習問題
1. The meeting _____ at 3 PM yesterday.
   (A) start (B) started (C) starting (D) starts

2. _____ the weather was bad, we decided to go.
   (A) Because (B) Although (C) Since (D) While

## 答え: 1.(B) 2.(B)`,
    category: 'test-prep',
    difficulty_level: 2, // 2=intermediate
    tags: ['toeic', 'grammar', 'test-prep']
  },
  {
    title: '上級英作文：論理的な文章構成',
    description: '説得力のある英語エッセイを書くための高度なライティングテクニックを学習します',
    content: `# 論理的な英作文

## エッセイの基本構造
1. **Introduction**: 問題提起・論点提示
2. **Body Paragraphs**: 根拠・例証
3. **Conclusion**: 結論・まとめ

## 論理的な接続表現
- **因果関係**: therefore, consequently, as a result
- **対比**: however, on the other hand, in contrast
- **追加**: furthermore, moreover, in addition
- **例示**: for example, for instance, such as

## 説得力のある論証
1. **具体例の提示**: 統計データ、事例
2. **反対意見への言及**: 客観性の確保
3. **論理的な結論**: 根拠に基づく主張

## 練習課題
**テーマ**: "The importance of helping others in modern society"

### 構成例
1. Introduction: 現代社会における助け合いの重要性
2. Body 1: 個人レベルでの利益
3. Body 2: 社会レベルでの利益
4. Body 3: 反対意見とその反駁
5. Conclusion: 総括と提言

## 評価基準
- 論理性・一貫性
- 語彙の豊富さ
- 文法の正確性
- 創造性・独自性`,
    category: 'writing',
    difficulty_level: 3, // 3=advanced
    tags: ['writing', 'essay', 'advanced']
  },
  {
    title: 'ビジネス英語：国際会議での発言術',
    description: '国際的なビジネス会議で効果的に発言するための高度な英語表現を学習します',
    content: `# 国際会議での発言術

## 会議での基本姿勢
- **積極的参加**: 建設的な意見を述べる
- **相互尊重**: 異なる文化背景を理解
- **明確な表現**: 誤解を避ける簡潔さ

## 高度な表現技法
### 意見の提示
- "I'd like to propose an alternative approach."
- "From my perspective, we should consider..."
- "Based on our experience, I believe..."

### 議論の調整
- "Let me build on what John just said."
- "I see your point, but I'd like to add..."
- "Perhaps we could find a middle ground."

### 合意形成
- "It seems we're all in agreement on this point."
- "Shall we move forward with this proposal?"
- "I think we've reached a consensus."

## 文化的配慮
- **直接的すぎる表現を避ける**
- **相手の面子を保つ**
- **時間を意識した発言**

## 実践演習
1. 新プロジェクトの提案
2. 予算削減案への反対意見
3. チーム間の意見調整

## 成功の指標
- 発言の明確性
- 他者への配慮
- 建設的な貢献`,
    category: 'business',
    difficulty_level: 3, // 3=advanced
    tags: ['business', 'meeting', 'advanced']
  },
  {
    title: '英語イディオム：ネイティブ表現100選',
    description: 'ネイティブスピーカーがよく使う慣用表現を学んで、より自然な英語を身につけます',
    content: `# ネイティブ英語イディオム100選

## 日常会話でよく使われるイディオム

### 感情・状態を表す表現
- **"Break a leg!"** - 頑張って！（Good luck!）
- **"I'm all ears."** - よく聞いています
- **"It's a piece of cake."** - とても簡単です
- **"I'm feeling under the weather."** - 体調が悪いです

### ビジネスシーンでの表現
- **"Let's touch base."** - 連絡を取り合いましょう
- **"Think outside the box."** - 既成概念にとらわれずに考える
- **"We're on the same page."** - 同じ理解です
- **"Let's call it a day."** - 今日はここまでにしましょう

### 助け合いに関する表現
- **"Lend a helping hand."** - 手を貸す
- **"Go the extra mile."** - 期待以上のことをする
- **"Have someone's back."** - 誰かを支援する
- **"Pay it forward."** - 善意を次の人に回す

## 使用例とコンテキスト
各イディオムの適切な使用場面と、文化的背景を理解することが重要です。

## 練習問題
1. 同僚を励ます時に使う表現は？
2. 簡単な作業を表現するイディオムは？
3. チームワークを表すビジネス表現は？

## 上達のコツ
- 映画・ドラマでの使用例を観察
- ネイティブとの会話で実践
- 文脈に応じた適切な使い分け`,
    category: 'vocabulary',
    difficulty_level: 3, // 3=advanced
    tags: ['idioms', 'native-expressions', 'advanced']
  }
];

// クイズデータ
const quizzes = [
  {
    title: '基本英文法クイズ：時制編',
    description: '英語の基本時制（現在・過去・未来）の理解度をチェックします',
    category: 'grammar',
    difficulty_level: 1, // 1=beginner
    questions: [
      {
        question: '「私は昨日映画を見ました」を英語で表現すると？',
        options: [
          'I see a movie yesterday.',
          'I saw a movie yesterday.',
          'I will see a movie yesterday.',
          'I am seeing a movie yesterday.'
        ],
        correct_answer: 1,
        explanation: '過去の出来事なので過去形「saw」を使います。'
      },
      {
        question: '現在進行形の正しい形は？',
        options: [
          'I am study English.',
          'I am studying English.',
          'I study English now.',
          'I studied English.'
        ],
        correct_answer: 1,
        explanation: '現在進行形は「be動詞 + 動詞のing形」で表現します。'
      }
    ]
  },
  {
    title: 'ビジネス英語語彙クイズ',
    description: 'ビジネスシーンでよく使われる英単語の知識をテストします',
    category: 'vocabulary',
    difficulty_level: 2, // 2=intermediate
    questions: [
      {
        question: '「締切」を英語で言うと？',
        options: ['Deadline', 'Timeline', 'Outline', 'Baseline'],
        correct_answer: 0,
        explanation: 'Deadlineは「締切、期限」という意味です。'
      },
      {
        question: '「利害関係者」の英語は？',
        options: ['Shareholder', 'Stakeholder', 'Placeholder', 'Cardholder'],
        correct_answer: 1,
        explanation: 'Stakeholderは「利害関係者」を意味します。'
      }
    ]
  },
  {
    title: 'リスニング理解度クイズ',
    description: '英語リスニングの基本的な理解力をチェックします',
    category: 'listening',
    difficulty_level: 2, // 2=intermediate
    questions: [
      {
        question: '会話で話者が提案していることは？',
        options: [
          '明日会議を開く',
          '来週プロジェクトを開始する',
          '今日早く帰る',
          '新しいチームを作る'
        ],
        correct_answer: 1,
        explanation: '話者は「来週新しいプロジェクトを始めよう」と提案しています。'
      }
    ]
  },
  {
    title: 'TOEIC Part 5 練習クイズ',
    description: 'TOEIC Part 5形式の文法問題で実力をチェックします',
    category: 'test-prep',
    difficulty_level: 2, // 2=intermediate
    questions: [
      {
        question: 'The meeting _____ at 3 PM yesterday.',
        options: ['start', 'started', 'starting', 'starts'],
        correct_answer: 1,
        explanation: '過去の特定の時間を表す「yesterday」があるので過去形を使います。'
      },
      {
        question: '_____ the weather was bad, we decided to go.',
        options: ['Because', 'Although', 'Since', 'While'],
        correct_answer: 1,
        explanation: '「天気が悪かったにもかかわらず」という逆接の意味なので「Although」が正解です。'
      }
    ]
  },
  {
    title: '上級英作文クイズ',
    description: '論理的な英文構成と高度な表現力をテストします',
    category: 'writing',
    difficulty_level: 3, // 3=advanced
    questions: [
      {
        question: '論理的な文章で「結果として」を表す最も適切な表現は？',
        options: ['So', 'Consequently', 'And', 'But'],
        correct_answer: 1,
        explanation: '「Consequently」は論理的な因果関係を示すフォーマルな表現です。'
      }
    ]
  }
];

async function createInitialContent() {
  console.log('初期コンテンツの作成を開始します...');

  try {
    // ユーザーの確認
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profileError) {
      console.error('❌ プロフィール取得エラー:', profileError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('ユーザーが存在しません。先にユーザーを作成してください。');
      return;
    }

    const authorId = profiles[0].id;
    console.log(`✅ 作成者ID: ${authorId}`);

    // 教材の作成
    console.log('\n📚 教材を作成中...');
    for (const material of materials) {
      const { data, error } = await supabase
        .from('materials')
        .insert({
          user_id: authorId, // user_idは必須
          title: material.title,
          description: material.description,
          content: material.content,
          category: material.category,
          difficulty_level: material.difficulty_level, // 数値
          author_id: authorId,
          is_published: true, // is_publicではなくis_published
          tags: material.tags
        })
        .select();

      if (error) {
        console.error(`❌ 教材作成エラー (${material.title}):`, error);
      } else {
        console.log(`✅ 教材作成成功: ${material.title}`);
      }
    }

    // クイズの作成（簡単な形式で）
    console.log('\n🎯 クイズを作成中...');
    for (const quiz of quizzes) {
      const quizContent = {
        type: 'quiz',
        questions: quiz.questions
      };

      const { data, error } = await supabase
        .from('materials')
        .insert({
          user_id: authorId, // user_idは必須
          title: quiz.title,
          description: quiz.description,
          content: JSON.stringify(quizContent),
          category: quiz.category,
          difficulty_level: quiz.difficulty_level, // 数値
          author_id: authorId,
          is_published: true,
          tags: ['quiz', quiz.category]
        })
        .select();

      if (error) {
        console.error(`❌ クイズ作成エラー (${quiz.title}):`, error);
      } else {
        console.log(`✅ クイズ作成成功: ${quiz.title}`);
      }
    }

    // 作成結果の確認
    const { data: allMaterials, error: countError } = await supabase
      .from('materials')
      .select('id, title, category, difficulty_level')
      .eq('author_id', authorId);

    if (countError) {
      console.error('❌ 作成結果確認エラー:', countError);
    } else {
      console.log(`\n🎉 初期コンテンツの作成が完了しました！`);
      console.log(`📊 総計: ${allMaterials?.length || 0}件の教材を作成しました`);
      
      // 難易度別の集計
      const beginnerCount = allMaterials?.filter(m => m.difficulty_level === 1).length || 0;
      const intermediateCount = allMaterials?.filter(m => m.difficulty_level === 2).length || 0;
      const advancedCount = allMaterials?.filter(m => m.difficulty_level === 3).length || 0;
      
      console.log('\n📋 難易度別内訳:');
      console.log(`   初級 (1): ${beginnerCount}件`);
      console.log(`   中級 (2): ${intermediateCount}件`);
      console.log(`   上級 (3): ${advancedCount}件`);
      
      // カテゴリ別の集計
      const categories = [...new Set(allMaterials?.map(m => m.category) || [])];
      console.log('\n📋 カテゴリ別内訳:');
      categories.forEach(category => {
        const count = allMaterials?.filter(m => m.category === category).length || 0;
        console.log(`   ${category}: ${count}件`);
      });
    }

    console.log('\n✨ スクリプトが正常に完了しました');

  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

createInitialContent(); 
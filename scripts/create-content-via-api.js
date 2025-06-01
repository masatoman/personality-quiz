const fs = require('fs');
const path = require('path');

// 初期教材データ
const initialMaterials = [
  // 初級教材 (3件)
  {
    basicInfo: {
      title: '英語の基本的な挨拶と自己紹介',
      description: '日常的な挨拶と簡単な自己紹介の表現を学習します。初心者向けの基礎的な内容です。',
      coverImage: null,
      tags: ['挨拶', '自己紹介', '基礎']
    },
    settings: {
      isPublic: true,
      difficulty: 'beginner',
      estimatedTime: 20,
      allowComments: true,
      targetAudience: ['beginner', 'student'],
      prerequisites: 'アルファベットが読める'
    },
    contentSections: [
      {
        type: 'text',
        title: '基本的な挨拶',
        content: `# 基本的な挨拶

## 朝の挨拶
- Good morning! (おはようございます！)
- How are you? (元気ですか？)
- I'm fine, thank you. (元気です、ありがとう。)

## 昼間の挨拶
- Good afternoon! (こんにちは！)
- Nice to see you. (お会いできて嬉しいです。)

## 夜の挨拶
- Good evening! (こんばんは！)
- Good night! (おやすみなさい！)`,
        order: 0
      },
      {
        type: 'text',
        title: '自己紹介',
        content: `# 自己紹介

## 基本の型
- My name is [名前]. (私の名前は[名前]です。)
- I'm from [出身地]. (私は[出身地]出身です。)
- Nice to meet you. (初めまして。)

## 例文
- My name is Tanaka. I'm from Japan. Nice to meet you.
(私の名前は田中です。日本出身です。初めまして。)`,
        order: 1
      }
    ]
  },
  {
    basicInfo: {
      title: '英語の基本文法：be動詞',
      description: 'be動詞（am, is, are）の基本的な使い方を学習します。',
      coverImage: null,
      tags: ['文法', 'be動詞', '基礎']
    },
    settings: {
      isPublic: true,
      difficulty: 'beginner',
      estimatedTime: 25,
      allowComments: true,
      targetAudience: ['beginner', 'student'],
      prerequisites: '基本的な挨拶ができる'
    },
    contentSections: [
      {
        type: 'text',
        title: 'be動詞とは',
        content: `# be動詞とは

be動詞は「〜です」「〜である」という意味を表す動詞です。

## be動詞の形
- I am (私は〜です)
- You are (あなたは〜です)
- He/She/It is (彼/彼女/それは〜です)

## 例文
- I am a student. (私は学生です)
- You are kind. (あなたは親切です)
- She is a teacher. (彼女は先生です)`,
        order: 0
      },
      {
        type: 'quiz',
        title: 'be動詞クイズ',
        content: '',
        options: [
          {
            question: '次の文の空欄に入る適切なbe動詞を選んでください：I ___ a student.',
            options: ['am', 'is', 'are'],
            answer: 0,
            explanation: '主語がIの時は、be動詞はamを使います。'
          }
        ],
        order: 1
      }
    ]
  },
  {
    basicInfo: {
      title: '基本単語100選：日常生活編',
      description: '日常生活でよく使う基本的な英単語100個を覚えます。',
      coverImage: null,
      tags: ['単語', '日常生活', '基礎']
    },
    settings: {
      isPublic: true,
      difficulty: 'beginner',
      estimatedTime: 30,
      allowComments: true,
      targetAudience: ['beginner', 'student'],
      prerequisites: 'アルファベットが読める'
    },
    contentSections: [
      {
        type: 'text',
        title: '家族に関する単語',
        content: `# 家族に関する単語

## 基本の家族
- family (家族)
- father (父)
- mother (母)
- brother (兄弟)
- sister (姉妹)
- grandfather (祖父)
- grandmother (祖母)

## 例文
- My family is small. (私の家族は小さいです)
- I have one brother and one sister. (私には兄弟が一人と姉妹が一人います)`,
        order: 0
      }
    ]
  },
  
  // 中級教材 (5件)
  {
    basicInfo: {
      title: 'ビジネス英語：メールの書き方',
      description: 'ビジネスシーンで使える英語メールの基本的な書き方を学習します。',
      coverImage: null,
      tags: ['ビジネス', 'メール', '中級']
    },
    settings: {
      isPublic: true,
      difficulty: 'intermediate',
      estimatedTime: 40,
      allowComments: true,
      targetAudience: ['professional', 'intermediate'],
      prerequisites: '基本的な英文法を理解している'
    },
    contentSections: [
      {
        type: 'text',
        title: 'メールの基本構造',
        content: `# ビジネスメールの基本構造

## 1. 件名 (Subject Line)
明確で簡潔な件名をつけます。
例：Meeting Request for Project Discussion

## 2. 宛名 (Salutation)
- Dear Mr./Ms. [姓]
- Dear [名前] (親しい場合)

## 3. 本文 (Body)
- 用件を明確に
- 丁寧で簡潔に

## 4. 結び (Closing)
- Best regards,
- Sincerely,

## サンプルメール
\`\`\`
Subject: Meeting Request for Next Week

Dear Mr. Smith,

I hope this email finds you well. I would like to schedule a meeting to discuss our upcoming project.

Would next Tuesday at 2 PM work for you?

Best regards,
Tanaka
\`\`\``,
        order: 0
      }
    ]
  },
  {
    basicInfo: {
      title: '英語プレゼンテーション基礎',
      description: '効果的な英語プレゼンテーションの構成と表現を学習します。',
      coverImage: null,
      tags: ['プレゼンテーション', 'スピーキング', '中級']
    },
    settings: {
      isPublic: true,
      difficulty: 'intermediate',
      estimatedTime: 45,
      allowComments: true,
      targetAudience: ['professional', 'intermediate'],
      prerequisites: 'ビジネス英語の基礎知識'
    },
    contentSections: [
      {
        type: 'text',
        title: 'プレゼンテーションの構成',
        content: `# プレゼンテーションの基本構成

## 1. 導入 (Introduction)
- Good morning/afternoon, everyone.
- Today, I'm going to talk about...
- Let me start by...

## 2. 本論 (Main Body)
- First of all...
- Secondly...
- Finally...

## 3. 結論 (Conclusion)
- In conclusion...
- To sum up...
- Thank you for your attention.

## 便利なフレーズ
- Let me show you... (見せします)
- As you can see... (ご覧のように)
- Any questions? (質問はありますか？)`,
        order: 0
      }
    ]
  },
  {
    basicInfo: {
      title: 'TOEIC対策：リーディング戦略',
      description: 'TOEICリーディングセクションで高得点を取るための戦略を学習します。',
      coverImage: null,
      tags: ['TOEIC', 'リーディング', '試験対策']
    },
    settings: {
      isPublic: true,
      difficulty: 'intermediate',
      estimatedTime: 50,
      allowComments: true,
      targetAudience: ['intermediate', 'student'],
      prerequisites: 'TOEIC500点以上'
    },
    contentSections: [
      {
        type: 'text',
        title: 'スキミング技術',
        content: `# スキミング（Skimming）技術

スキミングとは、文章の要点を素早く掴む読み方です。

## コツ
1. タイトルと見出しに注目
2. 各段落の最初と最後の文を読む
3. キーワードを探す
4. 時間配分を意識する

## 実践方法
- 1分で全体を見渡す
- 重要な情報を見つける
- 詳細は後で読む

## TOEIC Part 7での活用
- 文書の種類を特定
- 設問を先に読む
- 必要な情報だけを探す`,
        order: 0
      }
    ]
  },
  {
    basicInfo: {
      title: '英語リスニング：ニュース英語入門',
      description: 'CNNやBBCなどのニュース英語を理解するためのリスニング練習です。',
      coverImage: null,
      tags: ['リスニング', 'ニュース', '中級']
    },
    settings: {
      isPublic: true,
      difficulty: 'intermediate',
      estimatedTime: 35,
      allowComments: true,
      targetAudience: ['intermediate'],
      prerequisites: '英検準2級程度のリスニング力'
    },
    contentSections: [
      {
        type: 'text',
        title: 'ニュース英語の特徴',
        content: `# ニュース英語の特徴

## 1. 明確な構造
- Lead（導入）: 最も重要な情報
- Body（本文）: 詳細な説明
- Conclusion（結論）: まとめ

## 2. 使用される表現
- Breaking news (速報)
- According to sources (情報筋によると)
- It is reported that... (報道によると...)

## 3. 聞き取りのコツ
- 5W1H（Who, What, When, Where, Why, How）に注目
- キーワードを意識
- 文脈から推測
- 完璧を求めない

## 練習方法
1. BBC Learning English を活用
2. スクリプトと併用する
3. 毎日5分から始める`,
        order: 0
      }
    ]
  },
  {
    basicInfo: {
      title: '中級英文法：仮定法',
      description: '仮定法の基本的な使い方と応用を学習します。',
      coverImage: null,
      tags: ['文法', '仮定法', '中級']
    },
    settings: {
      isPublic: true,
      difficulty: 'intermediate',
      estimatedTime: 40,
      allowComments: true,
      targetAudience: ['intermediate', 'student'],
      prerequisites: '基本的な時制を理解している'
    },
    contentSections: [
      {
        type: 'text',
        title: '仮定法過去',
        content: `# 仮定法過去

現在の事実に反する仮定を表現します。

## 基本形
If + 主語 + 動詞の過去形, 主語 + would/could/might + 動詞の原形

## 例文
- If I had money, I would buy a car.
（もしお金があれば、車を買うのに）

- If I were you, I would study harder.
（もし私があなたなら、もっと勉強するのに）

## 注意点
- be動詞は常に "were" を使用
- 現実とは反対のことを表現
- 願望や後悔を表すことが多い

## 練習問題
1. If I (be) rich, I (travel) around the world.
2. If you (know) the answer, you (tell) me.`,
        order: 0
      }
    ]
  },

  // 上級教材 (2件)
  {
    basicInfo: {
      title: 'Academic Writing: 論文の書き方',
      description: '学術的な英語論文の構成と表現技法を学習します。',
      coverImage: null,
      tags: ['ライティング', '学術論文', '上級']
    },
    settings: {
      isPublic: true,
      difficulty: 'advanced',
      estimatedTime: 60,
      allowComments: true,
      targetAudience: ['advanced', 'professional'],
      prerequisites: '高度な英文法知識、研究経験'
    },
    contentSections: [
      {
        type: 'text',
        title: '論文の基本構造',
        content: `# Academic Paper の基本構造

## 1. Abstract（要約）
研究の目的、方法、結果、結論を簡潔にまとめます。
通常150-250語程度。

## 2. Introduction（序論）
- Background information
- Literature review (簡潔に)
- Research question/hypothesis
- Thesis statement

## 3. Literature Review（文献レビュー）
既存研究の分析と評価。研究のギャップを明確にする。

## 4. Methodology（方法論）
研究手法の詳細な説明。再現可能性を重視。

## 5. Results（結果）
データの客観的な報告。表やグラフを効果的に活用。

## 6. Discussion（考察）
結果の解釈と意味。制限や今後の研究方向も含む。

## 7. Conclusion（結論）
研究の総括と今後の展望。

## アカデミックな表現例
- This study aims to...
- Previous research has shown that...
- The findings suggest that...
- Further research is needed to...`,
        order: 0
      }
    ]
  },
  {
    basicInfo: {
      title: '上級英語：慣用表現とスラング',
      description: 'ネイティブスピーカーがよく使う慣用表現とスラングを学習します。',
      coverImage: null,
      tags: ['慣用表現', 'スラング', '上級']
    },
    settings: {
      isPublic: true,
      difficulty: 'advanced',
      estimatedTime: 45,
      allowComments: true,
      targetAudience: ['advanced'],
      prerequisites: '上級レベルの英語力'
    },
    contentSections: [
      {
        type: 'text',
        title: 'よく使われる慣用表現',
        content: `# よく使われる慣用表現

## ビジネスシーン
- "Think outside the box" (従来の枠にとらわれずに考える)
- "Touch base" (連絡を取る)
- "Ball is in your court" (決定権はあなたにある)
- "Move the needle" (大きな変化をもたらす)

## 日常会話
- "Break a leg" (頑張って)
- "Hit the nail on the head" (的を射る)
- "Piece of cake" (朝飯前)
- "When pigs fly" (ありえない)

## 感情表現
- "Over the moon" (大喜び)
- "Down in the dumps" (落ち込んでいる)
- "On cloud nine" (有頂天)
- "Spill the beans" (秘密をばらす)

## 使用上の注意
- カジュアルな場面で使用
- 相手との関係性を考慮
- 文脈を理解して使用
- 過度に使用しない`,
        order: 0
      }
    ]
  }
];

// JSONファイルとして保存
function saveInitialMaterials() {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    
    // dataディレクトリが存在しない場合は作成
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, 'initial-materials.json');
    fs.writeFileSync(filePath, JSON.stringify(initialMaterials, null, 2), 'utf8');
    
    console.log(`✅ 初期教材データを ${filePath} に保存しました`);
    console.log(`📊 教材数: ${initialMaterials.length}件`);
    
    // カテゴリ別の集計
    const categories = {};
    const difficulties = {};
    
    initialMaterials.forEach(material => {
      const category = material.contentSections[0]?.title || 'その他';
      const difficulty = material.settings.difficulty;
      
      categories[category] = (categories[category] || 0) + 1;
      difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;
    });
    
    console.log('\n📋 難易度別内訳:');
    Object.entries(difficulties).forEach(([difficulty, count]) => {
      console.log(`   ${difficulty}: ${count}件`);
    });

    return filePath;
  } catch (error) {
    console.error('❌ ファイル保存エラー:', error);
    return null;
  }
}

// 手動で教材データをNext.jsのAPIに送信する指示を表示
function showManualInstructions() {
  console.log('\n📝 手動での教材作成手順:');
  console.log('1. Next.jsアプリケーションを起動: npm run dev');
  console.log('2. ブラウザで http://localhost:3000/auth/login にアクセス');
  console.log('3. ログインまたはユーザー登録');
  console.log('4. /create-material ページにアクセス');
  console.log('5. 以下のデータを参考に教材を作成');
  console.log('\n💡 または、Postmanなどのツールを使用してAPIに直接送信');
  console.log('POST http://localhost:3000/api/materials');
  console.log('Content-Type: application/json');
  console.log('Authorization: Bearer <your-jwt-token>');
}

if (require.main === module) {
  console.log('🎯 初期教材データの準備を開始します...\n');
  
  const filePath = saveInitialMaterials();
  
  if (filePath) {
    showManualInstructions();
    console.log(`\n📄 保存されたデータファイル: ${filePath}`);
    console.log('\n✨ 手動でのコンテンツ作成準備が完了しました');
  } else {
    console.log('\n❌ データファイルの保存に失敗しました');
  }
}

module.exports = { initialMaterials, saveInitialMaterials }; 
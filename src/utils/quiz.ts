import { PersonalityType } from '@/types/quiz';

export function calculatePersonalityType(answers: number[]): PersonalityType {
  const counts: Record<PersonalityType, number> = {
    giver: 0,
    taker: 0,
    matcher: 0
  };

  // 各回答を処理
  answers.forEach((answerIndex, questionIndex) => {
    // 質問と選択肢の定義
    const questions = [
      {
        options: [
          { type: 'giver' as PersonalityType },
          { type: 'taker' as PersonalityType },
          { type: 'matcher' as PersonalityType }
        ]
      },
      // ... 他の質問も同様の構造
    ];

    // 有効な回答のみを処理
    const question = questions[questionIndex];
    if (question && answerIndex >= 0 && answerIndex < question.options.length) {
      const type = question.options[answerIndex].type;
      counts[type] += 1;
    }
  });

  // 最も多い回答のタイプを特定
  let maxType: PersonalityType = 'matcher'; // デフォルト値
  let maxCount = counts.matcher;

  (Object.entries(counts) as [PersonalityType, number][]).forEach(([type, count]) => {
    if (count > maxCount) {
      maxType = type;
      maxCount = count;
    }
  });

  return maxType;
}

export function getPersonalityTypeDescription(type: PersonalityType): string {
  const descriptions: Record<PersonalityType, string> = {
    giver: '他者をサポートしながら学ぶことで、最も効果的に知識を定着させることができるタイプです。',
    taker: '効率的な学習方法を見つけ、自己の成長に焦点を当てることで最も効果的に学習できるタイプです。',
    matcher: '相互学習を通じてバランスの取れた成長を遂げることができるタイプです。'
  };

  return descriptions[type];
}

export function getPersonalityDescription(type: PersonalityType) {
  const descriptions = {
    giver: {
      type: 'giver' as const,
      description: '他者をサポートしながら学ぶことを好む学習者です。知識を共有し、教えることで自身の理解も深まり、効果的に学習を進めることができます。',
      strengths: [
        '教えることで理解が深まる',
        '知識の共有が得意',
        '協調的な学習環境を作れる',
        'コミュニティ形成が得意'
      ],
      weaknesses: [
        '自身の学習時間が確保しづらい',
        '他者への依存度が高くなりがち',
        '完璧を求めすぎる傾向がある',
        '自己学習のペース配分が難しい'
      ],
      learningAdvice: {
        title: '教え合いを通じた学習アプローチ',
        description: '他者と知識を共有しながら、互いに高め合う学習を心がけましょう。',
        tips: [
          '学習グループを作って定期的に集まる',
          '教えることで自分の理解を深める',
          '質問への回答を通じて知識を整理する',
          'コミュニティでの学び合いを大切にする'
        ],
        tools: [
          'Discord（学習コミュニティ）',
          'Notion（知識共有）',
          'Zoom（オンライン勉強会）',
          'Slack（学習チーム）'
        ]
      }
    },
    taker: {
      type: 'taker' as const,
      description: '効率的な学習方法を見つけ、自己の成長に焦点を当てることで最も効果的に学習できるタイプです。個人学習を重視し、自分のペースで着実に進めることができます。',
      strengths: [
        '自己ペースでの学習が得意',
        '集中力が高い',
        '効率的な学習方法を見つけられる',
        '目標達成への意識が高い'
      ],
      weaknesses: [
        'コミュニケーション学習が不足しがち',
        '実践的なスキル習得に時間がかかる',
        '他者からのフィードバックが少ない',
        '視野が狭くなりやすい'
      ],
      learningAdvice: {
        title: '自己主導型の学習アプローチ',
        description: '自分のペースで効率的に学習を進め、必要に応じて他者の知見も取り入れましょう。',
        tips: [
          '学習計画を立てて着実に実行する',
          '定期的に自己評価を行う',
          '効率的な学習リソースを活用する',
          '必要に応じて専門家に相談する'
        ],
        tools: [
          'Anki（単語学習）',
          'ReallyEnglish（オンライン学習）',
          'TOEIC Official（テスト対策）',
          'Kindle（英語書籍）'
        ]
      }
    },
    matcher: {
      type: 'matcher' as const,
      description: '人とのコミュニケーションを通じて学ぶことを好む学習者です。相手の反応を見ながら、実践的に英語を使うことで効果的に学習を進めることができます。',
      strengths: [
        '相手の反応から学べる',
        '実践的なコミュニケーションが得意',
        '自然な英語の習得が早い',
        '会話の流れに柔軟に対応できる'
      ],
      weaknesses: [
        '一人での学習が苦手',
        '文法や規則の体系的な理解が弱い',
        '人との交流がない環境では学習効率が下がる',
        '正確性よりも流暢性を重視しがち'
      ],
      learningAdvice: {
        title: 'コミュニケーション重視の学習アプローチ',
        description: '人との交流を通じて英語を学ぶことで、最も効果的に上達できます。',
        tips: [
          '英会話スクールやランゲージカフェに通う',
          'オンライン英会話を定期的に活用する',
          'グループ学習やディスカッションに参加する',
          '英語ネイティブとの交流機会を積極的に作る'
        ],
        tools: [
          'DMM英会話',
          'Cambly',
          'HelloTalk',
          'Meetup (英語イベント)'
        ]
      }
    },
    explorer: {
      type: 'explorer' as const,
      description: '好奇心旺盛で、様々な方法や教材を試しながら自分に合った学習スタイルを見つけていく学習者です。新しい学習方法や教材に積極的にチャレンジすることで、効果的な学習方法を発見できます。',
      strengths: [
        '新しい学習方法への適応力が高い',
        '多様な教材から学べる',
        '興味の範囲が広い',
        '自主的に学習リソースを見つけられる'
      ],
      weaknesses: [
        '一つの方法に集中しにくい',
        '基礎の定着に時間がかかることがある',
        '学習の継続性が課題になりやすい',
        '効果測定が難しい'
      ],
      learningAdvice: {
        title: '探索的な学習アプローチ',
        description: '様々な学習方法を試しながら、自分に最適な方法を見つけていきましょう。',
        tips: [
          '複数の学習アプリを併用する',
          '英語の動画や音楽、ゲームなど多様なメディアを活用する',
          '定期的に新しい学習方法を試す',
          '効果的だった方法を記録する'
        ],
        tools: [
          'Duolingo',
          'YouTube',
          'Netflix (英語学習モード)',
          'Spotify (Podcast)'
        ]
      }
    },
    challenger: {
      type: 'challenger' as const,
      description: '目標達成に向けて計画的に取り組む学習者です。明確な目標を設定し、それに向かって着実に進むことで、効率的に英語力を向上させることができます。',
      strengths: [
        '目標に向かって計画的に学習できる',
        '進捗管理が得意',
        '自己管理能力が高い',
        '効率的な学習が可能'
      ],
      weaknesses: [
        '柔軟性に欠けることがある',
        '予定通りに進まないと焦りやすい',
        '楽しみながら学ぶことが苦手',
        '完璧主義になりがち'
      ],
      learningAdvice: {
        title: '目標達成型の学習アプローチ',
        description: '明確な目標と計画を立て、着実に実行することで成果を上げていきましょう。',
        tips: [
          'SMART目標を設定する',
          '週間・月間の学習計画を立てる',
          '定期的に模試やテストで進捗を確認する',
          '学習記録をつける'
        ],
        tools: [
          'TOEIC Official Learning',
          'スタディサプリENGLISH',
          'Anki (単語学習)',
          'Forest (集中支援アプリ)'
        ]
      }
    },
    analyzer: {
      type: 'analyzer' as const,
      description: '論理的に言語を理解することを好む学習者です。文法規則や言語の構造を体系的に学ぶことで、確実に英語力を身につけることができます。',
      strengths: [
        '文法規則の理解が深い',
        '体系的な学習が得意',
        '正確な英語使用を心がける',
        '言語の仕組みを理解している'
      ],
      weaknesses: [
        '実践的な会話に時間がかかる',
        '完璧を求めすぎて発話をためらう',
        '直感的な言語使用が苦手',
        '文法にこだわりすぎる'
      ],
      learningAdvice: {
        title: '分析的な学習アプローチ',
        description: '言語の仕組みを理解しながら、段階的に英語力を向上させていきましょう。',
        tips: [
          '文法書で体系的に学ぶ',
          '英文解析を丁寧に行う',
          '英作文の添削を受ける',
          '言語学の知識を活用する'
        ],
        tools: [
          'Grammarly',
          '英辞郎 on the WEB',
          'Oxford English Grammar Course',
          'LingQ'
        ]
      }
    }
  } as const;

  return descriptions[type];
} 
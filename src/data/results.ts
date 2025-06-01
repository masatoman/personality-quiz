import { QuizResult } from '@/types/quiz';

interface LearningAdviceItem {
  title: string;
  tips: string[];
  tools: string[];
}

interface PersonalityResult {
  type: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  learningAdvice: LearningAdviceItem[];
}

export const results: Record<string, PersonalityResult> = {
  giver: {
    type: 'giver',
    description: '「共感型学習者」のあなたは、他者の成長をサポートしながら自身も成長することに喜びを感じるタイプです。共に学び合う環境で最も力を発揮します。',
    strengths: [
      '他者の学習ニーズを理解し、適切なサポートができる',
      '教えることで自身の理解も深まる',
      '学習コミュニティの活性化に貢献できる',
      '異なるレベルの学習者と効果的にコミュニケーションできる'
    ],
    weaknesses: [
      '他者のサポートに時間を取られ、自身の学習が疎かになることがある',
      '完璧を求めすぎて、必要以上に時間をかけてしまう',
      '他者の期待に応えようとしすぎる傾向がある'
    ],
    learningAdvice: [
      {
        title: '効果的な学習方法',
        tips: [
          '学習グループでメンター的な役割を担う',
          '教えることと学ぶことのバランスを意識する',
          '定期的に自身の学習目標の進捗を確認する'
        ],
        tools: [
          'オンライン学習コミュニティ',
          '言語交換アプリ',
          'グループ学習プログラム'
        ]
      },
      {
        title: 'おすすめの学習リソース',
        tips: [
          'オンライン学習コミュニティでの活動',
          '言語交換アプリでの相互学習',
          'グループ学習プログラムへの参加'
        ],
        tools: [
          'HelloTalk',
          'Tandem',
          'Discord学習サーバー'
        ]
      }
    ]
  },
  taker: {
    type: 'taker',
    description: '「没入型学習者」のあなたは、深い集中状態で学ぶことを好むタイプです。自己ペースでの学習を重視し、フロー状態に入りやすい特徴があります。',
    strengths: [
      '他者からのフィードバックを積極的に取り入れられる',
      'グループ学習での相乗効果を得られる',
      '多様な視点から学習できる',
      '学習コミュニティでの活発な交流が可能'
    ],
    weaknesses: [
      '一人での学習に苦手意識がある場合がある',
      '他者の意見に依存しすぎることがある',
      '自分独自の学習スタイルの確立が遅れることがある'
    ],
    learningAdvice: [
      {
        title: '効果的な学習方法',
        tips: [
          'オンライン英会話を定期的に活用する',
          '学習グループで積極的に意見交換する',
          '個人学習の時間も確保する'
        ],
        tools: [
          'ポモドーロタイマー',
          '集中用BGMアプリ',
          '学習進捗管理ツール'
        ]
      },
      {
        title: 'おすすめの学習リソース',
        tips: [
          'インタラクティブな学習アプリ',
          'オンライン英会話サービス',
          'グループディスカッション形式の授業'
        ],
        tools: [
          'Anki',
          'Forest',
          'Brain.fm'
        ]
      }
    ]
  },
  matcher: {
    type: 'matcher',
    description: '「適応型学習者」のあなたは、効率的な学習と他者との協調をバランスよく組み合わせることができるタイプです。柔軟な学習アプローチが特徴です。',
    strengths: [
      '状況に応じて学習スタイルを調整できる',
      '個人学習とグループ学習を効果的に組み合わせられる',
      '多様な学習方法に適応できる',
      '効率的な学習計画を立てられる'
    ],
    weaknesses: [
      '特定の学習スタイルの深掘りが不足することがある',
      '優先順位の設定に迷うことがある',
      '多様なアプローチにより焦点が定まりにくいことがある'
    ],
    learningAdvice: [
      {
        title: '効果的な学習方法',
        tips: [
          '目的に応じて学習方法を使い分ける',
          '定期的に学習方法の効果を検証する',
          '長期的な学習計画を立てる'
        ],
        tools: [
          'Trello',
          'Notion',
          'Evernote'
        ]
      },
      {
        title: 'おすすめの学習リソース',
        tips: [
          '総合的な学習プラットフォーム',
          'オンラインとオフラインを組み合わせた学習',
          '自己学習とグループ学習の併用'
        ],
        tools: [
          'Duolingo',
          'LingoDeer',
          'HelloTalk'
        ]
      }
    ]
  }
}; 
import React from 'react';
import { FaGift, FaHandHolding, FaExchangeAlt } from 'react-icons/fa';

// 詳細な診断データ
export const resultsData = {
  personality_types: {
    giver: {
      title: "思いやりのある学習者",
      short_title: "ギバー",
      color: "#4CAF50",
      icon: React.createElement(FaGift),
      description: "他者を助けることで学ぶことを好む学習者",
      extended_description: "ギバーは、他者を助けることで自身も成長する学習スタイルを持っています。教えることで理解が深まり、共有することで知識が定着します。",
      strengths: [
        "教えることで学習内容の理解が深まる",
        "他者との協力を通じて視野が広がる",
        "学習コミュニティへの貢献度が高い"
      ],
      weaknesses: [
        "自身の学習時間が不足しがちになる",
        "他者への過度な配慮で進度が遅くなる",
        "完璧主義的な傾向がある"
      ],
      learning_advice: {
        tips: [
          "教える時間と自習時間のバランスを取る",
          "学習グループでリーダーシップを発揮する",
          "オンラインフォーラムで質問に回答する"
        ],
        tools: [
          {
            name: "教育用ブログ",
            description: "学んだことを共有するプラットフォーム"
          },
          {
            name: "オンライン学習コミュニティ",
            description: "知識共有の場"
          }
        ]
      },
      scenarios: [
        {
          scenario: "新しい文法規則を学ぶ時",
          approach: "学習グループを作り、互いに教え合う",
          effectiveness_rate: 85
        },
        {
          scenario: "語彙を増やす時",
          approach: "単語カードを作成し、共有する",
          effectiveness_rate: 80
        }
      ]
    },
    taker: {
      title: "効率重視の学習者",
      short_title: "テイカー",
      color: "#2196F3",
      icon: React.createElement(FaHandHolding),
      description: "効率的な学習方法を追求する学習者",
      extended_description: "テイカーは、最短で目標を達成することを重視します。効率的な学習リソースを見つけ、集中的に学習を進めます。",
      strengths: [
        "時間を効率的に使用する",
        "目標達成への強い意志がある",
        "学習リソースを最大限活用する"
      ],
      weaknesses: [
        "他者との協力が少なくなりがち",
        "柔軟性に欠けることがある",
        "長期的な理解よりも短期的な成果を重視"
      ],
      learning_advice: {
        tips: [
          "グループ学習にも時間を割く",
          "長期的な学習計画を立てる",
          "他者のフィードバックを積極的に求める"
        ],
        tools: [
          {
            name: "学習管理アプリ",
            description: "進捗管理と目標設定"
          },
          {
            name: "オンライン学習プラットフォーム",
            description: "効率的な学習コンテンツ"
          }
        ]
      },
      scenarios: [
        {
          scenario: "新しい文法規則を学ぶ時",
          approach: "オンライン講座で集中的に学習",
          effectiveness_rate: 90
        },
        {
          scenario: "語彙を増やす時",
          approach: "フラッシュカードアプリを使用",
          effectiveness_rate: 85
        }
      ]
    },
    matcher: {
      title: "バランス重視の学習者",
      short_title: "マッチャー",
      color: "#FF9800",
      icon: React.createElement(FaExchangeAlt),
      description: "相互学習を重視する学習者",
      extended_description: "マッチャーは、与えることと得ることのバランスを重視します。協力的な学習環境で最も効果を発揮します。",
      strengths: [
        "バランスの取れた学習アプローチ",
        "協力的な学習環境での高いパフォーマンス",
        "長期的な学習関係の構築が得意"
      ],
      weaknesses: [
        "決断に時間がかかることがある",
        "過度な公平性の追求",
        "状況に応じた柔軟な対応が必要"
      ],
      learning_advice: {
        tips: [
          "学習パートナーを見つける",
          "相互学習の機会を作る",
          "フィードバックの交換を定期的に行う"
        ],
        tools: [
          {
            name: "言語交換アプリ",
            description: "相互学習のプラットフォーム"
          },
          {
            name: "グループ学習ツール",
            description: "協力学習の支援"
          }
        ]
      },
      scenarios: [
        {
          scenario: "新しい文法規則を学ぶ時",
          approach: "パートナーと交互に教え合う",
          effectiveness_rate: 80
        },
        {
          scenario: "語彙を増やす時",
          approach: "学習グループで単語ゲームを行う",
          effectiveness_rate: 75
        }
      ]
    }
  },
  type_combinations: {
    giver_taker: {
      title: "ギバー・テイカーの組み合わせ",
      description: "効率と思いやりのバランスを取る学習スタイル",
      tips: [
        "互いの長所を活かした学習計画を立てる",
        "定期的なフィードバック交換を行う",
        "共同プロジェクトで役割分担を明確にする"
      ]
    },
    giver_matcher: {
      title: "ギバー・マッチャーの組み合わせ",
      description: "協力的で相互支援的な学習スタイル",
      tips: [
        "学習リソースの共有を積極的に行う",
        "定期的な振り返りセッションを設ける",
        "グループ学習の機会を多く設ける"
      ]
    },
    taker_matcher: {
      title: "テイカー・マッチャーの組み合わせ",
      description: "効率と協力のバランスを重視する学習スタイル",
      tips: [
        "目標達成と相互支援のバランスを取る",
        "時間管理を重視しつつ協力も大切にする",
        "競争と協力の適切な配分を見つける"
      ]
    }
  }
};

export default resultsData;
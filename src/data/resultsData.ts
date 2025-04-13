import React from 'react';
import { FaUsers, FaBalanceScale, FaBook } from 'react-icons/fa';
import { ResultsData } from '@/types/quiz';

// 詳細な診断データ
export const resultsData: ResultsData = {
  personality_types: {
    "giver": {
      "title": "共感型学習者",
      "short_title": "共感型",
      "color": "#6246EA",
      "icon": <FaUsers size={60} className="text-blue-600 mx-auto mb-4" />,
      "description": "他者との関わりを通じて学ぶことに喜びを感じるタイプです。教えることで自身の理解も深まり、社会的な学習環境で最も力を発揮します。",
      "extended_description": "共感型学習者の詳細説明",
      "strengths": [
        "教えることで記憶の定着率が高い（プロテジェ効果）",
        "他者の理解度や状況に応じて説明を調整できる能力が高い",
        "社会的な学習環境でモチベーションが維持しやすい",
        "異なる視点からの知識を統合する能力が優れている"
      ],
      "weaknesses": [
        "完璧主義になりやすい（他者の期待に応えようとする）",
        "一人での学習時に集中力が途切れることがある",
        "他者の学習を優先し、自身の学習が疎かになりがち",
        "人前での失敗を過度に恐れる傾向がある"
      ],
      "learning_advice": {
        "tips": [
          "教えることを通じて学ぶ（ラーニング・バイ・ティーチング）",
          "学習グループやコミュニティでの活動を積慣的に行う",
          "知識を整理して人に説明できる形にまとめる習慣をつける",
          "自己学習の時間も確保し、バランスを取る"
        ],
        "tools": [
          { "name": "Anki", "description": "スペース型復習で効率的な暗記" },
          { "name": "Quizlet", "description": "他者と共有できるフラッシュカード" },
          { "name": "Discord", "description": "学習コミュニティでの交流" },
          { "name": "HelloTalk", "description": "言語交換アプリ" }
        ]
      },
      "scenarios": [
        {
          "scenario": "英語の新しい文法を学ぶとき",
          "approach": "その文法を使った例文を自分で作り、クラスメイトに説明してみる。質問に答えることで理解が深まる。",
          "effectiveness_rate": 85
        },
        {
          "scenario": "英単語を覚えるとき",
          "approach": "単語の意味を他の人に説明しながら覚える。アウトプットすることで記憶に定着しやすくなる。",
          "effectiveness_rate": 90
        }
      ]
    },
    "taker": {
      "title": "没入型学習者",
      "short_title": "没入型",
      "color": "#36B9CC",
      "icon": <FaBook size={60} className="text-cyan-600 mx-auto mb-4" />,
      "description": "深い集中状態で学ぶことを好むタイプです。自己ペースでの学習を重視し、フロー状態に入りやすい特徴があります。",
      "extended_description": "没入型学習者の詳細説明",
      "strengths": [
        "集中力が高く、フロー状態に入りやすい",
        "自分のペースで学習を進められる",
        "深い理解と知識の定着に優れている",
        "自己主導型の学習スタイルが確立している"
      ],
      "weaknesses": [
        "他者からのフィードバックを受けにくい",
        "視野が狭くなりがちで、異なる視点を見落とすことがある",
        "実践的なコミュニケーションスキルの向上が遅れることがある",
        "学習の偏りが生じやすい"
      ],
      "learning_advice": {
        "tips": [
          "ポモドーロ・テクニックで集中と休憩のリズムを作る",
          "定期的に学習内容をアウトプットする機会を設ける",
          "学習環境の整備に気を配る（音、光、温度など）",
          "自分の理解度を客観的に確認するためのテストを活用する"
        ],
        "tools": [
          { "name": "Forest", "description": "集中力を高めるタイマーアプリ" },
          { "name": "Brain.fm", "description": "集中のための音楽" },
          { "name": "Notion", "description": "個人の学習ノート作成" },
          { "name": "Kindle", "description": "電子書籍で場所を選ばず学習" }
        ]
      },
      "scenarios": [
        {
          "scenario": "英語の新しい文法を学ぶとき",
          "approach": "文法書で体系的に学んだ後、練習問題を解いて理解を確認。疑問点は自分で調べて解決する。",
          "effectiveness_rate": 87
        },
        {
          "scenario": "英単語を覚えるとき",
          "approach": "単語帳アプリを使って自分のペースで繰り返し練習する。関連する単語をグループ化して記憶する。",
          "effectiveness_rate": 92
        }
      ]
    },
    "matcher": {
      "title": "バランス型学習者",
      "short_title": "バランス型",
      "color": "#4CAF50",
      "icon": <FaBalanceScale size={60} className="text-green-600 mx-auto mb-4" />,
      "description": "柔軟な学習スタイルを持ち、状況に応じて適応するタイプです。多様な学習方法を取り入れ、バランスの取れた成長を遂げます。",
      "extended_description": "バランス型学習者の詳細説明",
      "strengths": [
        "様々な学習状況に適応できる柔軟性",
        "多様な視点から学習内容を理解できる",
        "グループ学習と個人学習を効果的に組み合わせられる",
        "実践的なコミュニケーションと深い理解をバランスよく獲得できる"
      ],
      "weaknesses": [
        "特定の分野で専門性を深めるのに時間がかかることがある",
        "あまりに多様なアプローチを試みて焦点が定まらないことがある",
        "最適な学習方法の選択に迷うことがある",
        "特定の学習スタイルへの深い理解が不足することがある"
      ],
      "learning_advice": {
        "tips": [
          "多様な学習リソースを組み合わせる",
          "学習目的に応じて適切な学習方法を選択する",
          "定期的に学習方法の効果を振り返り、調整する",
          "個人学習とグループ学習のバランスを意識する"
        ],
        "tools": [
          { "name": "Notion", "description": "多様なフォーマットで学習管理" },
          { "name": "Duolingo", "description": "ゲーム形式で楽しく学習" },
          { "name": "YouTube", "description": "様々な解説動画で理解を深める" },
          { "name": "Evernote", "description": "様々な形式のノートを整理" }
        ]
      },
      "scenarios": [
        {
          "scenario": "英語の新しい文法を学ぶとき",
          "approach": "オンライン動画で概要を理解し、友人とのディスカッションで実践。その後、個人学習で定着を図る。",
          "effectiveness_rate": 83
        },
        {
          "scenario": "英単語を覚えるとき",
          "approach": "アプリでの学習と実際の会話での使用を組み合わせる。様々なコンテキストで単語を使うことで記憶を強化。",
          "effectiveness_rate": 88
        }
      ]
    }
  },
  type_combinations: {
    giver_taker: {
      title: "教える没入型",
      description: "深い理解と知識共有のバランスが取れたタイプ",
      tips: [
        "個人学習の成果を定期的に他者と共有する",
        "集中学習の後に教えることで理解を深める",
        "他者に教えることで自分の知識の穴を発見する"
      ]
    },
    giver_matcher: {
      title: "柔軟な教え手",
      description: "状況に応じて教えることと学ぶことを切り替えられるタイプ",
      tips: [
        "グループ学習とソロ学習のバランスを意識する",
        "異なる学習スタイルの人々と積慣的に交流する",
        "様々な教え方を試して自分のレパートリーを広げる"
      ]
    },
    taker_matcher: {
      title: "適応する深掘り型",
      description: "状況に応じて集中学習と相互学習を使い分けるタイプ",
      tips: [
        "深い集中の後に学びを共有する習慣をつける",
        "社会的学習と個人学習の適切な切り替えを意識する",
        "自分の理解度に応じて学習方法を柔軟に変更する"
      ]
    }
  }
};
import { Question } from '@/types/quiz';

export const questions: Question[] = [
  {
    id: 1,
    text: '英語の勉強会で、あなたはどのように参加しますか？',
    options: [
      {
        text: '他の参加者の学習をサポートしながら自分も学ぶ',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分の学習に集中して、効率よく進める',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: 'お互いに教え合いながら進める',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 2,
    text: '英語の新しい文法を学んだとき、あなたはどうしますか？',
    options: [
      {
        text: 'クラスメイトに積極的に教えて、みんなで理解を深める',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分の理解を完璧にすることに集中する',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: '分からない人がいれば教え、自分も教えてもらう',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 3,
    text: 'オンライン英会話で会話相手と話す時、あなたはどうしますか？',
    options: [
      {
        text: '相手の話をよく聞いて、会話を盛り上げる',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分の言いたいことを正確に伝えることに集中する',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: '会話のバランスを意識しながら交流する',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 4,
    text: '英語の課題で分からないところがあったとき、どうしますか？',
    options: [
      {
        text: '友達と一緒に考えて、お互いの理解を深める',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分で解決方法を見つけて進める',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: '助け合いながら、でも自主性も大切にする',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 5,
    text: '英語の発音練習をする時、あなたはどうしますか？',
    options: [
      {
        text: 'グループで練習して、お互いにアドバイスし合う',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '一人で集中して練習する',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: 'ペアで練習して、フィードバックを交換する',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 6,
    text: '英語の単語テストの準備をする時、どのように取り組みますか？',
    options: [
      {
        text: 'クラスメイトと一緒に勉強会を開く',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分のペースで効率的に暗記する',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: '時々友達とクイズを出し合って確認する',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 7,
    text: '英語のプレゼンテーションの準備で、あなたは何を重視しますか？',
    options: [
      {
        text: '聴衆が理解しやすい内容にすることを最優先する',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分の英語力をアピールする機会として活用する',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: '内容と表現のバランスを考えて準備する',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 8,
    text: '英語の教材や参考書を見つけたとき、あなたはどうしますか？',
    options: [
      {
        text: '友達にも教えて、みんなで共有する',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分の学習に活用することを考える',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: '必要な人と共有しながら使う',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 9,
    text: '英語の学習目標を設定する時、あなたはどう考えますか？',
    options: [
      {
        text: 'クラス全体のレベルアップを意識して設定する',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分の目標達成を最優先に考える',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: '個人の目標とクラスの目標のバランスを考える',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 10,
    text: '英語学習でつまずいている人を見かけたとき、あなたはどうしますか？',
    options: [
      {
        text: '積極的にサポートして、一緒に解決方法を考える',
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: '自分の学習に影響しない範囲でアドバイスする',
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: 'お互いに助け合える関係を築く',
        score: { giver: 1, taker: 1, matcher: 3 }
      }
    ]
  }
]; 
import { QuizQuestion } from '@/types/quiz';

export const metadata = {
  version: "1.2.0",
  last_updated: "2024-04-09",
  scoring: {
    max_score: 3,
    min_score: 0
  },
  ui_config: {
    types: {
      contributor: {
        name: "コントリビューター型",
        short_name: "コントリビューター",
        color: "#6246EA",
        icon: "users"
      },
      explorer: {
        name: "エクスプローラー型",
        short_name: "エクスプローラー",
        color: "#36B9CC",
        icon: "user-focus"
      },
      collaborator: {
        name: "コラボレーター型",
        short_name: "コラボレーター",
        color: "#4CAF50",
        icon: "shuffle"
      }
    }
  }
};

export const questions: QuizQuestion[] = [
  {
    id: 1,
    category: "単語学習について",
    text: "英語の授業で新しい単語を覚えるとき、どの方法が最も自然に感じますか？",
    options: [
      {
        text: "単語の意味を他の人に説明しながら覚える",
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: "自分だけのオリジナルの例文を作って覚える",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "友達と例文を出し合って覚える",
        score: { giver: 2, taker: 1, matcher: 3 }
      },
      {
        text: "単語帳アプリを使って繰り返し練習する",
        score: { giver: 1, taker: 2, matcher: 2 }
      }
    ]
  },
  {
    id: 2,
    category: "学習サポートについて",
    text: "休み時間、クラスメイトが英語の宿題で困っているのを見かけました。その時あなたは？",
    options: [
      {
        text: "「一緒にやろう！」と声をかけて教える",
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: "自分の勉強を優先して、後で時間があれば教える",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "分かる部分だけ簡単にアドバイスする",
        score: { giver: 1, taker: 2, matcher: 2 }
      },
      {
        text: "友達も誘って一緒に問題解決する",
        score: { giver: 2, taker: 0, matcher: 3 }
      }
    ]
  },
  {
    id: 3,
    category: "英語の視聴学習について",
    text: "英語の映画を見るとき、どの視聴方法が最も効果的だと思いますか？",
    options: [
      {
        text: "友達と一緒に見て、セリフの意味を教え合う",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "一人で英語字幕付きで集中して見る",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "最初は日本語字幕で、次に英語字幕で見直す",
        score: { giver: 1, taker: 2, matcher: 3 }
      },
      {
        text: "英語学習コミュニティで映画の感想を英語でシェアする",
        score: { giver: 2, taker: 1, matcher: 2 }
      }
    ]
  },
  {
    id: 4,
    category: "知識共有について",
    text: "英語の教科書に載っていない表現を見つけたとき、あなたは？",
    options: [
      {
        text: "クラスのグループチャットや友達にシェアする",
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: "自分のノートに書き留めて後で使えるようにする",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "先生に確認してから友達と使ってみる",
        score: { giver: 2, taker: 1, matcher: 3 }
      },
      {
        text: "オンライン辞書で詳しい使い方を調べる",
        score: { giver: 1, taker: 2, matcher: 2 }
      }
    ]
  },
  {
    id: 5,
    category: "文法学習について",
    text: "英語の授業で難しい文法が出てきました。あなたならどうする？",
    options: [
      {
        text: "グループ学習を提案して、みんなで理解を深める",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "自分で問題を解いて理解を確かめる",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "分からないところを友達と確認し合う",
        score: { giver: 2, taker: 1, matcher: 3 }
      },
      {
        text: "オンラインの文法解説動画で学習する",
        score: { giver: 1, taker: 2, matcher: 2 }
      }
    ]
  },
  {
    id: 6,
    category: "学習アプリについて",
    text: "スマートフォンで英語学習アプリを使うなら、どの機能が最も魅力的ですか？",
    options: [
      {
        text: "他のユーザーと交流できる学習コミュニティ機能",
        score: { giver: 3, taker: 0, matcher: 1 }
      },
      {
        text: "自分のペースで進められる個人学習プラン",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "友達と成績を競い合えるランキング機能",
        score: { giver: 2, taker: 1, matcher: 3 }
      },
      {
        text: "AIによる個別フィードバック機能",
        score: { giver: 1, taker: 2, matcher: 2 }
      }
    ]
  },
  {
    id: 7,
    category: "リスニング学習について",
    text: "英語の歌を聴くとき、どんな聴き方をしますか？",
    options: [
      {
        text: "友達と一緒にカラオケで歌って発音を確認し合う",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "一人でヘッドフォンをして歌詞の意味を考えながら聴く",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "気に入ったフレーズを友達とシェアしながら聴く",
        score: { giver: 2, taker: 1, matcher: 3 }
      },
      {
        text: "歌詞を書き写して、分からない単語を調べながら聴く",
        score: { giver: 1, taker: 2, matcher: 2 }
      }
    ]
  },
  {
    id: 8,
    category: "ライティング学習について",
    text: "英語でメッセージを書くとき、どんな方法を取りますか？",
    options: [
      {
        text: "友達と添削し合いながら書く",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "辞書やオンラインツールを使って一人で丁寧に書く",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "AIツールで下書きを作り、自分で修正する",
        score: { giver: 1, taker: 2, matcher: 2 }
      },
      {
        text: "ネイティブスピーカーの友達に確認してもらう",
        score: { giver: 2, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 9,
    category: "モチベーション管理について",
    text: "英語の資格試験の勉強中、モチベーションが下がってきました。どうしますか？",
    options: [
      {
        text: "同じ試験を受ける友達を誘って励まし合いながら勉強する",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "目標を再確認し、自分だけの勉強計画を立て直す",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "オンライン勉強会に参加して刺激をもらう",
        score: { giver: 2, taker: 1, matcher: 3 }
      },
      {
        text: "短期的な小さな目標を設定し直して取り組む",
        score: { giver: 1, taker: 2, matcher: 2 }
      }
    ]
  },
  {
    id: 10,
    category: "発音学習について",
    text: "英語の発音で自信がないフレーズがあります。どうしますか？",
    options: [
      {
        text: "ネイティブの友達や先生に直接聞いて練習する",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "発音アプリで何度も確認して一人で練習する",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "オンライン英会話で講師に確認する",
        score: { giver: 1, taker: 2, matcher: 2 }
      },
      {
        text: "YouTube動画を見てから友達と発音し合う",
        score: { giver: 2, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 11,
    category: "読解力向上について",
    text: "英語の長文を読むとき、どのように理解を深めていますか？",
    options: [
      {
        text: "読書クラブに参加して、内容について議論する",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "一人で辞書を引きながら丁寧に読み込む",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "分からない部分をオンラインフォーラムで質問する",
        score: { giver: 2, taker: 1, matcher: 2 }
      },
      {
        text: "最初に概要をつかみ、必要な部分を詳しく読む",
        score: { giver: 1, taker: 2, matcher: 3 }
      }
    ]
  },
  {
    id: 12,
    category: "スピーキング練習について",
    text: "英語でプレゼンテーションをする機会があります。どう準備しますか？",
    options: [
      {
        text: "友達に聞いてもらいフィードバックをもらう",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "一人で何度も練習して完璧にする",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "録画して自分のパフォーマンスを確認する",
        score: { giver: 1, taker: 2, matcher: 2 }
      },
      {
        text: "少人数グループで練習し合う",
        score: { giver: 2, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 13,
    category: "表現力向上について",
    text: "英語の新しい表現や言い回しを学ぶなら、どの方法が効果的だと思いますか？",
    options: [
      {
        text: "ネイティブスピーカーとの会話で実際に使ってみる",
        score: { giver: 3, taker: 1, matcher: 2 }
      },
      {
        text: "映画やドラマのセリフを研究する",
        score: { giver: 1, taker: 3, matcher: 1 }
      },
      {
        text: "英語のポッドキャストを聴いて真似してみる",
        score: { giver: 1, taker: 2, matcher: 2 }
      },
      {
        text: "言語交換アプリで外国人と交流する",
        score: { giver: 2, taker: 0, matcher: 3 }
      }
    ]
  },
  {
    id: 14,
    category: "学習の失敗対応について",
    text: "英語学習で失敗したとき、どのように対処しますか？",
    options: [
      {
        text: "友達や先生に相談して解決策を考える",
        score: { giver: 3, taker: 0, matcher: 2 }
      },
      {
        text: "自分で原因を分析し、新しい学習法を試す",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "オンラインで同じ悩みを持つ人の解決策を探す",
        score: { giver: 1, taker: 2, matcher: 2 }
      },
      {
        text: "少し休んでからアプローチを変えて再挑戦する",
        score: { giver: 2, taker: 1, matcher: 3 }
      }
    ]
  },
  {
    id: 15,
    category: "コミュニケーション力向上について",
    text: "英語でのコミュニケーションに自信をつけるには、どの方法が最適だと思いますか？",
    options: [
      {
        text: "国際交流イベントに積極的に参加する",
        score: { giver: 3, taker: 1, matcher: 2 }
      },
      {
        text: "英語の動画を見て話し方を研究する",
        score: { giver: 0, taker: 3, matcher: 1 }
      },
      {
        text: "少人数の英会話クラスに参加する",
        score: { giver: 2, taker: 1, matcher: 3 }
      },
      {
        text: "スピーキングアプリで毎日練習する",
        score: { giver: 1, taker: 2, matcher: 2 }
      }
    ]
  }
]; 
import { Material, Section, QuizQuestion } from '@/types/material';

// 教材データを取得する関数
export async function getMaterial(id: string): Promise<Material> {
  // 実際のアプリでは、APIからデータを取得
  // const res = await fetch(`${process.env.API_URL}/api/materials/${id}`);
  // const data = await res.json();
  // return data;
  
  // モックデータを返す
  return {
    id,
    title: '英語初心者のための基礎文法',
    description: '英語の基本文法を初心者にもわかりやすく解説した教材です。本教材では、英語の文型、時制、助動詞、冠詞などの基礎的な文法項目をわかりやすく解説しています。各セクションには練習問題も用意されていますので、学習した内容を確認しながら進めることができます。',
    isPublic: true,
    allowComments: true,
    estimatedTime: 30,
    difficulty: 'beginner',
    targetAudience: ['英語初心者', '英語の基礎を復習したい方', 'TOEIC受験予定の方'],
    prerequisites: 'アルファベットが読める、基本的な単語を知っている',
    author: {
      id: 'author1',
      name: 'Tanaka Yuki',
      avatarUrl: '/images/author1.jpg'
    },
    createdAt: '2023-12-15T12:00:00Z',
    updatedAt: '2023-12-20T15:30:00Z',
    sections: [
      {
        id: 's1',
        type: 'text',
        title: '英語の文型（基本的な5文型）',
        content: `
          <h3>第1文型: S + V（主語 + 動詞）</h3>
          <p>例文: Birds fly.（鳥は飛ぶ）</p>
          <p>説明: 主語と自動詞だけで意味が完結する最も基本的な文型です。</p>
          
          <h3>第2文型: S + V + C（主語 + 動詞 + 補語）</h3>
          <p>例文: She became a teacher.（彼女は教師になった）</p>
          <p>説明: 主語と「be動詞」や「become」などの動詞に補語を伴う文型です。</p>
          
          <h3>第3文型: S + V + O（主語 + 動詞 + 目的語）</h3>
          <p>例文: I read a book.（私は本を読む）</p>
          <p>説明: 主語が他動詞を通して目的語に対して動作を行う文型です。</p>
          
          <h3>第4文型: S + V + O + O（主語 + 動詞 + 間接目的語 + 直接目的語）</h3>
          <p>例文: She gave me a present.（彼女は私にプレゼントをくれた）</p>
          <p>説明: 2つの目的語を取る文型で、通常「人」と「物」を表します。</p>
          
          <h3>第5文型: S + V + O + C（主語 + 動詞 + 目的語 + 補語）</h3>
          <p>例文: They named their baby Emma.（彼らは赤ちゃんをEmmaと名付けた）</p>
          <p>説明: 目的語とその補語を含む文型です。目的語と補語の関係が重要です。</p>
        `
      },
      {
        id: 's2',
        type: 'text',
        title: '時制の基本（現在・過去・未来）',
        content: `
          <h3>現在形</h3>
          <p>使用例: I study English every day.（私は毎日英語を勉強します）</p>
          <p>使い方: 習慣的な行動や一般的な事実を表現する時に使用します。</p>
          
          <h3>現在進行形</h3>
          <p>使用例: I am studying English now.（私は今英語を勉強しています）</p>
          <p>使い方: 現在進行中の行動を表現する時に使用します。</p>
          
          <h3>過去形</h3>
          <p>使用例: I studied English yesterday.（私は昨日英語を勉強しました）</p>
          <p>使い方: 過去のある時点で完了した行動を表現する時に使用します。</p>
          
          <h3>過去進行形</h3>
          <p>使用例: I was studying English at 7 pm yesterday.（私は昨日午後7時に英語を勉強していました）</p>
          <p>使い方: 過去のある時点で進行中だった行動を表現する時に使用します。</p>
          
          <h3>未来形</h3>
          <p>使用例: I will study English tomorrow.（私は明日英語を勉強します）</p>
          <p>使い方: 未来の行動や予定について表現する時に使用します。</p>
          
          <h3>未来進行形</h3>
          <p>使用例: I will be studying English at this time tomorrow.（私は明日の今頃英語を勉強しているでしょう）</p>
          <p>使い方: 未来のある時点で進行中になっているだろう行動を表現する時に使用します。</p>
        `
      },
      {
        id: 's3',
        type: 'image',
        title: '動詞の活用表（規則・不規則）',
        imageUrl: '/images/verb-conjugation.jpg',
        description: '一般的な動詞の活用をまとめた表です。左側が規則変化、右側が不規則変化の例を示しています。'
      },
      {
        id: 's4',
        type: 'quiz',
        title: '確認クイズ: 基本文法',
        questions: [
          {
            id: 'q1',
            question: '次の文は何文型か？ "She gave him a book."',
            options: [
              { id: 'a', text: '第1文型 (S+V)' },
              { id: 'b', text: '第2文型 (S+V+C)' },
              { id: 'c', text: '第3文型 (S+V+O)' },
              { id: 'd', text: '第4文型 (S+V+O+O)' },
              { id: 'e', text: '第5文型 (S+V+O+C)' }
            ],
            correctAnswer: 'd',
            explanation: 'この文は「彼女は彼に本をあげた」という意味で、主語(She)、動詞(gave)、間接目的語(him)、直接目的語(a book)から構成されています。よって第4文型です。'
          },
          {
            id: 'q2',
            question: '過去進行形の正しい形はどれか？',
            options: [
              { id: 'a', text: 'I studying.' },
              { id: 'b', text: 'I study.' },
              { id: 'c', text: 'I was studying.' },
              { id: 'd', text: 'I will studying.' }
            ],
            correctAnswer: 'c',
            explanation: '過去進行形は was/were + 動詞ing の形です。主語が I なので was を使用します。'
          },
          {
            id: 'q3',
            question: '次の文の空所に当てはまる適切な動詞は？ "He _______ a teacher for ten years."',
            options: [
              { id: 'a', text: 'is' },
              { id: 'b', text: 'was' },
              { id: 'c', text: 'has been' },
              { id: 'd', text: 'will be' }
            ],
            correctAnswer: 'c',
            explanation: 'この文は現在完了形を使用します。「彼は10年間教師をしている」という、過去から現在まで続いている状態を表現しているため、has been が正解です。'
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r1',
        userId: 'user1',
        userName: 'Sato Kenji',
        userAvatarUrl: '/images/user1.jpg',
        rating: 5,
        comment: 'とても分かりやすい説明で、基礎文法が理解しやすかったです。特に5文型の説明がシンプルで良かったです。',
        createdAt: '2023-12-18T10:30:00Z'
      },
      {
        id: 'r2',
        userId: 'user2',
        userName: 'Yamamoto Haruka',
        userAvatarUrl: '/images/user2.jpg',
        rating: 4,
        comment: '初心者向けの内容で、基礎をしっかり学び直すことができました。もう少し練習問題が多いとさらに良いと思います。',
        createdAt: '2023-12-16T15:45:00Z'
      }
    ],
    relatedMaterials: [
      {
        id: '2',
        title: '実践ビジネス英語：メール作成テクニック',
        difficulty: 'intermediate',
        estimatedTime: 45,
        rating: 4.2,
        reviewCount: 8
      },
      {
        id: '3',
        title: 'TOEICリスニング対策クイズ',
        difficulty: 'intermediate',
        estimatedTime: 60,
        rating: 4.7,
        reviewCount: 12
      }
    ]
  };
}

// 教材の一覧を取得する関数
export async function getMaterials(options?: {
  category?: string;
  difficulty?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<Material[]> {
  // 実際のアプリでは、APIからデータを取得
  // const queryParams = new URLSearchParams();
  // if (options?.category) queryParams.append('category', options.category);
  // if (options?.difficulty) queryParams.append('difficulty', options.difficulty);
  // if (options?.sort) queryParams.append('sort', options.sort);
  // if (options?.page) queryParams.append('page', options.page.toString());
  // if (options?.limit) queryParams.append('limit', options.limit.toString());
  
  // const res = await fetch(`${process.env.API_URL}/api/materials?${queryParams}`);
  // const data = await res.json();
  // return data;
  
  // モックデータを返す（実際はもっと多くの教材が返される）
  return [
    await getMaterial('1'),
    await getMaterial('2'),
    await getMaterial('3')
  ];
} 
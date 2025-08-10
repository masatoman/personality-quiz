'use client';

import React from 'react';
import { FaHeart, FaRegHeart, FaUser, FaReply } from 'react-icons/fa';
import Image from 'next/image';

// モックデータを使ったコメント表示テスト用コンポーネント
const MockCommentData: React.FC = () => {
  const mockComments = [
    {
      id: '1',
      user_id: 'user1',
      comment_text: '現在進行形のコツは、動作が「今まさに進行中」であることを意識することです！例えば「I am studying English now.」は、まさに今この瞬間に英語を勉強していることを表します。日本語では時制があいまいになりがちですが、英語では明確に区別する必要がありますね。',
      helpful_count: 8,
      created_at: '2025-01-31T06:00:00Z',
      depth: 0,
      parent_comment_id: null,
      profiles: {
        username: 'english_lover',
        display_name: '英語学習者A',
        avatar_url: '/avatars/giver.png'
      },
      users: {
        personality_type: 'giver',
        giver_score: 150
      },
      user_helpful_vote: false,
      reply_count: 1
    },
    {
      id: '2',
      user_id: 'user2', 
      comment_text: 'この問題でつまずいていました！特に「yesterday」があるのに現在進行形を使ってしまう間違いをよくしていました。過去の出来事は必ず過去形で表現する、という基本を改めて確認できました。とても勉強になります！',
      helpful_count: 3,
      created_at: '2025-01-31T07:30:00Z',
      depth: 0,
      parent_comment_id: null,
      profiles: {
        username: 'grammar_student',
        display_name: '文法マスター',
        avatar_url: '/avatars/matcher.png'
      },
      users: {
        personality_type: 'matcher',
        giver_score: 85
      },
      user_helpful_vote: true,
      reply_count: 0
    },
    {
      id: '3',
      user_id: 'user3',
      comment_text: 'その通りですね！私も最初は時制が曖昧でしたが、「今している動作」というイメージを持つようにしてから理解が深まりました。特にリアルタイムで起こっていることを表現するときのfeelが分かるようになりました。',
      helpful_count: 2,
      created_at: '2025-01-31T07:00:00Z',
      depth: 1,
      parent_comment_id: '1',
      profiles: {
        username: 'real_time_learner',
        display_name: 'リアルタイム学習者',
        avatar_url: '/avatars/default.png'
      },
      users: {
        personality_type: 'giver',
        giver_score: 120
      },
      user_helpful_vote: false,
      reply_count: 0
    },
    {
      id: '4',
      user_id: 'user4',
      comment_text: '覚え方のコツをシェアします！過去形は「〜した」、現在進行形は「〜している」と日本語に直してみると分かりやすいです。また、時を表す副詞（yesterday, now, usually など）に注目すると正解率が上がりますよ！',
      helpful_count: 5,
      created_at: '2025-01-31T07:15:00Z',
      depth: 0,
      parent_comment_id: null,
      profiles: {
        username: 'tip_master',
        display_name: 'コツ伝授者',
        avatar_url: '/avatars/taker.png'
      },
      users: {
        personality_type: 'giver',
        giver_score: 200
      },
      user_helpful_vote: false,
      reply_count: 0
    }
  ];

  const getPersonalityBadge = (type: string) => {
    switch (type) {
      case 'giver': return { label: 'ギバー', color: 'bg-green-100 text-green-800' };
      case 'matcher': return { label: 'マッチャー', color: 'bg-blue-100 text-blue-800' };
      case 'taker': return { label: 'テイカー', color: 'bg-orange-100 text-orange-800' };
      default: return { label: 'ユーザー', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const CommentItem: React.FC<{ comment: any; depth?: number }> = ({ comment, depth = 0 }) => {
    const badge = getPersonalityBadge(comment.users.personality_type);
    
    return (
      <div className={`border-l-2 border-gray-200 pl-4 mb-4 ${depth > 0 ? 'ml-6' : ''}`}>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          {/* ユーザー情報 */}
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 overflow-hidden">
              {comment.profiles.avatar_url ? (
                <Image
                  src={comment.profiles.avatar_url}
                  alt={comment.profiles.display_name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <FaUser className="text-gray-600 text-lg" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{comment.profiles.display_name}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-xs text-green-600 font-medium">
                  ギバースコア: {comment.users.giver_score}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* コメント内容 */}
          <div className="mb-3">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{comment.comment_text}</p>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-4 text-sm">
            {/* ハートボタン */}
            <button
              className={`flex items-center gap-1 px-3 py-2 rounded-full transition-colors group relative
                ${comment.user_helpful_vote 
                  ? 'bg-red-100 text-red-600 border border-red-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200'
                }`}
              title="このコメントが役立ったらハートを押してください！投稿者に5ポイントが贈られます"
            >
              {comment.user_helpful_vote ? <FaHeart /> : <FaRegHeart />}
              <span className="font-medium">{comment.helpful_count}</span>
              {!comment.user_helpful_vote && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  役立った！(+5pt)
                </span>
              )}
            </button>

            {/* 返信ボタン */}
            {depth < 2 && (
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors group relative border border-blue-200"
                title="返信してさらに議論を深めましょう！返信投稿で10ポイント獲得"
              >
                <FaReply />
                <span className="font-medium">返信</span>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  返信(+10pt)
                </span>
              </button>
            )}

            {/* 返信数表示 */}
            {comment.reply_count > 0 && (
              <span className="text-gray-500 text-xs">
                {comment.reply_count}件の返信
              </span>
            )}
          </div>
        </div>

        {/* 返信コメント表示 */}
        {comment.id === '1' && (
          <CommentItem 
            key="3" 
            comment={mockComments.find(c => c.id === '3')!} 
            depth={depth + 1} 
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">💬 コメント・気づき ({mockComments.filter(c => c.depth === 0).length})</h3>
        
        {/* ソート切り替え */}
        <select className="border border-gray-300 rounded-lg px-3 py-1">
          <option value="helpful_count">❤️ 役立った順</option>
          <option value="created_at">🕒 新しい順</option>
        </select>
      </div>

      {/* 新規コメント投稿フォーム */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <h4 className="font-bold text-gray-800 mb-2">💡 あなたの気づきを共有しませんか？</h4>
        <p className="text-sm text-gray-600 mb-2">
          学習中の発見、つまずいたポイント、コツなど、どんな小さなことでも大丈夫です！
        </p>
        <div className="flex items-center gap-4 mb-3 p-2 bg-white rounded-lg border border-green-200">
          <div className="flex items-center gap-1 text-green-600">
            <span className="text-lg">🎁</span>
            <span className="font-semibold text-sm">コメント投稿で15ポイント獲得！</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <span className="text-lg">❤️</span>
            <span className="font-semibold text-sm">ハートをもらうと+5ポイント！</span>
          </div>
        </div>
        <textarea
          placeholder="例：「この文法のポイントは...」「私はこう覚えました」「ここでつまずきました」"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          rows={4}
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">0/2000文字</span>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700">
            ✨ 気づきを共有
          </button>
        </div>
      </div>

      {/* コメント一覧 */}
      <div className="space-y-4">
        {mockComments
          .filter(comment => comment.depth === 0)
          .sort((a, b) => b.helpful_count - a.helpful_count)
          .map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
      </div>

      {/* 学習効果を示すバナー */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🚀</span>
          <h4 className="font-bold text-purple-800">「教えることで学ぶ」効果を実感！</h4>
        </div>
        <p className="text-sm text-purple-700">
          コメント投稿により知識が定着し、他の学習者の気づきから新しい学びを得られます。
          積極的な気づき共有でギバーポイントも獲得しましょう！
        </p>
      </div>
    </div>
  );
};

export default MockCommentData;

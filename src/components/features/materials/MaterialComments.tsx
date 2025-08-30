'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaHeart, FaRegHeart, FaUser, FaReply } from 'react-icons/fa';
import Image from 'next/image';

interface Comment {
  id: string;
  user_id: string;
  comment_text: string;
  helpful_count: number;
  created_at: string;
  depth: number;
  parent_comment_id?: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
  user_voted?: boolean;
  user_helpful_vote?: boolean;
}

interface MaterialCommentsProps {
  materialId: string;
  className?: string;
}

const MaterialComments: React.FC<MaterialCommentsProps> = ({ materialId, className = '' }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'helpful_count'>('helpful_count');
  const [submitting, setSubmitting] = useState(false);

  // コメント取得
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/materials/${materialId}/comments?sort=${sortBy}&order=desc`
      );
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('コメント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [materialId, sortBy]);

  // コメント投稿
  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/materials/${materialId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_comment_id: replyTo,
          comment_text: newComment
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        setReplyTo(null);
        fetchComments(); // リロード
      } else {
        alert('コメントの投稿に失敗しました');
      }
    } catch (error) {
      console.error('コメント投稿エラー:', error);
      alert('コメントの投稿中にエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  // ハート投票
  const voteHelpful = async (commentId: string, isHelpful: boolean) => {
    try {
      const response = await fetch(`/api/materials/${materialId}/comments/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment_id: commentId,
          is_helpful: isHelpful
        })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchComments(); // リロード
      }
    } catch (error) {
      console.error('投票エラー:', error);
    }
  };

  useEffect(() => {
    if (materialId) {
      fetchComments();
    }
  }, [materialId, fetchComments]);

  const CommentItem: React.FC<{ comment: Comment; depth?: number }> = ({ comment, depth = 0 }) => (
    <div className={`border-l-2 border-gray-200 pl-3 sm:pl-4 mb-3 sm:mb-4 ${depth > 0 ? 'ml-4 sm:ml-6' : ''}`}>
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
        {/* ユーザー情報 */}
        <div className="flex items-start mb-2 sm:mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            {comment.profiles.avatar_url ? (
              <Image
                src={comment.profiles.avatar_url}
                alt={comment.profiles.display_name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <FaUser className="text-gray-600 text-sm" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">{comment.profiles.display_name}</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                ギバー
              </span>
              <span className="text-xs text-gray-500">
                ギバースコア: {comment.profiles.giver_score || 0}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              {new Date(comment.created_at).toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* コメント内容 */}
        <div className="mb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{comment.comment_text}</p>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          {/* ハートボタン */}
          <button
            onClick={() => voteHelpful(comment.id, true)}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full transition-colors group relative
              ${comment.user_helpful_vote 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            title="このコメントが役立ったらハートを押してください！投稿者に5ポイントが贈られます"
          >
            {comment.user_helpful_vote ? <FaHeart /> : <FaRegHeart />}
            <span>{comment.helpful_count}</span>
            {!comment.user_helpful_vote && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                役立った！(+5pt)
              </span>
            )}
          </button>

          {/* 返信ボタン */}
          {depth < 2 && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors group relative"
              title="返信してさらに議論を深めましょう！返信投稿で10ポイント獲得"
            >
              <FaReply />
              <span>返信</span>
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                返信(+10pt)
              </span>
            </button>
          )}
        </div>

        {/* 返信フォーム */}
        {replyTo === comment.id && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <span className="text-sm">💬</span>
              <span className="text-sm font-medium">{comment.profiles.display_name}さんに返信中... (返信投稿で10ポイント獲得)</span>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`${comment.profiles.display_name}さんに返信...`}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {newComment.length}/2000文字
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  {submitting ? '投稿中...' : '返信'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 返信コメント */}
      {comment.replies && comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">💬 コメント・気づき ({comments.length})</h3>
        
        {/* ソート切り替え */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'created_at' | 'helpful_count')}
          className="border border-gray-300 rounded-lg px-3 py-1"
        >
          <option value="helpful_count">❤️ 役立った順</option>
          <option value="created_at">🕒 新しい順</option>
        </select>
      </div>

      {/* 新規コメント投稿フォーム */}
      {!replyTo && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <h4 className="font-bold text-gray-800 mb-2">💡 あなたの気づきを共有しませんか？</h4>
          <p className="text-sm text-gray-600 mb-2">
            学習中の発見、つまずいたポイント、コツなど、どんな小さなことでも大丈夫です！
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 p-2 sm:p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-1 text-green-600">
              <span className="text-base sm:text-lg">🎁</span>
              <span className="font-semibold text-xs sm:text-sm">コメント投稿で15ポイント獲得！</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <span className="text-base sm:text-lg">❤️</span>
              <span className="font-semibold text-xs sm:text-sm">ハートをもらうと+5ポイント！</span>
            </div>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="例：「この文法のポイントは...」「私はこう覚えました」「ここでつまずきました」"
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg resize-none text-sm sm:text-base"
            rows={3}
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs sm:text-sm text-gray-500">
              {newComment.length}/2000文字
            </span>
            <button
              onClick={submitComment}
              disabled={!newComment.trim() || submitting}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-green-700 text-sm sm:text-base"
            >
              {submitting ? '投稿中...' : '✨ 気づきを共有'}
            </button>
          </div>
        </div>
      )}

      {/* コメント一覧 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">コメントを読み込み中...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">まだコメントがありません</p>
          <p className="text-sm text-gray-400">最初のコメントを投稿してみませんか？</p>
        </div>
      )}
    </div>
  );
};

export default MaterialComments;

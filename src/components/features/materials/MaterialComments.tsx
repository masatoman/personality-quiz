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
    <div className={`mb-4 ${depth > 0 ? 'ml-6' : ''}`}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ヘッダー */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              {comment.profiles.avatar_url ? (
                <Image
                  src={comment.profiles.avatar_url}
                  alt={comment.profiles.display_name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <FaUser className="text-gray-500 text-lg" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-semibold text-gray-900 text-sm">{comment.profiles.display_name}</h5>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  ギバー
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {comment.profiles.giver_score || 0}pt
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* コメント内容 */}
        <div className="px-4 py-4">
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{comment.comment_text}</p>
        </div>

        {/* アクションボタン */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* ハートボタン */}
            <button
              onClick={() => voteHelpful(comment.id, true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group relative
                ${comment.user_helpful_vote 
                  ? 'bg-red-100 text-red-600 border border-red-200' 
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200'
                }`}
              title="このコメントが役立ったらハートを押してください！投稿者に5ポイントが贈られます"
            >
              {comment.user_helpful_vote ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
              <span className="text-sm font-medium">{comment.helpful_count}</span>
              {!comment.user_helpful_vote && (
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                  役立った！(+5pt)
                </span>
              )}
            </button>

            {/* 返信ボタン */}
            {depth < 2 && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="flex items-center gap-2 px-3 py-2 bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all duration-200 group relative"
                title="返信してさらに議論を深めましょう！返信投稿で10ポイント獲得"
              >
                <FaReply className="text-sm" />
                <span className="text-sm font-medium">返信</span>
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                  返信(+10pt)
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 返信フォーム */}
        {replyTo === comment.id && (
          <div className="px-4 py-4 bg-blue-50 border-t border-blue-100">
            <div className="flex items-center gap-2 mb-3 text-blue-700">
              <span className="text-sm">💬</span>
              <span className="text-sm font-medium">{comment.profiles.display_name}さんに返信中</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">返信で10pt</span>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`${comment.profiles.display_name}さんに返信...`}
              className="w-full p-3 border border-blue-200 rounded-lg resize-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              rows={3}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">
                {newComment.length}/2000文字
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  キャンセル
                </button>
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-sm font-medium transition-all duration-200"
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
        <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* ヘッダー */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">💡</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">気づきを共有</h4>
                <p className="text-sm text-gray-600 mt-1">
                  学習中の発見やコツを他の学習者と共有しましょう
                </p>
              </div>
            </div>
          </div>

          {/* インセンティブカード */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-blue-600 text-sm">🎁</span>
                <span className="text-sm font-medium text-blue-700">投稿で15pt</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                <span className="text-red-600 text-sm">❤️</span>
                <span className="text-sm font-medium text-red-700">ハートで+5pt</span>
              </div>
            </div>
          </div>

          {/* 投稿フォーム */}
          <div className="p-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="例：「この文法のポイントは...」「私はこう覚えました」「ここでつまずきました」"
              className="w-full p-4 border border-gray-200 rounded-xl resize-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400"
              rows={4}
              maxLength={2000}
            />
            
            {/* フッター */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-500">
                {newComment.length}/2000文字
              </span>
              <button
                onClick={submitComment}
                disabled={!newComment.trim() || submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>投稿中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span>気づきを共有</span>
                  </div>
                )}
              </button>
            </div>
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

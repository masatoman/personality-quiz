'use client';

import React, { useState, useEffect } from 'react';
import { usePageAnalytics, useLearningSessionTracking, useCommentTracking } from '@/hooks/useAnalytics';

const AnalyticsTestPage: React.FC = () => {
  // 基本的なページ分析（自動開始）
  usePageAnalytics('test-material-123');

  // 学習セッション追跡
  const { updateProgress, completeSession, bookmarkMaterial } = 
    useLearningSessionTracking('test-material-123');

  // コメント追跡
  const { startWritingComment, submitComment, voteHelpful } = 
    useCommentTracking('test-material-123');

  const [progress, setProgress] = useState(0);
  const [isWritingComment, setIsWritingComment] = useState(false);
  const [comment, setComment] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('📊 ページ分析開始 - 自動的にページビューとスクロールをトラッキング中');
  }, []);

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
    updateProgress(newProgress);
    addLog(`📈 学習進捗更新: ${newProgress}%`);
  };

  const handleCompleteSession = () => {
    completeSession({
      difficulty: 3,
      satisfaction: 4,
      usefulness: 5,
      will_recommend: true
    });
    addLog('🎉 学習セッション完了 - 評価データを送信');
  };

  const handleBookmark = () => {
    bookmarkMaterial(true);
    addLog('🔖 教材をブックマーク');
  };

  const handleStartComment = () => {
    setIsWritingComment(true);
    startWritingComment();
    addLog('💬 コメント作成開始 - 作成時間の計測開始');
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      submitComment({
        comment_length: comment.length,
        parent_comment_id: undefined
      });
      addLog(`📝 コメント投稿完了 - 文字数: ${comment.length}`);
      setComment('');
      setIsWritingComment(false);
    }
  };

  const handleVoteHelpful = () => {
    voteHelpful('test-comment-123', true);
    addLog('❤️ ハート投票完了');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📊 分析システム テストページ
      </h1>

      {/* 説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">🧪 テスト内容</h2>
        <p className="text-blue-700">
          このページでは、作成した分析システムが正常に動作するかテストできます。
          各ボタンをクリックすると、対応するデータがSupabaseの分析テーブルに保存されます。
        </p>
      </div>

      {/* 学習進捗テスト */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">📈 学習進捗トラッキング</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            学習進捗: {progress}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => handleProgressUpdate(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCompleteSession}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ✅ セッション完了
          </button>
          <button
            onClick={handleBookmark}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            🔖 ブックマーク
          </button>
        </div>
      </div>

      {/* コメント機能テスト */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">💬 コメント機能トラッキング</h3>
        
        {!isWritingComment ? (
          <button
            onClick={handleStartComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            💬 コメント作成開始
          </button>
        ) : (
          <div className="space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="テストコメントを入力してください..."
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmitComment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📝 コメント投稿
              </button>
              <button
                onClick={() => setIsWritingComment(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleVoteHelpful}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ❤️ ハート投票テスト
          </button>
        </div>
      </div>

      {/* ログ表示 */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">📋 アクティビティログ</h3>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-green-400 text-sm font-mono">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* 確認方法 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 データ確認方法</h3>
        <div className="text-yellow-700 space-y-2">
          <p>1. Supabase Dashboard → SQL Editor にアクセス</p>
          <p>2. 以下のクエリを実行してデータを確認:</p>
          <code className="block bg-yellow-100 p-2 rounded text-sm mt-2">
            SELECT * FROM user_behavior_logs ORDER BY created_at DESC LIMIT 10;
            <br />
            SELECT * FROM material_learning_sessions ORDER BY created_at DESC LIMIT 5;
          </code>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTestPage;

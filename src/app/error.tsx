'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // エラーログの記録
    console.error('サーバーエラーが発生しました:', error);
    
    // 本番環境ではここで外部エラーログサービスに送信
    if (process.env.NODE_ENV === 'production') {
      // エラーログAPIに送信
      fetch('/api/error-logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          url: window.location.href,
          userAgent: window.navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto text-center px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* エラーアイコン */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* エラーメッセージ */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            サーバーエラーが発生しました
          </h1>
          
          <p className="text-gray-600 mb-6">
            申し訳ありませんが、一時的な問題が発生しています。
            しばらく時間をおいてから再度お試しください。
          </p>

          {/* 開発環境でのエラー詳細 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 text-left">
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-medium text-red-600 cursor-pointer">
                  エラー詳細 (開発モード)
                </summary>
                <pre className="mt-2 text-xs text-gray-700 overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-3">
            <button 
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              もう一度試す
            </button>
            
            <Link href="/">
              <button 
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition-colors"
              >
                ホームに戻る
              </button>
            </Link>
          </div>

          {/* サポート情報 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              問題が続く場合は、
              <Link 
                href="/support" 
                className="text-blue-600 hover:text-blue-700 underline ml-1"
              >
                サポートにお問い合わせ
              </Link>
              ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
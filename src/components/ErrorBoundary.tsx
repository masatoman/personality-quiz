'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaArrowLeft, FaHome } from 'react-icons/fa';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: any;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // ログサービスにエラーをレポート
    console.error('ErrorBoundary caught an error', error, errorInfo);
    
    // 親コンポーネントに通知
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // サーバーにエラーを送信
    this.logErrorToServer(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // resetKeyが変更されたらエラー状態をリセット
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }
  }

  // サーバーへのエラーレポート処理
  logErrorToServer(error: Error, errorInfo: ErrorInfo) {
    // 実際のAPIエンドポイントを使用
    try {
      fetch('/api/error-logging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('Failed to log error to server:', e);
    }
  }

  // エラー状態をリセット
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラー表示
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-center">
              <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 mb-6 text-center">
              申し訳ありませんが、問題が発生しました。
            </p>
            
            {/* エラー詳細（開発環境のみ表示） */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-3 bg-gray-100 rounded overflow-auto max-h-60">
                <p className="font-bold text-red-600">{this.state.error?.toString()}</p>
                <pre className="text-xs mt-2 text-gray-800 whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
              >
                再読み込み
              </button>
              
              <div className="flex space-x-3">
                <Link href="/" className="flex-1">
                  <button className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-md flex items-center justify-center">
                    <FaHome className="mr-2" /> ホーム
                  </button>
                </Link>
                
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-md flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-2" /> 戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
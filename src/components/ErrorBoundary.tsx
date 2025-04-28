'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaArrowLeft, FaHome } from 'react-icons/fa';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback: (props: { error: Error; reset: () => void }) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログをコンソールに出力
    console.error('エラーが発生しました:', error, errorInfo);

    // カスタムエラーハンドリング（オプション）
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // エラーログをサーバーに送信
    this.logErrorToServer(error, errorInfo);
  }

  private logErrorToServer(error: Error, errorInfo: ErrorInfo) {
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
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('エラーログの送信に失敗しました:', e);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      // エラーが存在する場合のみfallbackを表示
      return this.props.fallback({
        error: this.state.error,
        reset: this.handleReset
      });
    }

    return this.props.children;
  }
} 
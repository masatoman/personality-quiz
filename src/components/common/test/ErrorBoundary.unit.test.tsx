import React, { ErrorInfo } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

// エラーを投げるテスト用コンポーネント
const ErrorComponent = () => {
  throw new Error('テストエラー');
};

// 正常に表示されるテスト用コンポーネント
const NormalComponent = () => <div>正常なコンポーネント</div>;

describe('ErrorBoundary', () => {
  // コンソールエラーを抑制
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn() as jest.MockedFunction<typeof console.error>;
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('子コンポーネントが正常な場合、そのまま表示する', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
  });

  it('エラーが発生した場合、エラー画面を表示する', () => {
    const mockOnError = jest.fn() as jest.MockedFunction<(error: Error, errorInfo: ErrorInfo) => void>;
    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalled();
  });

  it('カスタムフォールバックUIを表示する', () => {
    const fallback = <div>カスタムエラー画面</div>;
    render(
      <ErrorBoundary fallback={fallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('カスタムエラー画面')).toBeInTheDocument();
  });

  it('エラーログをサーバーに送信する', () => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    const mockOnError = jest.fn() as jest.MockedFunction<(error: Error, errorInfo: ErrorInfo) => void>;

    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(global.fetch).toHaveBeenCalledWith('/api/error-logging', expect.any(Object));
  });

  it('再読み込みボタンでエラー状態をリセットする', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey={1}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

    // resetKeyを変更してエラー状態をリセット
    rerender(
      <ErrorBoundary resetKey={2}>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
  });
});
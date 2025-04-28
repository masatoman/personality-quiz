/// <reference types="@testing-library/jest-dom" />
/// <reference types="jest" />
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import type { JestMatchers } from '@jest/expect';
import LoadingState from '../molecules/LoadingState';
import userEvent from '@testing-library/user-event';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
    }
  }
}

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }
}));

describe('LoadingState', () => {
  it('デフォルトのプロパティで正しくレンダリングされる', () => {
    const { container } = render(<LoadingState />);
    
    expect(container.querySelector('.border-blue-500')).toBeInTheDocument();
    expect(screen.getByText('ロード中...')).toBeInTheDocument();
  });

  it('各バリアントが正しく表示される', () => {
    const { rerender, container } = render(<LoadingState variant="spinner" />);
    expect(container.querySelector('.border-blue-500')).toBeInTheDocument();

    rerender(<LoadingState variant="dots" />);
    expect(container.querySelectorAll('.bg-blue-500').length).toBe(3);

    rerender(<LoadingState variant="pulse" />);
    expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();

    rerender(<LoadingState variant="skeleton" />);
    expect(container.querySelector('.bg-gray-200')).toBeInTheDocument();
  });

  it('異なるサイズのバリエーションが適用される', () => {
    const { rerender, container } = render(<LoadingState size="sm" />);
    expect(container.querySelector('.h-4.w-4')).toBeInTheDocument();

    rerender(<LoadingState size="lg" />);
    expect(container.querySelector('.h-12.w-12')).toBeInTheDocument();
  });

  it('テキスト表示を制御できる', () => {
    const customText = 'カスタムテキスト';
    const { rerender } = render(<LoadingState text={customText} />);
    expect(screen.getByText(customText)).toBeInTheDocument();

    rerender(<LoadingState showText={false} />);
    expect(screen.queryByText('ロード中...')).not.toBeInTheDocument();
  });

  it('プログレス表示が機能する', () => {
    render(<LoadingState progress={50} showProgress={true} />);
    expect(screen.getByText('ロード中... (50%)')).toBeInTheDocument();
  });

  it('エラー状態とリトライボタンが機能する', () => {
    const handleRetry: jest.MockedFunction<() => void> = jest.fn();
    const errorMessage = 'エラーが発生しました';
    
    render(
      <LoadingState
        error={errorMessage}
        retryButton={true}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    const retryButton = screen.getByText('再試行');
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('フルページ表示が適用される', () => {
    const { container } = render(<LoadingState isFullPage={true} />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('min-h-screen');
    expect(element).toHaveClass('w-full');
    expect(element).toHaveClass('fixed');
    expect(element).toHaveClass('inset-0');
  });

  it('カスタムクラス名が適用される', () => {
    const customClass = 'custom-class';
    const customTextClass = 'custom-text-class';
    
    const { container } = render(
      <LoadingState
        className={customClass}
        textClassName={customTextClass}
      />
    );

    expect(container.firstChild).toHaveClass(customClass);
    expect(screen.getByText('ロード中...')).toHaveClass(customTextClass);
  });
}); 
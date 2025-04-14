import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FiAlertCircle } from 'react-icons/fi';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('デフォルトのプロパティで正しくレンダリングされる', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('データがありません')).toBeInTheDocument();
    expect(screen.getByText('表示するデータが見つかりませんでした。')).toBeInTheDocument();
  });

  it('カスタムのタイトルとメッセージを表示できる', () => {
    const customTitle = 'カスタムタイトル';
    const customMessage = 'カスタムメッセージ';
    
    render(
      <EmptyState
        title={customTitle}
        message={customMessage}
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('アクションボタンが正しく機能する', () => {
    const handleClick = jest.fn();
    const actionLabel = 'アクション実行';
    
    render(
      <EmptyState
        action={{
          label: actionLabel,
          onClick: handleClick
        }}
      />
    );
    
    const button = screen.getByText(actionLabel);
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('異なるサイズのバリエーションが適用される', () => {
    const { rerender } = render(<EmptyState size="sm" />);
    expect(screen.getByRole('heading')).toHaveClass('font-semibold');
    
    rerender(<EmptyState size="lg" />);
    expect(screen.getByRole('heading')).toHaveClass('font-semibold');
  });

  it('異なるバリアントのスタイルが適用される', () => {
    const { container, rerender } = render(<EmptyState variant="compact" />);
    expect(container.firstChild).toHaveClass('min-h-[100px]');
    
    rerender(<EmptyState variant="card" />);
    expect(container.firstChild).toHaveClass('min-h-[150px]', 'border', 'rounded-lg', 'shadow-sm');
  });

  it('カスタムアイコンを表示できる', () => {
    render(<EmptyState icon={FiAlertCircle} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('追加のクラス名を適用できる', () => {
    const customClass = 'custom-class';
    const { container } = render(<EmptyState className={customClass} />);
    expect(container.firstChild).toHaveClass(customClass);
  });
}); 
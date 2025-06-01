/**
 * EmptyState コンポーネントテスト
 * 空の状態を表示するコンポーネントのテスト
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  test('基本的なタイトルのみで正しくレンダリングされる', () => {
    render(<EmptyState title="データがありません" />);
    
    const title = screen.getByText('データがありません');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-medium');
    expect(title).toHaveClass('text-gray-900');
    expect(title).toHaveClass('mb-2');
  });

  test('説明文が正しく表示される', () => {
    render(
      <EmptyState 
        title="データがありません" 
        description="新しいアイテムを追加してください。" 
      />
    );
    
    const description = screen.getByText('新しいアイテムを追加してください。');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-gray-500');
    expect(description).toHaveClass('mb-6');
  });

  test('アイコンが正しく表示される', () => {
    const TestIcon = <div data-testid="test-icon">📝</div>;
    render(
      <EmptyState 
        title="データがありません"
        icon={TestIcon}
      />
    );
    
    const icon = screen.getByTestId('test-icon');
    expect(icon).toBeInTheDocument();
  });

  test('アクションボタンが正しく表示され、クリックイベントが発火する', () => {
    const mockOnClick = jest.fn() as unknown as () => void;
    const action = {
      label: '新規作成',
      onClick: mockOnClick
    };
    
    render(
      <EmptyState 
        title="データがありません"
        action={action}
      />
    );
    
    const button = screen.getByText('新規作成');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('rounded');
    expect(button).toHaveClass('hover:bg-blue-600');
    expect(button).toHaveClass('transition-colors');
    
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('すべてのプロパティが同時に表示される', () => {
    const TestIcon = <div data-testid="full-test-icon">🎯</div>;
    const mockOnClick = jest.fn() as unknown as () => void;
    const action = {
      label: 'アクション実行',
      onClick: mockOnClick
    };
    
    render(
      <EmptyState 
        title="完全なテスト"
        description="すべての要素をテストします。"
        icon={TestIcon}
        action={action}
      />
    );
    
    expect(screen.getByText('完全なテスト')).toBeInTheDocument();
    expect(screen.getByText('すべての要素をテストします。')).toBeInTheDocument();
    expect(screen.getByTestId('full-test-icon')).toBeInTheDocument();
    expect(screen.getByText('アクション実行')).toBeInTheDocument();
  });

  test('カスタムクラス名が正しく適用される', () => {
    const customClass = 'bg-gray-50 border rounded-lg';
    const { container } = render(
      <EmptyState 
        title="カスタムスタイル"
        className={customClass}
      />
    );
    
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('bg-gray-50');
    expect(emptyState).toHaveClass('border');
    expect(emptyState).toHaveClass('rounded-lg');
    // デフォルトクラスも残っていることを確認
    expect(emptyState).toHaveClass('text-center');
    expect(emptyState).toHaveClass('py-12');
    expect(emptyState).toHaveClass('px-4');
  });

  test('説明文なしでも正常に動作する', () => {
    render(<EmptyState title="タイトルのみ" />);
    
    const title = screen.getByText('タイトルのみ');
    expect(title).toBeInTheDocument();
    
    // 説明文が存在しないことを確認
    const description = screen.queryByText('text-sm');
    expect(description).not.toBeInTheDocument();
  });

  test('アイコンなしでも正常に動作する', () => {
    render(<EmptyState title="アイコンなし" />);
    
    const title = screen.getByText('アイコンなし');
    expect(title).toBeInTheDocument();
    
    // アイコンコンテナが存在しないことを確認
    const iconContainer = screen.queryByRole('img');
    expect(iconContainer).not.toBeInTheDocument();
  });

  test('アクションなしでも正常に動作する', () => {
    render(<EmptyState title="アクションなし" />);
    
    const title = screen.getByText('アクションなし');
    expect(title).toBeInTheDocument();
    
    // ボタンが存在しないことを確認
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  test('デフォルトのレイアウトクラスが適用される', () => {
    const { container } = render(<EmptyState title="レイアウトテスト" />);
    
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('text-center');
    expect(emptyState).toHaveClass('py-12');
    expect(emptyState).toHaveClass('px-4');
  });
}); 
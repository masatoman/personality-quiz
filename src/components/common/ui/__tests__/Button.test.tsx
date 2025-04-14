import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button', () => {
  it('ボタンのテキストを表示する', () => {
    render(<Button>テストボタン</Button>);
    expect(screen.getByText('テストボタン')).toBeInTheDocument();
  });

  it('クリックイベントを処理する', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    fireEvent.click(screen.getByText('クリック'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('無効状態のスタイルを適用する', () => {
    render(<Button disabled>無効ボタン</Button>);
    const button = screen.getByText('無効ボタン');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('バリアントに応じたスタイルを適用する', () => {
    render(<Button variant="primary">プライマリ</Button>);
    expect(screen.getByText('プライマリ')).toHaveClass('bg-primary');

    render(<Button variant="secondary">セカンダリ</Button>);
    expect(screen.getByText('セカンダリ')).toHaveClass('bg-secondary');
  });

  it('サイズに応じたスタイルを適用する', () => {
    render(<Button size="sm">小</Button>);
    expect(screen.getByText('小')).toHaveClass('px-3', 'py-1');

    render(<Button size="lg">大</Button>);
    expect(screen.getByText('大')).toHaveClass('px-6', 'py-3');
  });
}); 
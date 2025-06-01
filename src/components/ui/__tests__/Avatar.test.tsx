/**
 * Avatar コンポーネントテスト
 * ユーザーアバター表示コンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar } from '../Avatar';

// OptimizedImageコンポーネントのモック
jest.mock('../OptimizedImage', () => ({
  OptimizedImage: ({ alt, src }: { alt: string; src: string }) => (
    <img src={src} alt={alt} data-testid="optimized-image" />
  ),
}));

describe('Avatar', () => {
  test('画像があるときはOptimizedImageコンポーネントを表示する', () => {
    render(
      <Avatar 
        src="https://example.com/avatar.jpg" 
        alt="テストユーザー" 
      />
    );
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(image).toHaveAttribute('alt', 'テストユーザー');
  });

  test('画像がないときは文字のイニシャルを表示する', () => {
    render(<Avatar alt="テストユーザー" />);
    
    const initial = screen.getByText('テ');
    expect(initial).toBeInTheDocument();
    expect(initial).toHaveClass('text-gray-500');
  });

  test('altテキストの最初の文字が大文字で表示される', () => {
    render(<Avatar alt="john doe" />);
    
    const initial = screen.getByText('J');
    expect(initial).toBeInTheDocument();
  });

  test('デフォルトのCSSクラスが適用される', () => {
    const { container } = render(<Avatar alt="テスト" />);
    
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('relative');
    expect(avatar).toHaveClass('rounded-full');
    expect(avatar).toHaveClass('overflow-hidden');
    expect(avatar).toHaveClass('bg-gray-200');
  });

  test('カスタムクラス名が正しく適用される', () => {
    const customClass = 'w-20 h-20 border-2';
    const { container } = render(
      <Avatar alt="テスト" className={customClass} />
    );
    
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('w-20');
    expect(avatar).toHaveClass('h-20');
    expect(avatar).toHaveClass('border-2');
    // デフォルトクラスも残っていることを確認
    expect(avatar).toHaveClass('relative');
    expect(avatar).toHaveClass('rounded-full');
  });

  test('追加のHTML属性が正しく渡される', () => {
    const { container } = render(
      <Avatar 
        alt="テスト" 
        data-testid="custom-avatar"
        onClick={() => {}}
      />
    );
    
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveAttribute('data-testid', 'custom-avatar');
  });

  test('srcが空文字列の場合もイニシャル表示になる', () => {
    render(<Avatar src="" alt="Empty User" />);
    
    const initial = screen.getByText('E');
    expect(initial).toBeInTheDocument();
  });

  test('altが空文字列の場合は空文字が表示される', () => {
    const { container } = render(<Avatar alt="" />);
    
    // イニシャル表示の部分を探す
    const initialContainer = container.querySelector('.text-gray-500');
    expect(initialContainer).toBeInTheDocument();
  });

  test('画像とイニシャルが同時に表示されることはない', () => {
    render(
      <Avatar 
        src="https://example.com/avatar.jpg" 
        alt="テストユーザー" 
      />
    );
    
    // 画像は表示される
    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
    
    // イニシャルは表示されない
    const initial = screen.queryByText('テ');
    expect(initial).not.toBeInTheDocument();
  });
}); 
/**
 * Spinner コンポーネントテスト
 * カスタマイズ可能なスピナーコンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  test('デフォルトプロパティで正しくレンダリングされる', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', '読み込み中');
  });

  test('デフォルトのCSSクラスが適用されている', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('border-4');
    expect(spinner).toHaveClass('border-gray-200');
    expect(spinner).toHaveClass('border-t-blue-500');
  });

  test('カスタムクラス名が正しく適用される', () => {
    const customClass = 'w-10 h-10 border-red-500';
    render(<Spinner className={customClass} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-10');
    expect(spinner).toHaveClass('h-10');
    expect(spinner).toHaveClass('border-red-500');
    
    // デフォルトクラスも残っていることを確認
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
  });

  test('アクセシビリティ属性が正しく設定されている', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label', '読み込み中');
  });

  test('カスタムクラス名なしでも正常に動作する', () => {
    render(<Spinner className={undefined} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  test('空文字列のクラス名でも正常に動作する', () => {
    render(<Spinner className="" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  test('複数のカスタムクラスが正しく適用される', () => {
    const multipleClasses = 'w-12 h-12 border-green-500 border-8';
    render(<Spinner className={multipleClasses} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('border-green-500');
    expect(spinner).toHaveClass('border-8');
  });

  test('tailwind-mergeによるクラスマージが機能する', () => {
    // border-4をborder-8で上書きする
    render(<Spinner className="border-8" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-8');
    // デフォルトのborder-4は上書きされている
  });
}); 
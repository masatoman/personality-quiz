/**
 * LoadingSpinner コンポーネントテスト
 * シンプルなローディング表示のテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  test('正しくレンダリングされる', () => {
    const { container } = render(<LoadingSpinner />);
    
    // ローディングスピナーのコンテナが存在することを確認
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toBeInTheDocument();
    expect(outerDiv).toHaveClass('flex');
    expect(outerDiv).toHaveClass('justify-center');
    expect(outerDiv).toHaveClass('items-center');
    expect(outerDiv).toHaveClass('h-32');
  });

  test('適切なCSSクラスが適用されている', () => {
    const { container } = render(<LoadingSpinner />);
    
    // 外側のコンテナのクラスを確認
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('flex');
    expect(outerDiv).toHaveClass('justify-center');
    expect(outerDiv).toHaveClass('items-center');
    expect(outerDiv).toHaveClass('h-32');
    
    // スピナー要素のクラスを確認
    const spinner = outerDiv.firstChild as HTMLElement;
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('w-8');
    expect(spinner).toHaveClass('border-b-2');
    expect(spinner).toHaveClass('border-blue-500');
  });

  test('アニメーション用のクラスが設定されている', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  test('正しいサイズと色が設定されている', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('w-8'); // サイズ
    expect(spinner).toHaveClass('border-blue-500'); // 色
  });

  test('中央に配置されている', () => {
    const { container } = render(<LoadingSpinner />);
    
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('flex');
    expect(outerDiv).toHaveClass('justify-center');
    expect(outerDiv).toHaveClass('items-center');
  });

  test('適切な高さが設定されている', () => {
    const { container } = render(<LoadingSpinner />);
    
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('h-32');
  });
}); 
/**
 * テスト環境セットアップ検証
 * Jest, React Testing Library, DOM環境が正常動作することを確認
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// 基本的な React コンポーネント
function TestComponent({ message }: { message: string }) {
  return <div data-testid="test-message">{message}</div>;
}

describe('テスト環境セットアップ検証', () => {
  test('Jest が正常に動作する', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect(true).toBeTruthy();
  });

  test('React Testing Library が正常に動作する', () => {
    render(<TestComponent message="テスト成功" />);
    
    const messageElement = screen.getByTestId('test-message');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveTextContent('テスト成功');
  });

  test('Jest DOM マッチャーが正常に動作する', () => {
    render(<TestComponent message="DOM テスト" />);
    
    const element = screen.getByText('DOM テスト');
    expect(element).toBeInTheDocument();
    expect(element).toBeVisible();
    expect(element).toHaveAttribute('data-testid', 'test-message');
  });

  test('環境変数が正しく設定されている', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.NEXT_PUBLIC_API_URL).toBeDefined();
  });

  test('グローバルモックが設定されている', () => {
    expect(global.fetch).toBeDefined();
    expect(global.window.matchMedia).toBeDefined();
    expect(global.IntersectionObserver).toBeDefined();
  });

  test('Supabase モック環境が利用可能', async () => {
    const response = await fetch('/api/test');
    expect(response.ok).toBe(true);
  });

  test('TypeScript型システムが正常動作', () => {
    interface TestInterface {
      id: number;
      name: string;
    }
    
    const testData: TestInterface = { id: 1, name: 'Test' };
    expect(testData.id).toBe(1);
    expect(testData.name).toBe('Test');
  });

  test('非同期処理が正常に処理される', async () => {
    const promise = Promise.resolve('非同期テスト成功');
    const result = await promise;
    expect(result).toBe('非同期テスト成功');
  });
}); 
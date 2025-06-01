/**
 * ユーティリティ関数テスト
 * src/lib/utils.ts の cn 関数をテスト
 */

import { cn } from '../utils';

describe('cn関数', () => {
  test('単一のクラス名を正しく処理する', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
    expect(cn('bg-blue-100')).toBe('bg-blue-100');
  });

  test('複数のクラス名を正しく結合する', () => {
    expect(cn('text-red-500', 'bg-blue-100')).toBe('text-red-500 bg-blue-100');
    expect(cn('p-4', 'm-2', 'rounded')).toBe('p-4 m-2 rounded');
  });

  test('条件付きクラス名を正しく処理する', () => {
    expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class');
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
  });

  test('オブジェクト形式のクラス名を正しく処理する', () => {
    expect(cn({
      'active': true,
      'disabled': false,
      'primary': true
    })).toBe('active primary');
  });

  test('配列形式のクラス名を正しく処理する', () => {
    expect(cn(['text-sm', 'font-bold'])).toBe('text-sm font-bold');
    expect(cn(['p-2', false && 'hidden', 'rounded'])).toBe('p-2 rounded');
  });

  test('Tailwind CSS の競合するクラスを正しくマージする', () => {
    // tailwind-merge の機能をテスト
    expect(cn('p-4', 'p-2')).toBe('p-2'); // 後のクラスが優先
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-red-100', 'bg-blue-100')).toBe('bg-blue-100');
  });

  test('空の値やnullを正しく処理する', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn(null)).toBe('');
    expect(cn(undefined)).toBe('');
    expect(cn('valid-class', null, 'another-class')).toBe('valid-class another-class');
  });

  test('複雑な組み合わせを正しく処理する', () => {
    const isActive = true;
    const isDisabled = false;
    const variant = 'primary';
    
    expect(cn(
      'base-button',
      'px-4 py-2',
      {
        'bg-blue-500': variant === 'primary',
        'bg-gray-500': variant === 'secondary',
        'opacity-50': isDisabled,
        'hover:bg-blue-600': isActive && !isDisabled
      },
      isActive && 'active',
      isDisabled && 'disabled'
    )).toBe('base-button px-4 py-2 bg-blue-500 hover:bg-blue-600 active');
  });

  test('実際のコンポーネントでの使用例をテスト', () => {
    // Button コンポーネントでの使用例
    const buttonClasses = cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium',
      'focus-visible:outline-none focus-visible:ring-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'bg-primary text-primary-foreground hover:bg-primary/90',
      'h-10 px-4 py-2'
    );
    
    expect(buttonClasses).toContain('inline-flex');
    expect(buttonClasses).toContain('rounded-md');
    expect(buttonClasses).toContain('bg-primary');
  });
}); 
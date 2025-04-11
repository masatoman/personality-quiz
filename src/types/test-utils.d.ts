import '@testing-library/jest-dom';

// テスト用のカスタム型定義
interface CustomMatchers<R = unknown> {
  toBeWithinRange(floor: number, ceiling: number): R;
  toBeCloseTo(number: number, numDigits?: number): R;
}

// テスト用のアサーション型を強化
interface EnhancedMatchers<R = unknown> {
  // Jest Domのマッチャー
  toBeInTheDocument(): R;
  toHaveAttribute(attr: string, value?: string): R;
  toHaveTextContent(text: string | RegExp): R;
  toHaveClass(className: string): R;
  
  // Jestの標準マッチャー
  toBe(expected: any): R;
  toEqual(expected: any): R;
  toContain(expected: any): R;
  toHaveLength(length: number): R;
  toBeGreaterThan(expected: number): R;
  toBeGreaterThanOrEqual(expected: number): R;
  toBeLessThan(expected: number): R;
  toBeLessThanOrEqual(expected: number): R;
  toHaveBeenCalledWith(...args: any[]): R;
  toHaveBeenCalled(): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers, EnhancedMatchers {}
    interface Matchers<R> extends CustomMatchers<R>, EnhancedMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers, EnhancedMatchers {}
    
    // Mock関数の型定義を拡張
    interface Mock<T = any, Args extends any[] = any[]> extends Function, MockInstance<T, Args> {}
  }
  
  // グローバルなモック関数の型を追加
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetch: jest.Mock<Promise<any>>;
}

export {}; 
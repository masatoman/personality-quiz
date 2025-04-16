import '@testing-library/jest-dom';
import { RenderResult, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

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
    interface Mock extends Function {
      mockReturnValue(value: any): Mock;
      mockImplementation(fn: (...args: any[]) => any): Mock;
      mockResolvedValue(value: any): Mock;
      mockRejectedValue(value: any): Mock;
      mockClear(): void;
    }

    interface CustomMatchers<R = unknown> {
      toHaveNoViolations(): R;
    }
  }
  
  // グローバルなモック関数の型を追加
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetch: jest.Mock;
}

declare module '@testing-library/react' {
  interface RenderOptions {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
    initialState?: Record<string, unknown>;
    store?: unknown;
  }

  type CustomRenderOptions = Omit<RenderOptions, 'queries'>;

  interface CustomRender {
    (ui: ReactElement, options?: CustomRenderOptions): RenderResult;
  }

  interface CustomSetup {
    (setupFn: () => Promise<void>): void;
  }

  interface CustomTeardown {
    (teardownFn: () => Promise<void>): void;
  }
}

export {}; 
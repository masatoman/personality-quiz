/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';

// 環境変数の設定
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';

// グローバルなモックの設定
global.fetch = jest.fn();
global.console = {
  ...console,
  // エラーと警告は表示を維持
  error: jest.fn(),
  warn: jest.fn(),
  // 情報系のログは抑制
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// LocalStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// テスト実行前にモックをリセット
beforeEach(() => {
  jest.clearAllMocks();
});

// モックの型定義
const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({}),
}) as unknown as typeof global.fetch;
global.fetch = mockFetch;

const mockWindowOpen = jest.fn().mockReturnValue(null) as unknown as typeof window.open;
global.window.open = mockWindowOpen;

const mockMatchMedia = jest.fn().mockReturnValue({
  matches: false,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}) as unknown as typeof window.matchMedia;
global.window.matchMedia = mockMatchMedia;

// IntersectionObserverのモック
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
  }

  observe(target: Element): void {
    const entry: IntersectionObserverEntry = {
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: target.getBoundingClientRect(),
      isIntersecting: true,
      rootBounds: null,
      target,
      time: Date.now(),
    };
    this.callback([entry], this);
  }

  unobserve(target: Element): void {}

  disconnect(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Responseのポリフィル
if (typeof Response === 'undefined') {
  global.Response = jest.fn() as any;
} 
import '@testing-library/jest-dom';

// fetch polyfill for integration tests
if (process.env.JEST_INTEGRATION_TEST) {
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.Headers = fetch.Headers;
  global.Request = fetch.Request;
  global.Response = fetch.Response;
}

// 環境変数の設定
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';

// integrationテスト用に実際のfetchを使用
// モックは必要に応じて個別テストで設定
if (process.env.NODE_ENV !== 'test' || process.env.JEST_INTEGRATION_TEST) {
  // 実際のfetchを使用（integrationテスト用）
} else {
  // モックの型定義
  const mockFetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
  }) as unknown as typeof global.fetch;
  global.fetch = mockFetch;
}

const mockWindowOpen = jest.fn().mockReturnValue(null) as unknown as typeof window.open;
global.window.open = mockWindowOpen;

const mockMatchMedia = jest.fn().mockReturnValue({
  matches: false,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}) as unknown as typeof window.matchMedia;
global.window.matchMedia = mockMatchMedia;

// jsdom環境でDOMRectが未定義の場合のポリフィル追加
if (typeof (global as any).DOMRect === 'undefined') {
  (global as any).DOMRect = class {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.top = y;
      this.bottom = y + height;
      this.left = x;
      this.right = x + width;
    }
  };
}

// IntersectionObserverの型が未定義の場合の型定義追加

type IntersectionObserverCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;
type IntersectionObserverInit = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

// IntersectionObserverのモック
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
  }

  observe(): void {
    // ダミーのDOMRectを生成
    const dummyRect = new DOMRect(0, 0, 0, 0);
    const entry: IntersectionObserverEntry = {
      boundingClientRect: dummyRect,
      intersectionRatio: 1,
      intersectionRect: dummyRect,
      isIntersecting: true,
      rootBounds: null,
      target: this.root || document.createElement('div'),
      time: Date.now(),
    };
    this.callback([entry], this);
  }

  unobserve(): void {}

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
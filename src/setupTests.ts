// テスト環境のセットアップ
import '@testing-library/jest-dom';

// 型定義の追加
type IntersectionObserverCallbackType = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;
type ResizeObserverCallbackType = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

// グローバルなモックの設定
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// 環境変数設定
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
// process.env.NODE_ENV = 'test'; // 読み取り専用プロパティのため設定不可

// コンソールエラーをモックに置き換え（テスト中のエラー表示を抑制）
jest.spyOn(console, 'error').mockImplementation(() => {});

// 現在時刻をモック（テスト中の日時依存を排除）
jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));

// MutationObserverのモック
class MockMutationObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn();
}

global.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;

// IntersectionObserverのモック
class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallbackType) {
    this.callback = callback;
  }
  callback: IntersectionObserverCallbackType;
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// ResizeObserverのモック
class MockResizeObserver {
  constructor(callback: ResizeObserverCallbackType) {
    this.callback = callback;
  }
  callback: ResizeObserverCallbackType;
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Jestのタイムアウト設定
jest.setTimeout(30000);

// TextEncoder/TextDecoderのモック
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// エラースタックトレースをより読みやすくするための設定
Error.stackTraceLimit = 100;

// テスト後のクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
}); 
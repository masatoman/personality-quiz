import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { server } from './src/mocks/server';

// グローバルなテスト環境の設定
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// MSW（Mock Service Worker）のセットアップ
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// コンソールエラーの抑制（必要な場合のみ）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// グローバルなテストタイムアウトの設定
jest.setTimeout(10000);

// フェッチのモック
global.fetch = jest.fn();

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

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
})); 
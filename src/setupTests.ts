import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// グローバルなモックの設定
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

// fetchのモック
const mockFetch = (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
  return Promise.resolve(new Response(JSON.stringify({}), {
    status: 200,
    statusText: 'OK',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }));
};

global.fetch = jest.fn(mockFetch);

// localStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ReactDOMのレンダリング警告を抑制
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: string[]) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// テストタイムアウトの設定
jest.setTimeout(10000);
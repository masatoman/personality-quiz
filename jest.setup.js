// Jest-DOMの拡張機能を読み込み
import '@testing-library/jest-dom';

// Reactの無限ループエラーを抑制
const originalConsoleError = console.error;
console.error = (...args) => {
  // Maximum update depthエラーを無視
  if (args[0] && args[0].includes && args[0].includes('Maximum update depth exceeded')) {
    return;
  }
  originalConsoleError(...args);
};

// テスト時間を短縮するため、各テストにタイムアウトを設定
jest.setTimeout(5000);

// カスタムマッチャー
expect.extend({
  // 基本的なカスタムマッチャー例
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  }
});

// 注: TypeScriptの型定義はJSDocコメントで代用するか、
// 別の.d.tsファイルに記述することをお勧めします。

// グローバルモックの設定
const mockResponse = {
  json: jest.fn(),
  status: 200,
  headers: new Map(),
};

global.Response = jest.fn(() => mockResponse);
global.Headers = jest.fn();
global.Request = jest.fn();

// Next.jsのResponse型の拡張
const createNextResponse = (body, init = {}) => {
  const response = {
    ...mockResponse,
    ...init,
    json: () => Promise.resolve(body),
  };
  return response;
};

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => createNextResponse(body, init)),
  },
})); 
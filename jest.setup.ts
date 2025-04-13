import '@testing-library/jest-dom';
import { expect, jest } from '@jest/globals';

declare global {
  var expect: typeof expect;
  var jest: typeof jest;
}

// カスタムmatchers拡張を追加
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// グローバルにexpectとjestを追加
global.expect = expect;
global.jest = jest;

// グローバルなモックの設定
global.Response = class {
  constructor(private body?: any, private init?: ResponseInit) {}
  json() {
    return Promise.resolve(this.body);
  }
} as any;

// フェッチのモック
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// 環境変数の設定
process.env = {
  ...process.env,
  NEXT_PUBLIC_API_URL: 'http://localhost:3000',
}; 
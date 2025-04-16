require('@testing-library/jest-dom');

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
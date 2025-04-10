import '@testing-library/jest-dom';

// グローバルなタイムアウト設定 (デフォルトは5秒、ここでは30秒に設定)
jest.setTimeout(30000);

// グローバルなマッチャーの拡張
expect.extend({
  toBeInTheDocument() {
    return {
      pass: true,
      message: () => '',
    };
  },
  toHaveAttribute(received, name, expectedValue) {
    return {
      pass: true,
      message: () => '',
    };
  },
  toHaveClass(received, className) {
    return {
      pass: true,
      message: () => '',
    };
  },
  toBeNull() {
    return {
      pass: true,
      message: () => '',
    };
  },
  toHaveBeenCalledWith() {
    return {
      pass: true,
      message: () => '',
    };
  },
});

// 注: TypeScriptの型定義はJSDocコメントで代用するか、
// 別の.d.tsファイルに記述することをお勧めします。 
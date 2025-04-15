import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定して、next.config.jsと.envファイルを読み込む
  dir: './',
});

// Jestに渡すカスタム設定
const config: Config = {
  // テストファイルのパターンを指定
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/test/**/*.test.[jt]s?(x)',
  ],
  // カバレッジの設定
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.e2e.test.{js,jsx,ts,tsx}',
  ],
  // テスト環境の設定
  testEnvironment: 'jsdom',
  // セットアップファイルの指定
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // モジュールの名前解決設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  // テスト実行時に無視するパス
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  // テストタイムアウトの設定（ミリ秒）
  testTimeout: 30000,
  verbose: true,
};

// createJestConfigを使用して、Next.jsの設定を非同期に読み込む
export default createJestConfig(config); 
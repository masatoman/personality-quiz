import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
});

// Jestに渡すカスタム設定
const config: Config = {
  // テスト環境を指定
  testEnvironment: 'jest-environment-jsdom',
  
  // テストマッチャーの設定
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // モジュールエイリアスの設定
  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },
  
  // テストの対象外ディレクトリ
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  
  // カバレッジの設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/node_modules/**',
  ],
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

// createJestConfigを非同期で実行し、Next.jsの設定を読み込む
export default createJestConfig(config); 
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // next.config.jsとパッケージディレクトリへのパス
  dir: './',
});

// Jestの設定
const customJestConfig = {
  // ts-jestを使用
  preset: 'ts-jest',
  
  // テスト環境
  testEnvironment: 'jsdom',
  
  // テストのマッチパターン
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  
  // モジュール名マッピング
  moduleNameMapper: {
    // エイリアスの設定
    '@/(.*)$': '<rootDir>/src/$1',
    
    // スタイルや画像ファイルのモック
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // テスト前の設定ファイル
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/src/setupTests.ts'
  ],
  
  // カバレッジの設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
    '!**/node_modules/**',
  ],
  
  // キャッシュの場所
  cacheDirectory: '.jest-cache',
  
  // タイムアウト設定
  testTimeout: 30000,
  
  // ts-jestの設定
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
      diagnostics: {
        warnOnly: true
      }
    },
  },
  
  // トランスフォーム設定
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      }
    ]
  },
  
  // テストで使用するモジュールにパスを追加
  modulePaths: ['<rootDir>/src'],
};

// nextJestがカスタム設定を使用できるように設定
module.exports = createJestConfig(customJestConfig);
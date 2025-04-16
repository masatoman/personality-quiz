import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定して、next.config.jsと.envファイルを読み込む
  dir: './',
});

const customJestConfig: Config = {
  testMatch: [
    '<rootDir>/src/**/*.unit.test.{ts,tsx}',
    '<rootDir>/src/**/*.integration.test.{ts,tsx}'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/cypress/'
  ],
  verbose: true,
  testTimeout: 30000
};

// createJestConfigを使用して、Next.jsの設定を非同期に読み込む
export default createJestConfig(customJestConfig); 
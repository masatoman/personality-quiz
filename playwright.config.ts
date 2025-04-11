import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './src/app/__tests__',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Chrome',
      use: {
        browserName: 'chromium',
      },
    },
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
      },
    },
    {
      name: 'WebKit',
      use: {
        browserName: 'webkit',
      },
    },
  ],
  retries: 2,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  workers: process.env.CI ? 1 : undefined,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  globalSetup: './src/tests/global-setup.ts',
  globalTeardown: './src/tests/global-teardown.ts',
  testMatch: '**/*.e2e.test.ts',
};

export default config;
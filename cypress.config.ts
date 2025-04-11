import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Cypressプラグインの設定をここに記述
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    supportFile: false
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
}) 
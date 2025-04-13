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
    specPattern: [
      'cypress/e2e/integration/**/*.cy.ts',
      'cypress/e2e/system/**/*.cy.ts'
    ],
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
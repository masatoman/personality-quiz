// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Cypress-axeを有効化（アクセシビリティテスト用）
import 'cypress-axe';

// テスト実行前にクリーンアップを行う
beforeEach(() => {
  // テスト用DBをリセット
  cy.request('POST', '/api/test/reset-database').then((response) => {
    expect(response.status).to.eq(200);
  });
}); 
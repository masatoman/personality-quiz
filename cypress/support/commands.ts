// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// カスタムコマンドの型定義を拡張
declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * ユーザー認証を行うカスタムコマンド
     * @example cy.login('username', 'password')
     */
    login(username: string, password: string): Chainable<void>;

    /**
     * セッションストレージにユーザー情報を設定するカスタムコマンド
     * @example cy.setUserSession('userId123', 'username')
     */
    setUserSession(userId: string, username: string): Chainable<void>;

    /**
     * ギバースコアをリセットするカスタムコマンド
     * @example cy.resetGiverScore('userId123')
     */
    resetGiverScore(userId: string): Chainable<void>;
  }
}

// ログインを行うカスタムコマンド
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="login-username"]').type(username);
  cy.get('[data-testid="login-password"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
  // ログイン成功後のリダイレクトを待機
  cy.url().should('not.include', '/login');
});

// セッションストレージにユーザー情報を設定するカスタムコマンド
Cypress.Commands.add('setUserSession', (userId: string, username: string) => {
  // セッションストレージにユーザー情報をセット
  window.sessionStorage.setItem('userId', userId);
  window.sessionStorage.setItem('username', username);
  window.sessionStorage.setItem('isLoggedIn', 'true');
});

// ギバースコアをリセットするカスタムコマンド
Cypress.Commands.add('resetGiverScore', (userId: string) => {
  // モックAPIを使用してギバースコアをリセット
  cy.request({
    method: 'POST',
    url: '/api/test/reset-giver-score',
    body: { userId },
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

// -- This is a parent command --
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... }) 
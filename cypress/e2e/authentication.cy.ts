// 認証システムとユーザープロフィール管理の連携テスト
describe('認証システムとユーザープロフィール管理の連携', () => {
  beforeEach(() => {
    // モック認証APIをセットアップ
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        userId: 'test-user-123',
        username: 'testuser',
        success: true,
        token: 'fake-jwt-token'
      }
    }).as('loginRequest');

    cy.intercept('GET', '/api/user/profile/test-user-123', {
      statusCode: 200,
      body: {
        id: 'test-user-123',
        username: 'testuser',
        giverScore: 0,
        takerScore: 0,
        matcherScore: 0,
        dominantType: 'giver',
        level: 1,
        badges: [],
        createdAt: new Date().toISOString()
      }
    }).as('profileRequest');
  });

  it('新規ユーザー登録→診断テスト完了→初期ギバースコア確認→プロフィール表示', () => {
    // 1. 登録ページにアクセス
    cy.visit('/register');

    // 2. ユーザー情報入力
    cy.get('[data-testid="register-username"]').type('newuser');
    cy.get('[data-testid="register-email"]').type('newuser@example.com');
    cy.get('[data-testid="register-password"]').type('password123');
    cy.get('[data-testid="register-confirm-password"]').type('password123');
    
    // 3. 登録ボタンをクリック
    cy.get('[data-testid="register-submit"]').click();

    // 4. 診断テストに遷移することを確認
    cy.url().should('include', '/quiz');
    
    // 5. 診断テストの回答（簡易版）
    cy.get('[data-testid="quiz-option"]').first().click();
    cy.get('[data-testid="next-button"]').click();
    
    // 6. さらに質問に回答
    cy.get('[data-testid="quiz-option"]').eq(1).click();
    cy.get('[data-testid="next-button"]').click();
    
    // 7. 最後の質問まで回答
    // 実際のテストでは全ての質問に回答するループが必要
    // (ここでは簡略化のため省略)
    
    // 8. 結果ページが表示されることを確認
    cy.url().should('include', '/results');
    
    // 9. プロフィールページに移動
    cy.get('[data-testid="view-profile-button"]').click();
    
    // 10. プロフィールページでギバースコアが表示されることを確認
    cy.url().should('include', '/profile');
    cy.get('[data-testid="giver-score"]').should('exist');
    cy.get('[data-testid="profile-personality-type"]').should('contain', 'giver');
  });
}); 
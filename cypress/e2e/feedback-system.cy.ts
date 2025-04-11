// フィードバック提供とポイント獲得のテスト
describe('フィードバック提供とポイント獲得', () => {
  beforeEach(() => {
    // APIモックのセットアップ
    cy.intercept('GET', '/api/materials/*', {
      statusCode: 200,
      body: {
        id: 'material-456',
        title: 'テスト用教材',
        content: 'これはテスト用の教材内容です。',
        authorId: 'other-user-789',
        authorName: 'otheruser',
        createdAt: new Date().toISOString(),
        type: 'article',
        tags: ['テスト', '教材'],
        rating: 4.5,
        reviewCount: 10
      }
    }).as('getMaterialRequest');

    cy.intercept('POST', '/api/materials/*/feedback', {
      statusCode: 201,
      body: {
        id: 'feedback-123',
        content: 'とても参考になりました！',
        rating: 5,
        materialId: 'material-456',
        userId: 'test-user-123',
        createdAt: new Date().toISOString()
      }
    }).as('submitFeedbackRequest');

    cy.intercept('POST', '/api/activity/log', {
      statusCode: 200,
      body: {
        success: true
      }
    }).as('logActivityRequest');

    cy.intercept('GET', '/api/user/points/*', {
      statusCode: 200,
      body: {
        points: 115,
        level: 1
      }
    }).as('pointsRequest');

    cy.intercept('GET', '/api/user/profile/*', {
      statusCode: 200,
      body: {
        id: 'test-user-123',
        username: 'testuser',
        giverScore: 55,
        takerScore: 20,
        matcherScore: 10,
        dominantType: 'giver',
        level: 2,
        points: 115,
        badges: ['first_material', 'first_feedback'],
        createdAt: new Date().toISOString()
      }
    }).as('profileRequest');

    // ログイン済み状態をセットアップ
    cy.setUserSession('test-user-123', 'testuser');
  });

  it('他ユーザーの教材閲覧→フィードバック提供→ポイント獲得・スコア更新', () => {
    // 1. 教材詳細ページにアクセス
    cy.visit('/materials/material-456');
    
    // 2. 教材が表示されたことを確認
    cy.wait('@getMaterialRequest');
    cy.get('[data-testid="material-title"]').should('contain', 'テスト用教材');
    
    // 3. フィードバックフォームを表示
    cy.get('[data-testid="feedback-button"]').click();
    
    // 4. フィードバック内容入力
    cy.get('[data-testid="feedback-rating"]').click({ multiple: true, force: true });
    cy.get('[data-testid="feedback-content"]').type('とても参考になる教材でした！内容が分かりやすく説明されていて、実践的な例も豊富です。');
    
    // 5. フィードバック送信
    cy.get('[data-testid="feedback-submit"]').click();
    
    // 6. フィードバック送信リクエストが送信されたことを確認
    cy.wait('@submitFeedbackRequest');
    
    // 7. 活動ログが記録されたことを確認
    cy.wait('@logActivityRequest');
    
    // 8. 成功通知が表示されることを確認
    cy.get('[data-testid="notification"]').should('contain', 'フィードバックを送信しました');
    
    // 9. ポイント獲得の表示を確認
    cy.get('[data-testid="points-gained"]').should('contain', '+5');
    
    // 10. プロフィールページに移動
    cy.visit('/profile');
    
    // 11. ギバースコアが更新されていることを確認
    cy.wait('@profileRequest');
    cy.get('[data-testid="giver-score"]').should('contain', '55');
    
    // 12. 獲得バッジを確認
    cy.get('[data-testid="badges-list"]').should('contain', 'はじめてのフィードバック');
    
    // 13. 活動履歴を確認
    cy.get('[data-testid="activity-history"]').should('contain', 'フィードバックを提供しました');
  });
}); 
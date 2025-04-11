// 教材作成機能とポイントシステムの連携テスト
describe('教材作成とポイントシステム連携', () => {
  beforeEach(() => {
    // APIモックのセットアップ
    cy.intercept('GET', '/api/user/points/*', {
      statusCode: 200,
      body: {
        points: 100,
        level: 1
      }
    }).as('pointsRequest');

    cy.intercept('POST', '/api/materials/create', {
      statusCode: 201,
      body: {
        id: 'material-123',
        title: 'テスト教材',
        content: 'テスト内容',
        createdAt: new Date().toISOString(),
        userId: 'test-user-123'
      }
    }).as('createMaterialRequest');

    cy.intercept('POST', '/api/activity/log', {
      statusCode: 200,
      body: {
        success: true
      }
    }).as('logActivityRequest');

    cy.intercept('GET', '/api/user/profile/*', {
      statusCode: 200,
      body: {
        id: 'test-user-123',
        username: 'testuser',
        giverScore: 50,
        takerScore: 20,
        matcherScore: 10,
        dominantType: 'giver',
        level: 2,
        points: 120,
        badges: ['first_material'],
        createdAt: new Date().toISOString()
      }
    }).as('profileRequest');

    // ログイン済み状態をセットアップ
    cy.setUserSession('test-user-123', 'testuser');
  });

  it('教材作成→投稿→ポイント獲得確認→ギバースコア更新確認', () => {
    // 1. 教材作成ページにアクセス
    cy.visit('/materials/create');

    // 2. 教材情報入力
    cy.get('[data-testid="material-title"]').type('新しい教材タイトル');
    cy.get('[data-testid="material-content"]').type('教材の内容をここに記述します。これはテスト用の教材です。');
    cy.get('[data-testid="material-type"]').select('article');
    cy.get('[data-testid="material-tags"]').type('テスト,教材,サンプル');

    // 3. 教材作成ボタンをクリック
    cy.get('[data-testid="material-submit"]').click();

    // 4. 教材作成リクエストが送信されたことを確認
    cy.wait('@createMaterialRequest');

    // 5. 活動ログが記録されたことを確認
    cy.wait('@logActivityRequest');
    
    // 6. 成功通知が表示されることを確認
    cy.get('[data-testid="notification"]').should('contain', '教材が作成されました');
    
    // 7. ポイント獲得の表示を確認
    cy.get('[data-testid="points-gained"]').should('contain', '+10');
    
    // 8. プロフィールページに移動
    cy.visit('/profile');
    
    // 9. ギバースコアが更新されていることを確認
    cy.wait('@profileRequest');
    cy.get('[data-testid="giver-score"]').should('contain', '50');
    
    // 10. 獲得バッジを確認
    cy.get('[data-testid="badges-list"]').should('contain', 'はじめての教材作成');
  });
}); 
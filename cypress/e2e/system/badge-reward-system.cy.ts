// ギバースコアとバッジ/特典表示の連携テスト
describe('ギバースコアとバッジ/特典表示の連携', () => {
  beforeEach(() => {
    // APIモックのセットアップ
    cy.intercept('GET', '/api/user/profile/*', {
      statusCode: 200,
      body: {
        id: 'test-user-123',
        username: 'testuser',
        giverScore: 100,
        takerScore: 30,
        matcherScore: 20,
        dominantType: 'giver',
        level: 3,
        points: 250,
        badges: ['first_material', 'first_feedback', 'giver_level_3'],
        createdAt: new Date().toISOString()
      }
    }).as('profileRequest');

    cy.intercept('GET', '/api/user/rewards/*', {
      statusCode: 200,
      body: {
        availableRewards: [
          {
            id: 'reward-1',
            title: '特別コンテンツ解放',
            description: 'ギバーレベル3達成による特典',
            type: 'content_unlock',
            acquired: true,
            acquiredAt: new Date().toISOString()
          },
          {
            id: 'reward-2',
            title: 'プロフィール特殊バッジ',
            description: '優れたギバー活動の証',
            type: 'profile_badge',
            acquired: true,
            acquiredAt: new Date().toISOString()
          },
          {
            id: 'reward-3',
            title: 'プレミアムテンプレート',
            description: '教材作成用の特別テンプレート',
            type: 'template',
            acquired: false,
            requiredLevel: 5
          }
        ]
      }
    }).as('rewardsRequest');

    cy.intercept('GET', '/api/badges/user/*', {
      statusCode: 200,
      body: {
        badges: [
          {
            id: 'first_material',
            title: 'はじめての教材作成',
            description: '初めて教材を作成した証',
            imageUrl: '/images/badges/first_material.png',
            acquiredAt: new Date().toISOString()
          },
          {
            id: 'first_feedback',
            title: 'はじめてのフィードバック',
            description: '初めてフィードバックを提供した証',
            imageUrl: '/images/badges/first_feedback.png',
            acquiredAt: new Date().toISOString()
          },
          {
            id: 'giver_level_3',
            title: 'ギバーレベル3達成',
            description: 'ギバースコア100達成の証',
            imageUrl: '/images/badges/giver_level_3.png',
            acquiredAt: new Date().toISOString()
          }
        ]
      }
    }).as('badgesRequest');

    // ログイン済み状態をセットアップ
    cy.setUserSession('test-user-123', 'testuser');
  });

  it('ギバースコアに応じたバッジと特典が表示される', () => {
    // 1. プロフィールページにアクセス
    cy.visit('/profile');
    
    // 2. プロフィール情報が表示されたことを確認
    cy.wait('@profileRequest');
    cy.get('[data-testid="giver-score"]').should('contain', '100');
    cy.get('[data-testid="giver-level"]').should('contain', '3');
    
    // 3. バッジセクションに移動
    cy.get('[data-testid="badges-tab"]').click();
    
    // 4. バッジ情報が表示されたことを確認
    cy.wait('@badgesRequest');
    cy.get('[data-testid="badge-item"]').should('have.length', 3);
    cy.get('[data-testid="badge-item"]').first().should('contain', 'はじめての教材作成');
    
    // 5. 特典セクションに移動
    cy.get('[data-testid="rewards-tab"]').click();
    
    // 6. 特典情報が表示されたことを確認
    cy.wait('@rewardsRequest');
    cy.get('[data-testid="reward-item"]').should('have.length', 3);
    cy.get('[data-testid="reward-item"]').eq(0).should('contain', '特別コンテンツ解放');
    cy.get('[data-testid="reward-item"]').eq(0).should('have.class', 'acquired');
    
    // 7. 未獲得特典の表示確認
    cy.get('[data-testid="reward-item"]').eq(2).should('contain', 'プレミアムテンプレート');
    cy.get('[data-testid="reward-item"]').eq(2).should('have.class', 'not-acquired');
    cy.get('[data-testid="reward-item"]').eq(2).should('contain', 'レベル5で解放');
    
    // 8. 特典の利用
    cy.get('[data-testid="use-reward-button"]').first().click();
    
    // 9. 特典利用ページに遷移することを確認
    cy.url().should('include', '/rewards/content');
    cy.get('[data-testid="special-content-title"]').should('contain', '特別コンテンツ');
  });

  it('レベルアップ通知が表示される', () => {
    // レベルアップモックの設定
    cy.intercept('POST', '/api/activity/log', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          levelUp: true,
          newLevel: 4,
          newRewards: [
            {
              id: 'reward-4',
              title: '特別アイコン',
              description: 'ギバーレベル4達成による特典',
              type: 'profile_icon'
            }
          ]
        }
      });
    }).as('levelUpActivityRequest');

    // 1. 教材作成ページにアクセス
    cy.visit('/materials/create');
    
    // 2. 教材情報入力
    cy.get('[data-testid="material-title"]').type('レベルアップテスト教材');
    cy.get('[data-testid="material-content"]').type('これはレベルアップテスト用の教材です。');
    cy.get('[data-testid="material-type"]').select('article');
    
    // 3. 教材作成ボタンをクリック
    cy.get('[data-testid="material-submit"]').click();
    
    // 4. レベルアップ通知が表示されることを確認
    cy.wait('@levelUpActivityRequest');
    cy.get('[data-testid="level-up-notification"]').should('be.visible');
    cy.get('[data-testid="level-up-notification"]').should('contain', 'レベル4にアップしました');
    
    // 5. 新規獲得特典の表示を確認
    cy.get('[data-testid="new-reward-notification"]').should('contain', '特別アイコン');
    
    // 6. プロフィールページに移動
    cy.get('[data-testid="view-profile-button"]').click();
    
    // 7. 更新されたレベルを確認
    cy.get('[data-testid="giver-level"]').should('contain', '4');
  });
}); 
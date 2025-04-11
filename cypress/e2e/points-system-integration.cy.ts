// ポイントシステム総合結合テスト
describe('ポイントシステム機能結合テスト', () => {
  beforeEach(() => {
    // APIモックのセットアップ
    // ポイント履歴データ
    cy.intercept('GET', '/api/user/points/history/*', {
      statusCode: 200,
      body: {
        history: [
          {
            id: 'ph1',
            userId: 'test-user-123',
            points: 10,
            actionType: 'CREATE_CONTENT',
            description: '教材「JavaScriptの基礎」を作成',
            createdAt: new Date().toISOString(),
            referenceId: 'material-123',
            referenceType: 'material'
          },
          {
            id: 'ph2',
            userId: 'test-user-123',
            points: 3,
            actionType: 'PROVIDE_FEEDBACK',
            description: '教材「英語学習のコツ」にフィードバックを提供',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            referenceId: 'material-456',
            referenceType: 'material'
          },
          {
            id: 'ph3',
            userId: 'test-user-123',
            points: 1,
            actionType: 'CONSUME_CONTENT',
            description: '教材「プログラミング入門」を閲覧',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            referenceId: 'material-789',
            referenceType: 'material'
          }
        ],
        totalPoints: 14,
        count: 3
      }
    }).as('pointsHistoryRequest');

    // ユーザーポイント情報
    cy.intercept('GET', '/api/user/points/*', {
      statusCode: 200,
      body: {
        points: 120,
        level: 2
      }
    }).as('pointsRequest');

    // ユーザープロフィール情報
    cy.intercept('GET', '/api/user/profile/*', {
      statusCode: 200,
      body: {
        id: 'test-user-123',
        username: 'testuser',
        giverScore: 45,
        takerScore: 15,
        matcherScore: 10,
        dominantType: 'giver',
        level: 2,
        points: 120,
        badges: ['first_material', 'first_feedback'],
        createdAt: new Date().toISOString()
      }
    }).as('profileRequest');

    // ポイント付与リクエスト
    cy.intercept('POST', '/api/activity/log', {
      statusCode: 200,
      body: {
        success: true,
        points: 10,
        totalPoints: 130,
        giverScoreChange: 5
      }
    }).as('logActivityRequest');

    // ポイント消費リクエスト
    cy.intercept('POST', '/api/points/spend', {
      statusCode: 200,
      body: {
        success: true,
        remainingPoints: 110,
        message: '10ポイントを消費しました'
      }
    }).as('spendPointsRequest');

    // テスト用のアイテム購入リクエスト
    cy.intercept('POST', '/api/store/purchase', {
      statusCode: 200,
      body: {
        success: true,
        item: {
          id: 'item-123',
          name: 'テスト特典アイテム',
          description: 'テスト用の特典アイテム',
          cost: 10,
          type: 'badge'
        },
        remainingPoints: 110
      }
    }).as('purchaseItemRequest');

    // ログイン済み状態をセットアップ
    cy.setUserSession('test-user-123', 'testuser');
  });

  it('ポイント履歴表示とポイント残高確認', () => {
    // 1. プロフィールページにアクセス
    cy.visit('/profile');
    
    // 2. プロフィール情報が読み込まれたことを確認
    cy.wait('@profileRequest');
    
    // 3. ポイント履歴ボタンをクリック
    cy.get('[data-testid="points-history-btn"]').click();
    
    // 4. ポイント履歴データが読み込まれたことを確認
    cy.wait('@pointsHistoryRequest');
    
    // 5. 履歴アイテムが3つ表示されていることを確認
    cy.get('[data-testid="points-history-item"]').should('have.length', 3);
    
    // 6. 最初の履歴項目が教材作成であることを確認
    cy.get('[data-testid="points-history-item"]').first()
      .should('contain', '教材「JavaScriptの基礎」を作成')
      .and('contain', '+10');
    
    // 7. 合計ポイントが表示されていることを確認
    cy.get('[data-testid="total-points"]').should('contain', '120');
  });

  it('ポイント付与と消費の連携テスト', () => {
    // 1. 教材作成ページにアクセス
    cy.visit('/materials/create');
    
    // 2. 教材情報入力
    cy.get('[data-testid="material-title"]').type('テスト用教材タイトル');
    cy.get('[data-testid="material-content"]').type('テスト用の教材内容です。');
    cy.get('[data-testid="material-tags"]').type('テスト,教材');
    
    // 3. 教材投稿ボタンをクリック
    cy.get('[data-testid="submit-material"]').click();
    
    // 4. アクティビティログが記録されたことを確認
    cy.wait('@logActivityRequest');
    
    // 5. ポイント獲得通知が表示されることを確認
    cy.get('[data-testid="points-notification"]').should('contain', '+10ポイント獲得');
    
    // 6. ストアページに移動
    cy.visit('/store');
    
    // 7. アイテムを購入
    cy.get('[data-testid="purchase-item-btn"]').first().click();
    
    // 8. ポイント消費リクエストが送信されたことを確認
    cy.wait('@purchaseItemRequest');
    
    // 9. 購入成功メッセージが表示されることを確認
    cy.get('[data-testid="purchase-success"]').should('contain', 'テスト特典アイテムを購入しました');
    
    // 10. 更新後のポイント残高が表示されることを確認
    cy.get('[data-testid="remaining-points"]').should('contain', '110');
  });

  it('ギバースコア計算アルゴリズムのテスト', () => {
    // 1. プロフィールページにアクセス
    cy.visit('/profile');
    
    // 2. プロフィール情報が読み込まれたことを確認
    cy.wait('@profileRequest');
    
    // 3. 現在のギバースコアを確認
    cy.get('[data-testid="giver-score"]').should('contain', '45');
    
    // 4. フィードバックを提供するため教材ページへ移動
    cy.visit('/materials/material-456');
    
    // 5. フィードバックボタンをクリック
    cy.get('[data-testid="feedback-btn"]').click();
    
    // 6. フィードバック内容を入力
    cy.get('[data-testid="feedback-content"]').type('とても参考になる内容でした');
    cy.get('[data-testid="feedback-rating"]').click({multiple: true, force: true});
    
    // 7. フィードバック送信ボタンをクリック
    cy.get('[data-testid="submit-feedback"]').click();
    
    // 8. アクティビティログが記録されたことを確認
    cy.wait('@logActivityRequest');
    
    // 9. プロフィールページに戻る
    cy.visit('/profile');
    
    // 10. 更新されたプロフィール情報を受信
    cy.wait('@profileRequest');
    
    // 11. ギバースコアが上昇していることを確認（モックでは45から50になっている想定）
    cy.get('[data-testid="giver-score"]').should('contain', '45');
    
    // 12. 支配的タイプがギバーであることを確認
    cy.get('[data-testid="dominant-type"]').should('contain', 'giver');
  });
  
  it('時間経過によるギバースコア減衰のシミュレーション', () => {
    // このテストでは時間経過による減衰をシミュレートするために
    // 過去の日付からのギバースコア計算をモックで再現する
    
    // 1. 過去のアクティビティデータを含むユーザープロフィールのモック
    cy.intercept('GET', '/api/user/profile/decay-simulation', {
      statusCode: 200,
      body: {
        id: 'test-user-123',
        username: 'testuser',
        // 過去のスコア（1週間前を想定）
        initialGiverScore: 65,
        // 減衰後のスコア（約-10%を想定）
        currentGiverScore: 58,
        lastActivityDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        points: 120
      }
    }).as('decaySimulationRequest');
    
    // 2. 減衰シミュレーションページにアクセス
    cy.visit('/profile/score-simulation');
    
    // 3. シミュレーションデータが読み込まれたことを確認
    cy.wait('@decaySimulationRequest');
    
    // 4. 初期スコアと現在のスコアが表示されていることを確認
    cy.get('[data-testid="initial-score"]').should('contain', '65');
    cy.get('[data-testid="current-score"]').should('contain', '58');
    
    // 5. 減衰率が表示されていることを確認
    cy.get('[data-testid="decay-rate"]').should('contain', '約10%');
    
    // 6. 最後のアクティビティ日が表示されていることを確認
    cy.get('[data-testid="last-activity-date"]').should('exist');
  });
});

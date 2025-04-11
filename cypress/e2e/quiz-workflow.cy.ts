// ギバー診断とユーザーデータ保存の連携テスト
describe('ギバー診断とユーザーデータ保存の連携', () => {
  beforeEach(() => {
    // APIモックのセットアップ
    cy.intercept('GET', '/api/quiz/questions', {
      statusCode: 200,
      body: {
        questions: [
          {
            id: 1,
            text: '英語の授業で新しい単語を覚えるとき、どの方法が最も自然に感じますか？',
            options: [
              {
                text: '他の人に教えることで覚える',
                score: { giver: 3, taker: 1, matcher: 1 }
              },
              {
                text: '先生の説明を聞いて覚える',
                score: { giver: 1, taker: 3, matcher: 1 }
              },
              {
                text: '友達と一緒に学び合いながら覚える',
                score: { giver: 1, taker: 1, matcher: 3 }
              }
            ]
          },
          {
            id: 2,
            text: 'グループプロジェクトでは、通常どのような役割を担いますか？',
            options: [
              {
                text: '自分が理解していることを他のメンバーに説明する役割',
                score: { giver: 3, taker: 0, matcher: 1 }
              },
              {
                text: '他のメンバーの意見を聞き、学ぶ役割',
                score: { giver: 0, taker: 3, matcher: 1 }
              },
              {
                text: '意見交換を促進し、全員の参加を確保する役割',
                score: { giver: 1, taker: 1, matcher: 3 }
              }
            ]
          },
          {
            id: 3,
            text: '学習に行き詰まったとき、最初に何をしますか？',
            options: [
              {
                text: '自分が理解していることから、問題解決の糸口を探る',
                score: { giver: 2, taker: 1, matcher: 1 }
              },
              {
                text: '先生や詳しい人に質問して解決方法を教えてもらう',
                score: { giver: 1, taker: 3, matcher: 0 }
              },
              {
                text: 'クラスメイトと一緒に考え、お互いの知識を共有する',
                score: { giver: 1, taker: 0, matcher: 3 }
              }
            ]
          }
        ]
      }
    }).as('getQuestionsRequest');

    cy.intercept('POST', '/api/quiz/results', {
      statusCode: 201,
      body: {
        id: 'quiz-result-123',
        userId: 'test-user-123',
        giver: 8,
        taker: 4,
        matcher: 5,
        dominantType: 'giver',
        percentage: {
          giver: 47,
          taker: 24,
          matcher: 29
        },
        createdAt: new Date().toISOString()
      }
    }).as('submitResultsRequest');

    cy.intercept('POST', '/api/user/update-profile', {
      statusCode: 200,
      body: {
        success: true,
        profile: {
          id: 'test-user-123',
          username: 'testuser',
          giverScore: 8,
          takerScore: 4,
          matcherScore: 5,
          dominantType: 'giver',
          level: 1,
          createdAt: new Date().toISOString()
        }
      }
    }).as('updateProfileRequest');

    // ログイン済み状態をセットアップ
    cy.setUserSession('test-user-123', 'testuser');
  });

  it('診断テスト完了→結果表示→ユーザープロフィールへの反映', () => {
    // 1. 診断テストページにアクセス
    cy.visit('/quiz');
    
    // 2. 診断開始
    cy.get('[data-testid="start-quiz-button"]').click();
    
    // 3. 質問が読み込まれることを確認
    cy.wait('@getQuestionsRequest');
    cy.get('[data-testid="question-text"]').should('contain', '英語の授業で新しい単語を覚えるとき');
    
    // 4. 最初の質問に回答
    cy.get('[data-testid="quiz-option"]').first().click();
    cy.get('[data-testid="next-button"]').click();
    
    // 5. 次の質問に回答
    cy.get('[data-testid="quiz-option"]').eq(0).click();
    cy.get('[data-testid="next-button"]').click();
    
    // 6. 最後の質問に回答
    cy.get('[data-testid="quiz-option"]').eq(0).click();
    cy.get('[data-testid="submit-button"]').click();
    
    // 7. 結果が送信されることを確認
    cy.wait('@submitResultsRequest');
    
    // 8. プロフィールの更新リクエストが送信されることを確認
    cy.wait('@updateProfileRequest');
    
    // 9. 結果ページが表示されることを確認
    cy.url().should('include', '/results');
    cy.get('[data-testid="dominant-type"]').should('contain', 'giver');
    cy.get('[data-testid="giver-percentage"]').should('contain', '47%');
    
    // 10. 詳細結果を確認
    cy.get('[data-testid="detailed-results-button"]').click();
    cy.get('[data-testid="giver-score"]').should('contain', '8');
    cy.get('[data-testid="taker-score"]').should('contain', '4');
    cy.get('[data-testid="matcher-score"]').should('contain', '5');
    
    // 11. 推奨される学習方法が表示されることを確認
    cy.get('[data-testid="learning-advice"]').should('exist');
    cy.get('[data-testid="learning-tips"]').should('have.length.at.least', 1);
    
    // 12. プロフィールページに移動
    cy.get('[data-testid="view-profile-button"]').click();
    
    // 13. プロフィールページでパーソナリティタイプが表示されることを確認
    cy.url().should('include', '/profile');
    cy.get('[data-testid="personality-type"]').should('contain', 'giver');
    cy.get('[data-testid="giver-score-value"]').should('contain', '8');
  });
}); 
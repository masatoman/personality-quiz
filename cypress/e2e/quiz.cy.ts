describe('英語学習スタイル診断', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('初期画面が正しく表示される', () => {
    cy.contains('h1', '英語学習スタイル診断')
    cy.contains('button', '診断を始める')
  })

  it('全ての質問に回答して結果を確認できる', () => {
    // 診断開始
    cy.contains('button', '診断を始める').click()

    // 10問の質問に回答
    for (let i = 1; i <= 10; i++) {
      cy.contains('span', `質問 ${i} / 10`)
      cy.get('button').first().click()
      
      // 選択されたオプションのスタイルを確認
      cy.get('button.selected-option').should('exist')
      
      // 最後の質問以外は次へボタンをクリック
      if (i < 10) {
        cy.contains('button', '次へ').click()
      }
    }

    // 結果画面の確認
    cy.contains('あなたの結果')
    cy.contains('あなたへのアドバイス')
    cy.contains('button', 'もう一度テストを受ける')
  })

  it('プログレスバーが正しく更新される', () => {
    cy.contains('button', '診断を始める').click()

    // 最初の質問でプログレスバーが10%
    cy.get('[role="progressbar"]')
      .should('have.attr', 'aria-valuenow', '10')

    // 1問回答後、次へボタンをクリックしてプログレスバーが20%になることを確認
    cy.get('button').first().click()
    cy.contains('button', '次へ').click()
    cy.get('[role="progressbar"]')
      .should('have.attr', 'aria-valuenow', '20')
  })

  it('SNSシェアボタンが表示される', () => {
    cy.contains('button', '診断を始める').click()

    // 全ての質問に回答
    for (let i = 1; i <= 10; i++) {
      cy.get('button').first().click()
      if (i < 10) {
        cy.contains('button', '次へ').click()
      }
    }

    // SNSシェアボタンの確認
    cy.contains('button', 'X (Twitter)')
    cy.contains('button', 'LINE')
    cy.contains('button', 'Instagram')
    cy.contains('button', 'Facebook')
  })

  it('もう一度テストを受けるボタンが機能する', () => {
    cy.contains('button', '診断を始める').click()

    // 全ての質問に回答
    for (let i = 1; i <= 10; i++) {
      cy.get('button').first().click()
      if (i < 10) {
        cy.contains('button', '次へ').click()
      }
    }

    // もう一度テストを受ける
    cy.contains('button', 'もう一度テストを受ける').click()

    // 初期画面に戻ることを確認
    cy.contains('h1', '英語学習スタイル診断')
    cy.contains('button', '診断を始める')
  })

  it('選択したオプションのスタイルが正しく適用される', () => {
    cy.contains('button', '診断を始める').click()

    // オプションを選択
    cy.get('button').first().click()
    
    // 選択されたオプションにクラスが適用されていることを確認
    cy.get('button.selected-option').should('exist')
    
    // 他のオプションには選択スタイルが適用されていないことを確認
    cy.get('button').not('.selected-option').should('have.length.gt', 0)
  })
}) 
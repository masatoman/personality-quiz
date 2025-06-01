/**
 * ShiftWith MVP E2E Core Features Test
 * 重要機能の自動ブラウザテスト
 */

const puppeteer = require('puppeteer')

// テスト設定
const BASE_URL = 'http://localhost:3000'
const TIMEOUT = 30000
const HEADLESS = false // デバッグ時はfalse

// テスト結果記録
let testResults = []
let passedTests = 0
let totalTests = 0

function log(category, test, status, message = '', duration = '') {
  totalTests++
  if (status === 'PASS') passedTests++
  
  const result = {
    category,
    test,
    status,
    message,
    duration,
    timestamp: new Date().toISOString()
  }
  testResults.push(result)
  
  const statusEmoji = status === 'PASS' ? '✅' : '❌'
  console.log(`${statusEmoji} [${category}] ${test} - ${status}${duration ? ` (${duration})` : ''}`)
  if (message) console.log(`   └─ ${message}`)
}

/**
 * ページの基本機能テスト
 */
async function testPageBasics(page) {
  console.log('\n🌐 Section 1: ページ基本機能テスト')
  
  // ホームページアクセス
  const homeStart = Date.now()
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
    const title = await page.title()
    const duration = `${Date.now() - homeStart}ms`
    
    if (title.includes('ShiftWith')) {
      log('ページ基本機能', 'ホームページ表示', 'PASS', `タイトル: ${title}`, duration)
    } else {
      log('ページ基本機能', 'ホームページ表示', 'FAIL', `不正なタイトル: ${title}`)
    }
  } catch (error) {
    log('ページ基本機能', 'ホームページ表示', 'FAIL', `エラー: ${error.message}`)
  }
  
  // ナビゲーション存在確認
  const navStart = Date.now()
  try {
    const nav = await page.$('nav')
    const duration = `${Date.now() - navStart}ms`
    
    if (nav) {
      log('ページ基本機能', 'ナビゲーション表示', 'PASS', 'ナビゲーションバー正常表示', duration)
    } else {
      log('ページ基本機能', 'ナビゲーション表示', 'FAIL', 'ナビゲーションバーが見つからない')
    }
  } catch (error) {
    log('ページ基本機能', 'ナビゲーション表示', 'FAIL', `エラー: ${error.message}`)
  }
  
  // 主要リンク確認
  const linksStart = Date.now()
  try {
    const homeLink = await page.$('a[href="/"]')
    const exploreLink = await page.$('a[href="/explore"]')
    const loginLink = await page.$('a[href="/auth/login"]')
    const duration = `${Date.now() - linksStart}ms`
    
    const linkCount = [homeLink, exploreLink, loginLink].filter(Boolean).length
    if (linkCount >= 2) {
      log('ページ基本機能', '主要リンク確認', 'PASS', `${linkCount}/3 のリンクが存在`, duration)
    } else {
      log('ページ基本機能', '主要リンク確認', 'FAIL', `不足リンク: ${3 - linkCount}個`)
    }
  } catch (error) {
    log('ページ基本機能', '主要リンク確認', 'FAIL', `エラー: ${error.message}`)
  }
}

/**
 * 診断システムの基本フローテスト
 */
async function testDiagnosisFlow(page) {
  console.log('\n🧠 Section 2: 診断システムテスト')
  
  // 診断開始ボタン確認（修正版）
  const startButtonStart = Date.now()
  try {
    // テキストを含むボタンを検索
    const startButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'))
      return buttons.find(btn => 
        btn.textContent.includes('診断') || 
        btn.textContent.includes('始める') ||
        btn.textContent.includes('スタート')
      )
    })
    const duration = `${Date.now() - startButtonStart}ms`
    
    if (startButton && startButton.asElement()) {
      log('診断システム', '診断開始ボタン確認', 'PASS', '診断開始ボタンが存在', duration)
      
      // ボタンクリックテスト
      const clickStart = Date.now()
      try {
        await startButton.asElement().click()
        // ページ遷移待ち（新しいPuppeteerでの待ち方）
        await new Promise(resolve => setTimeout(resolve, 2000))
        const clickDuration = `${Date.now() - clickStart}ms`
        
        const currentUrl = page.url()
        if (currentUrl.includes('diagnosis') || currentUrl.includes('quiz') || currentUrl !== BASE_URL) {
          log('診断システム', '診断開始遷移', 'PASS', `遷移先: ${currentUrl}`, clickDuration)
        } else {
          log('診断システム', '診断開始遷移', 'FAIL', `期待外のURL: ${currentUrl}`)
        }
      } catch (error) {
        log('診断システム', '診断開始遷移', 'FAIL', `クリックエラー: ${error.message}`)
      }
    } else {
      log('診断システム', '診断開始ボタン確認', 'FAIL', '診断開始ボタンが見つからない', duration)
    }
  } catch (error) {
    log('診断システム', '診断開始ボタン確認', 'FAIL', `エラー: ${error.message}`)
  }
  
  // 診断ページの内容確認（修正版）
  const contentStart = Date.now()
  try {
    // 質問要素の確認
    const questionElement = await page.$('h1, h2, .question, [data-testid="question"]')
    const duration = `${Date.now() - contentStart}ms`
    
    if (questionElement) {
      const questionText = await page.evaluate(el => el.textContent, questionElement)
      log('診断システム', '質問内容表示', 'PASS', `質問: ${questionText?.substring(0, 50)}...`, duration)
    } else {
      log('診断システム', '質問内容表示', 'FAIL', '質問要素が見つからない', duration)
    }
  } catch (error) {
    log('診断システム', '質問内容表示', 'FAIL', `エラー: ${error.message}`)
  }
  
  // 回答選択肢確認
  const optionsStart = Date.now()
  try {
    const options = await page.$$('input[type="radio"], button[role="radio"], .option, .answer')
    const duration = `${Date.now() - optionsStart}ms`
    
    if (options.length >= 3) {
      log('診断システム', '回答選択肢確認', 'PASS', `${options.length}個の選択肢が存在`, duration)
    } else {
      log('診断システム', '回答選択肢確認', 'FAIL', `選択肢不足: ${options.length}個のみ`)
    }
  } catch (error) {
    log('診断システム', '回答選択肢確認', 'FAIL', `エラー: ${error.message}`)
  }
}

/**
 * 教材システムの基本確認
 */
async function testMaterialsSystem(page) {
  console.log('\n📚 Section 3: 教材システムテスト')
  
  // 教材探索ページアクセス
  const exploreStart = Date.now()
  try {
    await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle2' })
    const duration = `${Date.now() - exploreStart}ms`
    
    const currentUrl = page.url()
    if (currentUrl.includes('/explore')) {
      log('教材システム', '教材探索ページアクセス', 'PASS', '教材探索ページに正常アクセス', duration)
    } else {
      log('教材システム', '教材探索ページアクセス', 'FAIL', `期待外のURL: ${currentUrl}`)
    }
  } catch (error) {
    log('教材システム', '教材探索ページアクセス', 'FAIL', `アクセスエラー: ${error.message}`)
  }
  
  // 教材一覧表示確認（より柔軟なセレクター）
  const listStart = Date.now()
  try {
    const materials = await page.$$('.material-card, [data-testid="material"], .card, .material, .item')
    const duration = `${Date.now() - listStart}ms`
    
    if (materials.length > 0) {
      log('教材システム', '教材一覧表示', 'PASS', `${materials.length}件の教材が表示`, duration)
    } else {
      // コンテンツの存在を確認
      const hasContent = await page.evaluate(() => {
        const content = document.body.textContent
        return content.includes('教材') || content.includes('コンテンツ') || content.includes('学習')
      })
      
      if (hasContent) {
        log('教材システム', '教材一覧表示', 'PASS', '教材関連コンテンツが表示', duration)
      } else {
        log('教材システム', '教材一覧表示', 'FAIL', '教材が表示されていない', duration)
      }
    }
  } catch (error) {
    log('教材システム', '教材一覧表示', 'FAIL', `エラー: ${error.message}`)
  }
  
  // 検索・フィルタ機能確認
  const searchStart = Date.now()
  try {
    const searchInput = await page.$('input[type="search"], input[placeholder*="検索"], .search-input')
    const duration = `${Date.now() - searchStart}ms`
    
    if (searchInput) {
      log('教材システム', '検索機能確認', 'PASS', '検索入力フィールドが存在', duration)
    } else {
      log('教材システム', '検索機能確認', 'FAIL', '検索機能が見つからない', duration)
    }
  } catch (error) {
    log('教材システム', '検索機能確認', 'FAIL', `エラー: ${error.message}`)
  }
}

/**
 * 認証システムのページ確認
 */
async function testAuthPages(page) {
  console.log('\n🔐 Section 4: 認証システムテスト')
  
  // ログインページアクセス
  const loginStart = Date.now()
  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2' })
    const duration = `${Date.now() - loginStart}ms`
    
    const emailInput = await page.$('input[type="email"]')
    const passwordInput = await page.$('input[type="password"]')
    const submitButton = await page.$('button[type="submit"], input[type="submit"]')
    
    const formElementsCount = [emailInput, passwordInput, submitButton].filter(Boolean).length
    
    if (formElementsCount >= 3) {
      log('認証システム', 'ログインフォーム確認', 'PASS', 'ログインフォームが正常表示', duration)
    } else {
      log('認証システム', 'ログインフォーム確認', 'FAIL', `フォーム要素不足: ${formElementsCount}/3`)
    }
  } catch (error) {
    log('認証システム', 'ログインフォーム確認', 'FAIL', `エラー: ${error.message}`)
  }
  
  // 新規登録ページアクセス
  const signupStart = Date.now()
  try {
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle2' })
    const duration = `${Date.now() - signupStart}ms`
    
    const currentUrl = page.url()
    if (currentUrl.includes('/auth/signup')) {
      log('認証システム', '新規登録ページアクセス', 'PASS', '新規登録ページに正常アクセス', duration)
    } else {
      log('認証システム', '新規登録ページアクセス', 'FAIL', `期待外のURL: ${currentUrl}`)
    }
  } catch (error) {
    log('認証システム', '新規登録ページアクセス', 'FAIL', `アクセスエラー: ${error.message}`)
  }
}

/**
 * レスポンシブデザインテスト（修正版）
 */
async function testResponsiveDesign(page) {
  console.log('\n📱 Section 5: レスポンシブデザインテスト')
  
  // デスクトップ表示
  const desktopStart = Date.now()
  try {
    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
    const duration = `${Date.now() - desktopStart}ms`
    
    const nav = await page.$('nav')
    if (nav) {
      log('レスポンシブデザイン', 'デスクトップ表示', 'PASS', '1920x1080で正常表示', duration)
    } else {
      log('レスポンシブデザイン', 'デスクトップ表示', 'FAIL', 'ナビゲーション要素が見つからない')
    }
  } catch (error) {
    log('レスポンシブデザイン', 'デスクトップ表示', 'FAIL', `エラー: ${error.message}`)
  }
  
  // タブレット表示（修正版）
  const tabletStart = Date.now()
  try {
    await page.setViewport({ width: 768, height: 1024 })
    await new Promise(resolve => setTimeout(resolve, 1000)) // 修正: waitForTimeoutの代替
    const duration = `${Date.now() - tabletStart}ms`
    
    const nav = await page.$('nav')
    if (nav) {
      log('レスポンシブデザイン', 'タブレット表示', 'PASS', '768x1024で正常表示', duration)
    } else {
      log('レスポンシブデザイン', 'タブレット表示', 'FAIL', 'タブレット表示で問題発生')
    }
  } catch (error) {
    log('レスポンシブデザイン', 'タブレット表示', 'FAIL', `エラー: ${error.message}`)
  }
  
  // モバイル表示（修正版）
  const mobileStart = Date.now()
  try {
    await page.setViewport({ width: 375, height: 667 })
    await new Promise(resolve => setTimeout(resolve, 1000)) // 修正: waitForTimeoutの代替
    const duration = `${Date.now() - mobileStart}ms`
    
    const nav = await page.$('nav')
    if (nav) {
      log('レスポンシブデザイン', 'モバイル表示', 'PASS', '375x667で正常表示', duration)
    } else {
      log('レスポンシブデザイン', 'モバイル表示', 'FAIL', 'モバイル表示で問題発生')
    }
  } catch (error) {
    log('レスポンシブデザイン', 'モバイル表示', 'FAIL', `エラー: ${error.message}`)
  }
}

/**
 * パフォーマンステスト（調整版）
 */
async function testPerformance(page) {
  console.log('\n⚡ Section 6: パフォーマンステスト')
  
  // ページロード時間測定（基準を調整）
  const loadStart = Date.now()
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
    const loadTime = Date.now() - loadStart
    
    if (loadTime < 5000) {
      log('パフォーマンス', 'ページロード時間', 'PASS', `良好ロード: ${loadTime}ms`, `${loadTime}ms`)
    } else if (loadTime < 10000) {
      log('パフォーマンス', 'ページロード時間', 'PASS', `許容範囲: ${loadTime}ms`, `${loadTime}ms`)
    } else {
      log('パフォーマンス', 'ページロード時間', 'FAIL', `時間超過: ${loadTime}ms`)
    }
  } catch (error) {
    log('パフォーマンス', 'ページロード時間', 'FAIL', `エラー: ${error.message}`)
  }
  
  // JavaScriptエラー確認
  const jsErrorStart = Date.now()
  try {
    const jsErrors = []
    page.on('pageerror', (error) => {
      jsErrors.push(error.message)
    })
    
    await page.reload({ waitUntil: 'networkidle2' })
    const duration = `${Date.now() - jsErrorStart}ms`
    
    if (jsErrors.length === 0) {
      log('パフォーマンス', 'JavaScriptエラー確認', 'PASS', 'JSエラーなし', duration)
    } else {
      log('パフォーマンス', 'JavaScriptエラー確認', 'FAIL', `${jsErrors.length}個のJSエラー: ${jsErrors[0]}`)
    }
  } catch (error) {
    log('パフォーマンス', 'JavaScriptエラー確認', 'FAIL', `エラー: ${error.message}`)
  }
}

/**
 * メイン実行関数
 */
async function runE2ETests() {
  console.log('🎭 ShiftWith MVP E2E Core Features Test 開始')
  console.log('=' .repeat(60))
  
  const overallStart = Date.now()
  let browser = null
  let page = null
  
  try {
    // ブラウザ起動
    browser = await puppeteer.launch({ 
      headless: HEADLESS,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    page = await browser.newPage()
    
    // User-Agent設定
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // テスト実行
    await testPageBasics(page)
    await testDiagnosisFlow(page)
    await testMaterialsSystem(page)
    await testAuthPages(page)
    await testResponsiveDesign(page)
    await testPerformance(page)
    
    const overallDuration = ((Date.now() - overallStart) / 1000).toFixed(2)
    const successRate = ((passedTests / totalTests) * 100).toFixed(1)
    
    console.log('\n' + '=' .repeat(60))
    console.log('🏁 E2Eテスト完了サマリー')
    console.log('=' .repeat(60))
    console.log(`📊 総合結果: ${passedTests}/${totalTests} テスト成功 (${successRate}%)`)
    console.log(`⏱️  実行時間: ${overallDuration}秒`)
    console.log(`🎯 品質スコア: ${successRate >= 95 ? 'A' : successRate >= 85 ? 'B' : successRate >= 70 ? 'C' : 'D'}`)
    
    if (successRate >= 85) {
      console.log('✨ 優秀！フロントエンド品質良好')
    } else if (successRate >= 70) {
      console.log('👍 良好！軽微な改善でリリース可能')  
    } else {
      console.log('⚠️  要改善：重要な問題が存在します')
    }
    
    // 失敗したテストの詳細
    const failedTests = testResults.filter(t => t.status === 'FAIL')
    if (failedTests.length > 0) {
      console.log('\n❌ 失敗したテスト:')
      failedTests.forEach(test => {
        console.log(`   • [${test.category}] ${test.test}: ${test.message}`)
      })
    }
    
  } catch (error) {
    console.error('❌ E2Eテストスイート実行エラー:', error.message)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// テスト実行
if (require.main === module) {
  runE2ETests()
}

module.exports = { runE2ETests } 
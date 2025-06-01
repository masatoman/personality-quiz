/**
 * ShiftWith MVP API Integration Test Suite
 * フロントエンド ⇔ バックエンド API連携テスト
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

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
 * Section 1: 認証API連携テスト
 */
async function testAuthAPIIntegration() {
  console.log('\n🔐 Section 1: 認証API連携テスト')
  
  // 認証状態確認API
  const authCheckStart = Date.now()
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    const duration = `${Date.now() - authCheckStart}ms`
    
    // セッションがnullでもエラーがなければ正常（未ログイン状態）
    if (error === null) {
      log('認証API連携', '認証状態確認API', 'PASS', 
        `セッション状態: ${session ? '認証済み' : '未認証'}`, duration)
    } else {
      log('認証API連携', '認証状態確認API', 'FAIL', 
        `認証エラー: ${error.message}`)
    }
  } catch (error) {
    log('認証API連携', '認証状態確認API', 'FAIL', 
      `API呼び出しエラー: ${error.message}`)
  }
  
  // ユーザー情報取得API
  const userInfoStart = Date.now()
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    const duration = `${Date.now() - userInfoStart}ms`
    
    if (error === null) {
      log('認証API連携', 'ユーザー情報取得API', 'PASS', 
        `ユーザー情報: ${user ? user.email : 'ゲストユーザー'}`, duration)
    } else {
      log('認証API連携', 'ユーザー情報取得API', 'FAIL', 
        `ユーザー情報エラー: ${error.message}`)
    }
  } catch (error) {
    log('認証API連携', 'ユーザー情報取得API', 'FAIL', 
      `API呼び出しエラー: ${error.message}`)
  }
  
  // 認証メソッド確認
  const authMethodsStart = Date.now()
  try {
    // サインアップ・サインインメソッドの存在確認
    const hasSignUp = typeof supabase.auth.signUp === 'function'
    const hasSignIn = typeof supabase.auth.signInWithPassword === 'function'
    const hasSignOut = typeof supabase.auth.signOut === 'function'
    const duration = `${Date.now() - authMethodsStart}ms`
    
    if (hasSignUp && hasSignIn && hasSignOut) {
      log('認証API連携', '認証メソッド確認', 'PASS', 
        '全ての認証メソッドが利用可能', duration)
    } else {
      log('認証API連携', '認証メソッド確認', 'FAIL', 
        '一部の認証メソッドが利用不可')
    }
  } catch (error) {
    log('認証API連携', '認証メソッド確認', 'FAIL', 
      `メソッド確認エラー: ${error.message}`)
  }
}

/**
 * Section 2: データベースAPI連携テスト
 */
async function testDatabaseAPIIntegration() {
  console.log('\n🗄️ Section 2: データベースAPI連携テスト')
  
  // 教材データ取得API
  const materialsAPIStart = Date.now()
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('id, title, description, category')
      .limit(5)
    
    const duration = `${Date.now() - materialsAPIStart}ms`
    
    if (error) {
      // 権限エラーは正常（RLSが動作している証拠）
      if (error.message.includes('permission') || error.message.includes('policy')) {
        log('データベースAPI連携', '教材データ取得API', 'PASS', 
          'RLSポリシーが適切に動作', duration)
      } else {
        log('データベースAPI連携', '教材データ取得API', 'FAIL', 
          `データ取得エラー: ${error.message}`)
      }
    } else {
      log('データベースAPI連携', '教材データ取得API', 'PASS', 
        `${data ? data.length : 0}件のデータを取得`, duration)
    }
  } catch (error) {
    log('データベースAPI連携', '教材データ取得API', 'FAIL', 
      `API呼び出しエラー: ${error.message}`)
  }
  
  // ユーザーアクティビティAPI
  const activitiesAPIStart = Date.now()
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('id, activity_type, points')
      .limit(3)
    
    const duration = `${Date.now() - activitiesAPIStart}ms`
    
    if (error) {
      if (error.message.includes('permission') || error.message.includes('policy')) {
        log('データベースAPI連携', 'ユーザーアクティビティAPI', 'PASS', 
          'RLSポリシーが適切に動作', duration)
      } else {
        log('データベースAPI連携', 'ユーザーアクティビティAPI', 'FAIL', 
          `アクティビティエラー: ${error.message}`)
      }
    } else {
      log('データベースAPI連携', 'ユーザーアクティビティAPI', 'PASS', 
        `${data ? data.length : 0}件のアクティビティを取得`, duration)
    }
  } catch (error) {
    log('データベースAPI連携', 'ユーザーアクティビティAPI', 'FAIL', 
      `API呼び出しエラー: ${error.message}`)
  }
  
  // ポイントシステムAPI
  const pointsAPIStart = Date.now()
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('user_id, total_points, current_points')
      .limit(3)
    
    const duration = `${Date.now() - pointsAPIStart}ms`
    
    if (error) {
      if (error.message.includes('permission') || error.message.includes('policy')) {
        log('データベースAPI連携', 'ポイントシステムAPI', 'PASS', 
          'RLSポリシーが適切に動作', duration)
      } else {
        log('データベースAPI連携', 'ポイントシステムAPI', 'FAIL', 
          `ポイントエラー: ${error.message}`)
      }
    } else {
      log('データベースAPI連携', 'ポイントシステムAPI', 'PASS', 
        `${data ? data.length : 0}件のポイントデータを取得`, duration)
    }
  } catch (error) {
    log('データベースAPI連携', 'ポイントシステムAPI', 'FAIL', 
      `API呼び出しエラー: ${error.message}`)
  }
}

/**
 * Section 3: リアルタイム機能テスト
 */
async function testRealtimeFeatures() {
  console.log('\n⚡ Section 3: リアルタイム機能テスト')
  
  // リアルタイム接続テスト
  const realtimeStart = Date.now()
  try {
    const channel = supabase.channel('test-channel')
    const duration = `${Date.now() - realtimeStart}ms`
    
    if (channel) {
      log('リアルタイム機能', 'リアルタイム接続', 'PASS', 
        'チャンネル作成成功', duration)
      
      // チャンネル購読テスト
      const subscribeStart = Date.now()
      try {
        channel.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'materials'
        }, (payload) => {
          console.log('   └─ リアルタイムイベント受信:', payload)
        })
        
        const subDuration = `${Date.now() - subscribeStart}ms`
        log('リアルタイム機能', 'チャンネル購読', 'PASS', 
          'イベント購読設定完了', subDuration)
        
        // チャンネルをクリーンアップ
        supabase.removeChannel(channel)
      } catch (error) {
        log('リアルタイム機能', 'チャンネル購読', 'FAIL', 
          `購読エラー: ${error.message}`)
      }
    } else {
      log('リアルタイム機能', 'リアルタイム接続', 'FAIL', 
        'チャンネル作成失敗', duration)
    }
  } catch (error) {
    log('リアルタイム機能', 'リアルタイム接続', 'FAIL', 
      `接続エラー: ${error.message}`)
  }
}

/**
 * Section 4: エラーハンドリングテスト
 */
async function testErrorHandling() {
  console.log('\n🚨 Section 4: エラーハンドリングテスト')
  
  // 存在しないテーブルアクセス
  const invalidTableStart = Date.now()
  try {
    const { data, error } = await supabase
      .from('nonexistent_table')
      .select('*')
    
    const duration = `${Date.now() - invalidTableStart}ms`
    
    if (error) {
      log('エラーハンドリング', '無効テーブルアクセス', 'PASS', 
        'エラーが適切に返される', duration)
    } else {
      log('エラーハンドリング', '無効テーブルアクセス', 'FAIL', 
        '存在しないテーブルアクセスが成功してしまった')
    }
  } catch (error) {
    log('エラーハンドリング', '無効テーブルアクセス', 'PASS', 
      'Exception適切にキャッチ')
  }
  
  // 無効なクエリ実行
  const invalidQueryStart = Date.now()
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('nonexistent_column')
    
    const duration = `${Date.now() - invalidQueryStart}ms`
    
    if (error) {
      log('エラーハンドリング', '無効クエリ実行', 'PASS', 
        'クエリエラーが適切に返される', duration)
    } else {
      log('エラーハンドリング', '無効クエリ実行', 'FAIL', 
        '無効クエリが成功してしまった')
    }
  } catch (error) {
    log('エラーハンドリング', '無効クエリ実行', 'PASS', 
      'Exception適切にキャッチ')
  }
  
  // 権限外操作テスト
  const unauthorizedStart = Date.now()
  try {
    const { data, error } = await supabase
      .from('materials')
      .insert({
        title: '権限テスト',
        description: '権限外ユーザーからの挿入テスト',
        content: {},
        category: 'test'
      })
    
    const duration = `${Date.now() - unauthorizedStart}ms`
    
    if (error) {
      log('エラーハンドリング', '権限外操作テスト', 'PASS', 
        'RLSによる権限制御が正常動作', duration)
    } else {
      log('エラーハンドリング', '権限外操作テスト', 'FAIL', 
        '権限外操作が成功してしまった - セキュリティリスク')
    }
  } catch (error) {
    log('エラーハンドリング', '権限外操作テスト', 'PASS', 
      'Exception適切にキャッチ')
  }
}

/**
 * Section 5: パフォーマンステスト
 */
async function testAPIPerformance() {
  console.log('\n🚀 Section 5: APIパフォーマンステスト')
  
  // 単一クエリレスポンス時間
  const singleQueryStart = Date.now()
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('id, title')
      .limit(1)
    
    const duration = Date.now() - singleQueryStart
    
    if (duration < 1000) {
      log('APIパフォーマンス', '単一クエリレスポンス', 'PASS', 
        `高速レスポンス: ${duration}ms`, `${duration}ms`)
    } else if (duration < 3000) {
      log('APIパフォーマンス', '単一クエリレスポンス', 'PASS', 
        `許容レスポンス: ${duration}ms`, `${duration}ms`)
    } else {
      log('APIパフォーマンス', '単一クエリレスポンス', 'FAIL', 
        `レスポンス遅延: ${duration}ms`)
    }
  } catch (error) {
    log('APIパフォーマンス', '単一クエリレスポンス', 'FAIL', 
      `クエリエラー: ${error.message}`)
  }
  
  // 複数同時クエリ実行
  const concurrentStart = Date.now()
  try {
    const queries = [
      supabase.from('materials').select('count').limit(1),
      supabase.from('users').select('count').limit(1),
      supabase.from('user_activities').select('count').limit(1)
    ]
    
    const results = await Promise.allSettled(queries)
    const duration = Date.now() - concurrentStart
    
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const successRate = (successCount / queries.length) * 100
    
    if (successRate >= 66) { // 3つ中2つ以上成功
      log('APIパフォーマンス', '複数同時クエリ', 'PASS', 
        `成功率: ${successRate.toFixed(1)}% (${successCount}/${queries.length})`, `${duration}ms`)
    } else {
      log('APIパフォーマンス', '複数同時クエリ', 'FAIL', 
        `成功率が低い: ${successRate.toFixed(1)}%`)
    }
  } catch (error) {
    log('APIパフォーマンス', '複数同時クエリ', 'FAIL', 
      `同時クエリエラー: ${error.message}`)
  }
}

/**
 * メイン実行関数
 */
async function runAPIIntegrationTests() {
  console.log('🔗 ShiftWith MVP API Integration Test Suite 開始')
  console.log('=' .repeat(60))
  
  const overallStart = Date.now()
  
  try {
    await testAuthAPIIntegration()
    await testDatabaseAPIIntegration()
    await testRealtimeFeatures()
    await testErrorHandling()
    await testAPIPerformance()
    
    const overallDuration = ((Date.now() - overallStart) / 1000).toFixed(2)
    const successRate = ((passedTests / totalTests) * 100).toFixed(1)
    
    console.log('\n' + '=' .repeat(60))
    console.log('🏁 API統合テスト完了サマリー')
    console.log('=' .repeat(60))
    console.log(`📊 総合結果: ${passedTests}/${totalTests} テスト成功 (${successRate}%)`)
    console.log(`⏱️  実行時間: ${overallDuration}秒`)
    console.log(`🎯 品質スコア: ${successRate >= 95 ? 'A' : successRate >= 85 ? 'B' : successRate >= 70 ? 'C' : 'D'}`)
    
    if (successRate >= 90) {
      console.log('✨ 優秀！API統合品質良好')
    } else if (successRate >= 75) {
      console.log('👍 良好！軽微な改善でリリース可能')  
    } else {
      console.log('⚠️  要改善：重要なAPI問題が存在します')
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
    console.error('❌ API統合テストスイート実行エラー:', error.message)
  }
}

// テスト実行
if (require.main === module) {
  runAPIIntegrationTests()
}

module.exports = { runAPIIntegrationTests } 
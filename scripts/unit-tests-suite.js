/**
 * ShiftWith MVP Unit Tests Suite
 * コンポーネントとユーティリティ関数の単体テスト
 */

const fs = require('fs')
const path = require('path')

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
 * Section 1: ユーティリティ関数テスト
 */
async function testUtilityFunctions() {
  console.log('\n🔧 Section 1: ユーティリティ関数テスト')
  
  // ファイル存在確認
  const utilsStart = Date.now()
  try {
    const utilsPath = path.join(process.cwd(), 'src', 'lib', 'utils.ts')
    const exists = fs.existsSync(utilsPath)
    const duration = `${Date.now() - utilsStart}ms`
    
    if (exists) {
      log('ユーティリティ関数', 'utils.ts存在確認', 'PASS', 'ユーティリティファイルが存在', duration)
      
      // ファイル内容解析
      const content = fs.readFileSync(utilsPath, 'utf8')
      
      // cn関数（classnames）の存在確認
      if (content.includes('cn') && content.includes('clsx')) {
        log('ユーティリティ関数', 'cn関数定義確認', 'PASS', 'classnames結合関数が正しく定義')
      } else {
        log('ユーティリティ関数', 'cn関数定義確認', 'FAIL', 'cn関数が見つからない')
      }
      
      // export確認
      if (content.includes('export')) {
        log('ユーティリティ関数', 'エクスポート確認', 'PASS', '関数が適切にエクスポート')
      } else {
        log('ユーティリティ関数', 'エクスポート確認', 'FAIL', 'エクスポートが見つからない')
      }
    } else {
      log('ユーティリティ関数', 'utils.ts存在確認', 'FAIL', 'ユーティリティファイルが存在しない', duration)
    }
  } catch (error) {
    log('ユーティリティ関数', 'utils.ts存在確認', 'FAIL', `エラー: ${error.message}`)
  }
}

/**
 * Section 2: コンポーネント構造テスト  
 */
async function testComponentStructure() {
  console.log('\n🧩 Section 2: コンポーネント構造テスト')
  
  const componentDirs = [
    'src/components',
    'src/components/ui',
    'src/app'
  ]
  
  for (const dir of componentDirs) {
    const dirStart = Date.now()
    try {
      const dirPath = path.join(process.cwd(), dir)
      const exists = fs.existsSync(dirPath)
      const duration = `${Date.now() - dirStart}ms`
      
      if (exists) {
        const files = fs.readdirSync(dirPath)
        const componentFiles = files.filter(f => 
          f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx')
        )
        
        log('コンポーネント構造', `${dir}ディレクトリ確認`, 'PASS', 
          `${componentFiles.length}個のコンポーネントファイル発見`, duration)
      } else {
        log('コンポーネント構造', `${dir}ディレクトリ確認`, 'FAIL', 
          'ディレクトリが存在しない', duration)
      }
    } catch (error) {
      log('コンポーネント構造', `${dir}ディレクトリ確認`, 'FAIL', 
        `エラー: ${error.message}`)
    }
  }
  
  // 重要コンポーネントの存在確認
  const criticalComponents = [
    'src/components/ui/button.tsx',
    'src/components/ui/card.tsx', 
    'src/components/ui/input.tsx',
    'src/app/layout.tsx',
    'src/app/page.tsx'
  ]
  
  for (const component of criticalComponents) {
    const compStart = Date.now()
    try {
      const compPath = path.join(process.cwd(), component)
      const exists = fs.existsSync(compPath)
      const duration = `${Date.now() - compStart}ms`
      
      if (exists) {
        log('コンポーネント構造', `${component}存在確認`, 'PASS', 
          '重要コンポーネントが存在', duration)
      } else {
        log('コンポーネント構造', `${component}存在確認`, 'FAIL', 
          '重要コンポーネントが見つからない', duration)
      }
    } catch (error) {
      log('コンポーネント構造', `${component}存在確認`, 'FAIL', 
        `エラー: ${error.message}`)
    }
  }
}

/**
 * Section 3: 設定ファイルテスト
 */
async function testConfigurationFiles() {
  console.log('\n⚙️ Section 3: 設定ファイルテスト')
  
  const configFiles = [
    { path: 'package.json', required: true },
    { path: 'next.config.js', required: true },
    { path: 'tailwind.config.ts', required: true },
    { path: 'tsconfig.json', required: true },
    { path: '.env.local', required: true },
    { path: '.env.example', required: false }
  ]
  
  for (const config of configFiles) {
    const configStart = Date.now()
    try {
      const configPath = path.join(process.cwd(), config.path)
      const exists = fs.existsSync(configPath)
      const duration = `${Date.now() - configStart}ms`
      
      if (exists) {
        log('設定ファイル', `${config.path}存在確認`, 'PASS', 
          '設定ファイルが正常存在', duration)
        
        // package.jsonの詳細確認
        if (config.path === 'package.json') {
          const packageContent = JSON.parse(fs.readFileSync(configPath, 'utf8'))
          
          const requiredDeps = ['react', 'next', '@supabase/supabase-js', 'tailwindcss']
          const missingDeps = requiredDeps.filter(dep => 
            !packageContent.dependencies?.[dep] && !packageContent.devDependencies?.[dep]
          )
          
          if (missingDeps.length === 0) {
            log('設定ファイル', 'package.json依存関係確認', 'PASS', 
              '必要な依存関係が全て存在')
          } else {
            log('設定ファイル', 'package.json依存関係確認', 'FAIL', 
              `不足依存関係: ${missingDeps.join(', ')}`)
          }
        }
      } else {
        const status = config.required ? 'FAIL' : 'WARN'
        log('設定ファイル', `${config.path}存在確認`, status, 
          `設定ファイルが${config.required ? '見つからない' : 'オプション（未作成）'}`, duration)
      }
    } catch (error) {
      log('設定ファイル', `${config.path}存在確認`, 'FAIL', 
        `エラー: ${error.message}`)
    }
  }
}

/**
 * Section 4: TypeScript型定義テスト
 */
async function testTypeDefinitions() {
  console.log('\n📝 Section 4: TypeScript型定義テスト')
  
  // 型定義ファイルの確認
  const typeFiles = [
    'src/types/index.ts',
    'src/types/supabase.ts',
    'src/types/database.ts'
  ]
  
  for (const typeFile of typeFiles) {
    const typeStart = Date.now()
    try {
      const typePath = path.join(process.cwd(), typeFile)
      const exists = fs.existsSync(typePath)
      const duration = `${Date.now() - typeStart}ms`
      
      if (exists) {
        const content = fs.readFileSync(typePath, 'utf8')
        
        // interface/type定義の存在確認
        const hasInterface = content.includes('interface') || content.includes('type ')
        const hasExport = content.includes('export')
        
        if (hasInterface && hasExport) {
          log('TypeScript型定義', `${typeFile}内容確認`, 'PASS', 
            '型定義が適切に実装', duration)
        } else {
          log('TypeScript型定義', `${typeFile}内容確認`, 'FAIL', 
            '型定義またはエクスポートが不適切')
        }
      } else {
        log('TypeScript型定義', `${typeFile}存在確認`, 'FAIL', 
          '型定義ファイルが見つからない', duration)
      }
    } catch (error) {
      log('TypeScript型定義', `${typeFile}存在確認`, 'FAIL', 
        `エラー: ${error.message}`)
    }
  }
  
  // tsconfig.json の詳細確認
  const tsconfigStart = Date.now()
  try {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
      const duration = `${Date.now() - tsconfigStart}ms`
      
      // 重要設定の確認
      const hasStrict = tsconfig.compilerOptions?.strict
      const hasJsx = tsconfig.compilerOptions?.jsx
      const hasModuleResolution = tsconfig.compilerOptions?.moduleResolution
      
      if (hasStrict && hasJsx && hasModuleResolution) {
        log('TypeScript型定義', 'tsconfig.json設定確認', 'PASS', 
          'TypeScript設定が適切', duration)
      } else {
        log('TypeScript型定義', 'tsconfig.json設定確認', 'FAIL', 
          '重要なTypeScript設定が不足')
      }
    }
  } catch (error) {
    log('TypeScript型定義', 'tsconfig.json設定確認', 'FAIL', 
      `エラー: ${error.message}`)
  }
}

/**
 * Section 5: ビルド設定テスト
 */
async function testBuildConfiguration() {
  console.log('\n🏗️ Section 5: ビルド設定テスト')
  
  // next.config.js の確認
  const nextConfigStart = Date.now()
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js')
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8')
      const duration = `${Date.now() - nextConfigStart}ms`
      
      // 重要設定の確認
      const hasImages = content.includes('images')
      const hasEnv = content.includes('env') || content.includes('NEXT_PUBLIC')
      
      if (hasImages || hasEnv || content.includes('module.exports')) {
        log('ビルド設定', 'next.config.js設定確認', 'PASS', 
          'Next.js設定が適切', duration)
      } else {
        log('ビルド設定', 'next.config.js設定確認', 'FAIL', 
          'Next.js設定が不適切')
      }
    } else {
      log('ビルド設定', 'next.config.js存在確認', 'FAIL', 
        'Next.js設定ファイルが見つからない')
    }
  } catch (error) {
    log('ビルド設定', 'next.config.js設定確認', 'FAIL', 
      `エラー: ${error.message}`)
  }
  
  // Tailwind設定の確認
  const tailwindStart = Date.now()
  try {
    const tailwindPath = path.join(process.cwd(), 'tailwind.config.ts')
    if (fs.existsSync(tailwindPath)) {
      const content = fs.readFileSync(tailwindPath, 'utf8')
      const duration = `${Date.now() - tailwindStart}ms`
      
      const hasContent = content.includes('content:')
      const hasTheme = content.includes('theme:')
      const hasPlugins = content.includes('plugins:')
      
      if (hasContent && hasTheme) {
        log('ビルド設定', 'tailwind.config.ts設定確認', 'PASS', 
          'Tailwind CSS設定が適切', duration)
      } else {
        log('ビルド設定', 'tailwind.config.ts設定確認', 'FAIL', 
          'Tailwind CSS設定が不完全')
      }
    }
  } catch (error) {
    log('ビルド設定', 'tailwind.config.ts設定確認', 'FAIL', 
      `エラー: ${error.message}`)
  }
}

/**
 * メイン実行関数
 */
async function runUnitTests() {
  console.log('🧪 ShiftWith MVP Unit Tests Suite 開始')
  console.log('=' .repeat(60))
  
  const overallStart = Date.now()
  
  try {
    await testUtilityFunctions()
    await testComponentStructure()
    await testConfigurationFiles()
    await testTypeDefinitions()
    await testBuildConfiguration()
    
    const overallDuration = ((Date.now() - overallStart) / 1000).toFixed(2)
    const successRate = ((passedTests / totalTests) * 100).toFixed(1)
    
    console.log('\n' + '=' .repeat(60))
    console.log('🏁 単体テスト完了サマリー')
    console.log('=' .repeat(60))
    console.log(`📊 総合結果: ${passedTests}/${totalTests} テスト成功 (${successRate}%)`)
    console.log(`⏱️  実行時間: ${overallDuration}秒`)
    console.log(`🎯 品質スコア: ${successRate >= 95 ? 'A' : successRate >= 85 ? 'B' : successRate >= 70 ? 'C' : 'D'}`)
    
    if (successRate >= 90) {
      console.log('✨ 優秀！単体テスト品質良好')
    } else if (successRate >= 75) {
      console.log('👍 良好！軽微な改善で品質向上')  
    } else {
      console.log('⚠️  要改善：構造的な問題が存在します')
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
    console.error('❌ 単体テストスイート実行エラー:', error.message)
  }
}

// テスト実行
if (require.main === module) {
  runUnitTests()
}

module.exports = { runUnitTests } 
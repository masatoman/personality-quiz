#!/usr/bin/env node

/**
 * 拡張Supabaseヘルスチェックスクリプト
 * 包括的な診断とレポート生成
 */

const { createClient } = require('@supabase/supabase-js');

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

async function enhancedHealthCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  console.log('🔍 拡張Supabaseヘルスチェック開始...');
  console.log(`📅 実行時刻: ${results.timestamp}`);
  console.log(`🌍 環境: ${results.environment}`);
  console.log('');

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // チェック1: 基本接続テスト
    console.log('1️⃣ 基本接続テスト...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('materials')
      .select('count', { count: 'exact', head: true });
    
    results.checks.connection = {
      name: '基本接続',
      success: !connectionError,
      error: connectionError?.message || null,
      data: connectionTest || 0
    };
    
    if (connectionError) {
      console.log('❌ 基本接続失敗:', connectionError.message);
    } else {
      console.log('✅ 基本接続成功');
    }

    // チェック2: 教材データ取得テスト
    console.log('2️⃣ 教材データ取得テスト...');
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('id, title, is_published')
      .limit(5);
    
    results.checks.materials = {
      name: '教材データ取得',
      success: !materialsError,
      error: materialsError?.message || null,
      count: materials?.length || 0,
      sample: materials?.slice(0, 3) || []
    };
    
    if (materialsError) {
      console.log('❌ 教材データ取得失敗:', materialsError.message);
    } else {
      console.log(`✅ 教材データ取得成功 (${materials?.length || 0}件)`);
    }

    // チェック3: 公開教材テスト
    console.log('3️⃣ 公開教材テスト...');
    const { data: publishedMaterials, error: publishedError } = await supabase
      .from('materials')
      .select('id, title')
      .eq('is_published', true)
      .limit(5);
    
    results.checks.publishedMaterials = {
      name: '公開教材取得',
      success: !publishedError,
      error: publishedError?.message || null,
      count: publishedMaterials?.length || 0
    };
    
    if (publishedError) {
      console.log('❌ 公開教材取得失敗:', publishedError.message);
    } else {
      console.log(`✅ 公開教材取得成功 (${publishedMaterials?.length || 0}件)`);
    }

    // チェック4: プロフィールテーブルテスト
    console.log('4️⃣ プロフィールテーブルテスト...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    results.checks.profiles = {
      name: 'プロフィールテーブル',
      success: !profilesError,
      error: profilesError?.message || null,
      count: profiles || 0
    };
    
    if (profilesError) {
      console.log('❌ プロフィールテーブル失敗:', profilesError.message);
    } else {
      console.log('✅ プロフィールテーブル成功');
    }

    // チェック5: レスポンス時間テスト
    console.log('5️⃣ レスポンス時間テスト...');
    const startTime = Date.now();
    const { data: responseTest, error: responseError } = await supabase
      .from('materials')
      .select('id')
      .limit(1);
    const responseTime = Date.now() - startTime;
    
    results.checks.responseTime = {
      name: 'レスポンス時間',
      success: !responseError && responseTime < 5000, // 5秒以内
      error: responseError?.message || null,
      responseTime: responseTime,
      threshold: 5000
    };
    
    if (responseError) {
      console.log('❌ レスポンス時間テスト失敗:', responseError.message);
    } else if (responseTime > 5000) {
      console.log(`⚠️ レスポンス時間が遅い: ${responseTime}ms`);
    } else {
      console.log(`✅ レスポンス時間正常: ${responseTime}ms`);
    }

  } catch (error) {
    console.error('❌ ヘルスチェック中に予期しないエラー:', error.message);
    results.error = error.message;
  }

  // 結果集計
  results.summary.total = Object.keys(results.checks).length;
  results.summary.passed = Object.values(results.checks).filter(check => check.success).length;
  results.summary.failed = results.summary.total - results.summary.passed;

  // 結果表示
  console.log('');
  console.log('📊 ヘルスチェック結果サマリー');
  console.log('=' * 50);
  console.log(`✅ 成功: ${results.summary.passed}/${results.summary.total}`);
  console.log(`❌ 失敗: ${results.summary.failed}/${results.summary.total}`);
  console.log(`📈 成功率: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

  // 失敗したチェックの詳細表示
  const failedChecks = Object.entries(results.checks)
    .filter(([key, check]) => !check.success)
    .map(([key, check]) => `${check.name}: ${check.error}`);

  if (failedChecks.length > 0) {
    console.log('');
    console.log('❌ 失敗したチェック:');
    failedChecks.forEach(check => console.log(`  - ${check}`));
  }

  // 推奨事項
  console.log('');
  if (results.summary.failed > 0) {
    console.log('🚨 推奨事項:');
    console.log('  - Supabaseプロジェクトの状態を確認してください');
    console.log('  - 環境変数が正しく設定されているか確認してください');
    console.log('  - RLSポリシーが適切に設定されているか確認してください');
  } else {
    console.log('🎉 すべてのチェックが成功しました！');
  }

  // 結果をJSONとして出力（GitHub Actions用）
  console.log('');
  console.log('📋 詳細結果:');
  console.log(JSON.stringify(results, null, 2));

  return results.summary.failed === 0;
}

// メイン実行
if (require.main === module) {
  enhancedHealthCheck()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 予期しないエラー:', error);
      process.exit(1);
    });
}

module.exports = { enhancedHealthCheck };

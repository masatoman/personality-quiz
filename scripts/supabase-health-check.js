#!/usr/bin/env node

/**
 * Supabaseヘルスチェックスクリプト
 * 定期的にSupabaseプロジェクトにアクセスして一時停止を防ぐ
 */

const { createClient } = require('@supabase/supabase-js');

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

async function healthCheck() {
  try {
    console.log('🔍 Supabaseヘルスチェック開始...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // シンプルなクエリで接続テスト
    const { data, error } = await supabase
      .from('materials')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ ヘルスチェック失敗:', error.message);
      return false;
    }
    
    console.log('✅ ヘルスチェック成功 - 接続正常');
    console.log(`📊 教材数: ${data || 0}`);
    return true;
    
  } catch (error) {
    console.error('❌ ヘルスチェック中にエラー:', error.message);
    return false;
  }
}

// メイン実行
if (require.main === module) {
  healthCheck()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 予期しないエラー:', error);
      process.exit(1);
    });
}

module.exports = { healthCheck };

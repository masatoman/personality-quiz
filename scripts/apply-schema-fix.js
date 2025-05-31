const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase設定が不完全です。環境変数を確認してください。');
  process.exit(1);
}

console.log('Supabase接続中...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  try {
    console.log('マイグレーションファイルを読み込み中...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250531000000_fix_database_schema.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('スキーマ修正を実行中...');
    
    // SQLを分割して実行（ポリシー作成などでエラーが発生する可能性があるため）
    const statements = migration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            // ポリシーやインデックスの重複エラーは無視
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key') ||
                error.message.includes('already exists')) {
              console.log('スキップ (既存):', statement.substring(0, 50) + '...');
            } else {
              console.error('エラー:', error.message);
              console.error('ステートメント:', statement.substring(0, 100) + '...');
              errorCount++;
            }
          } else {
            successCount++;
            console.log('成功:', statement.substring(0, 50) + '...');
          }
        } catch (e) {
          console.error('実行エラー:', e.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n結果: 成功 ${successCount}, エラー ${errorCount}`);
    
    // テーブル確認
    console.log('\nテーブル確認中...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.error('テーブル確認エラー:', tableError);
    } else {
      console.log('作成されたテーブル:', tables.map(t => t.table_name).sort());
    }
    
  } catch (error) {
    console.error('マイグレーション失敗:', error);
    process.exit(1);
  }
}

// RPCファンクションが存在しない場合のフォールバック
async function createExecSqlFunction() {
  try {
    console.log('exec_sql関数を作成中...');
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    if (error && error.message.includes('function exec_sql(sql text) does not exist')) {
      console.log('exec_sql関数が存在しないため、直接実行を試行します...');
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const hasExecSql = await createExecSqlFunction();
  
  if (!hasExecSql) {
    console.log('直接SQLの実行はサポートされていません。');
    console.log('Supabase Dashboard (https://app.supabase.com) のSQL Editorで手動実行してください。');
    console.log('\nマイグレーションファイル: supabase/migrations/20250531000000_fix_database_schema.sql');
    return;
  }
  
  await applySchema();
}

main().catch(console.error); 
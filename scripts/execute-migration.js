const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function executeMigration() {
  try {
    console.log('🔧 データベースマイグレーション実行開始...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // マイグレーションファイルを読み込み
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250601000000_fix_materials_schema.sql', 'utf8');
    
    console.log('📄 マイグレーションSQL読み込み完了');
    
    // SQLをセクションごとに分割して実行
    const sqlStatements = migrationSQL
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement.trim() + ';');
    
    console.log(`📊 実行予定文: ${sqlStatements.length}件`);
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      if (statement.trim() === ';') continue;
      
      console.log(`⚡ 実行中 ${i+1}/${sqlStatements.length}: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      });
      
      if (error) {
        console.error(`❌ エラー (文${i+1}):`, error);
        // 続行可能なエラーの場合は継続
        if (!error.message.includes('already exists') && 
            !error.message.includes('does not exist')) {
          throw error;
        }
        console.log('⚠️  警告: 既存の構造を検出、スキップして続行');
      }
    }
    
    console.log('✅ マイグレーション完了！');
    
    // 結果確認
    const { data: materials } = await supabase
      .from('materials')
      .select('id, title, difficulty, difficulty_level, status, author_id, user_id')
      .limit(3);
    
    console.log('🔍 更新後のサンプルデータ:');
    materials?.forEach((material, i) => {
      console.log(`${i+1}. ${material.title}`);
      console.log(`   難易度: ${material.difficulty} (レベル: ${material.difficulty_level})`);
      console.log(`   状態: ${material.status}`);
      console.log(`   作者ID: ${material.author_id || material.user_id}`);
    });
    
  } catch (error) {
    console.error('💥 実行エラー:', error.message);
    process.exit(1);
  }
}

executeMigration(); 
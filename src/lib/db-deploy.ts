import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployFunctions() {
  try {
    // SQLファイルの読み込み
    const sqlFilePath = path.join(process.cwd(), 'src/lib/db-functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // SQL文を分割して実行
    const sqlStatements = sqlContent.split(';');
    
    for (const statement of sqlStatements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: trimmedStatement + ';' 
        });
        
        if (error) {
          console.error('SQL実行エラー:', error);
        } else {
          console.log('SQL関数が正常にデプロイされました');
        }
      }
    }
    
    console.log('すべてのSQL関数のデプロイが完了しました');
  } catch (error) {
    console.error('デプロイエラー:', error);
  }
}

// スクリプト実行
deployFunctions(); 
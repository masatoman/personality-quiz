const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase設定が不完全です');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchemaFix() {
  try {
    console.log('スキーマ修正を開始...');
    
    // 1. difficultyカラムを追加
    console.log('1. difficultyカラムを追加中...');
    const { error: addDifficultyError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));`
    });
    
    if (addDifficultyError && !addDifficultyError.message.includes('already exists')) {
      console.error('difficultyカラム追加エラー:', addDifficultyError);
    } else {
      console.log('✓ difficultyカラム追加完了');
    }
    
    // 2. difficulty_levelからdifficultyにデータ移行
    console.log('2. difficulty値の移行中...');
    const { error: migrateDifficultyError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE public.materials 
            SET difficulty = CASE 
              WHEN difficulty_level = 1 THEN 'beginner'
              WHEN difficulty_level = 2 THEN 'beginner'
              WHEN difficulty_level = 3 THEN 'intermediate'
              WHEN difficulty_level = 4 THEN 'advanced'
              WHEN difficulty_level = 5 THEN 'advanced'
              ELSE 'beginner'
            END
            WHERE difficulty IS NULL AND difficulty_level IS NOT NULL;`
    });
    
    if (migrateDifficultyError) {
      console.error('difficulty移行エラー:', migrateDifficultyError);
    } else {
      console.log('✓ difficulty値移行完了');
    }
    
    // 3. author_idの修正（user_idからコピー）
    console.log('3. author_id修正中...');
    const { error: fixAuthorError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE public.materials 
            SET author_id = user_id 
            WHERE author_id IS NULL AND user_id IS NOT NULL;`
    });
    
    if (fixAuthorError) {
      console.error('author_id修正エラー:', fixAuthorError);
    } else {
      console.log('✓ author_id修正完了');
    }
    
    // 4. 追加カラムの作成
    console.log('4. 追加カラム作成中...');
    const additionalColumns = [
      'estimated_time INTEGER DEFAULT 0',
      'status TEXT CHECK (status IN (\'draft\', \'published\')) DEFAULT \'published\'',
      'allow_comments BOOLEAN DEFAULT TRUE',
      'target_audience TEXT[] DEFAULT \'{}\'',
      'prerequisites TEXT',
      'thumbnail_url TEXT',
      'language TEXT DEFAULT \'ja\'',
      'version TEXT DEFAULT \'1.0.0\''
    ];
    
    for (const column of additionalColumns) {
      const { error: columnError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS ${column};`
      });
      
      if (columnError && !columnError.message.includes('already exists')) {
        console.error(`カラム追加エラー (${column}):`, columnError);
      } else {
        console.log(`✓ ${column.split(' ')[0]} カラム追加完了`);
      }
    }
    
    // 5. is_publishedからstatusへの変換
    console.log('5. status値の設定中...');
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE public.materials 
            SET status = CASE 
              WHEN is_published = true THEN 'published'
              ELSE 'draft'
            END
            WHERE status = 'published';`
    });
    
    if (statusError) {
      console.error('status変換エラー:', statusError);
    } else {
      console.log('✓ status値設定完了');
    }
    
    console.log('\n✅ スキーマ修正が完了しました！');
    
    // 結果確認
    const { data: sampleData, error: sampleError } = await supabase
      .from('materials')
      .select('id, user_id, author_id, difficulty_level, difficulty, status')
      .limit(3);
    
    if (sampleError) {
      console.error('確認エラー:', sampleError);
    } else {
      console.log('\n修正後のサンプルデータ:');
      console.table(sampleData);
    }
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

// exec_sql関数がない場合のフォールバック
async function checkExecSql() {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    return !error || !error.message.includes('function exec_sql');
  } catch (e) {
    return false;
  }
}

async function main() {
  const hasExecSql = await checkExecSql();
  
  if (!hasExecSql) {
    console.log('❌ exec_sql関数が利用できません');
    console.log('ℹ️  Supabase Dashboardで手動実行が必要です');
    console.log('📁 ファイル: supabase/migrations/20250601000000_fix_materials_schema.sql');
    return;
  }
  
  await applySchemaFix();
}

main().catch(console.error); 
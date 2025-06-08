const { createClient } = require('@supabase/supabase-js');

/**
 * 🚨 クリティカル修正: 教材公開処理の問題解決
 * 
 * 1. materialsテーブルの構造問題を特定
 * 2. 必要なスキーマ修正を適用
 * 3. 教材作成APIの動作を検証
 */

async function criticalMaterialFix() {
  try {
    console.log('🚨 教材公開処理の緊急修正開始...\n');
    
    // 環境変数確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('❌ Supabase環境変数が設定されていません');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // ステップ1: 現在のテーブル構造を確認
    console.log('📊 ステップ1: materialsテーブル構造確認');
    const { data: sampleMaterial, error: sampleError } = await supabase
      .from('materials')
      .select('*')
      .limit(1);
    
    if (sampleError && sampleError.code === '42P01') {
      console.log('❌ materialsテーブルが存在しません');
      throw new Error('materialsテーブルが見つかりません');
    }
    
    let existingColumns = [];
    if (sampleMaterial && sampleMaterial.length > 0) {
      existingColumns = Object.keys(sampleMaterial[0]);
      console.log('✅ 既存カラム:', existingColumns.join(', '));
    } else {
      console.log('⚠️  テーブルは存在しますが、データがありません');
    }
    
    // ステップ2: 必要なカラムの有無を確認
    console.log('\n📝 ステップ2: 必要カラムの存在確認');
    const requiredColumns = {
      'difficulty': 'TEXT',
      'status': 'TEXT',
      'estimated_time': 'INTEGER',
      'allow_comments': 'BOOLEAN',
      'target_audience': 'TEXT[]',
      'prerequisites': 'TEXT',
      'thumbnail_url': 'TEXT',
      'author_id': 'UUID'
    };
    
    const missingColumns = [];
    for (const [column, type] of Object.entries(requiredColumns)) {
      if (!existingColumns.includes(column)) {
        missingColumns.push({ column, type });
        console.log(`❌ 不足: ${column} (${type})`);
      } else {
        console.log(`✅ 存在: ${column}`);
      }
    }
    
    // ステップ3: 不足カラムを追加
    if (missingColumns.length > 0) {
      console.log('\n🔧 ステップ3: 不足カラムの追加');
      
      for (const { column, type } of missingColumns) {
        let sql = '';
        
        switch (column) {
          case 'difficulty':
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))`;
            break;
          case 'status':
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'published'`;
            break;
          case 'estimated_time':
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 0`;
            break;
          case 'allow_comments':
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT TRUE`;
            break;
          case 'target_audience':
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT '{}'`;
            break;
          case 'prerequisites':
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS prerequisites TEXT`;
            break;
          case 'thumbnail_url':
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`;
            break;
          case 'author_id':
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS author_id UUID`;
            break;
          default:
            sql = `ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS ${column} ${type}`;
        }
        
        console.log(`⚡ 追加中: ${column}...`);
        const { error: alterError } = await supabase.rpc('exec_sql', { sql });
        
        if (alterError) {
          if (alterError.message.includes('already exists')) {
            console.log(`⚠️  ${column} は既に存在します`);
          } else {
            console.error(`❌ ${column} 追加エラー:`, alterError.message);
          }
        } else {
          console.log(`✅ ${column} 追加成功`);
        }
      }
    } else {
      console.log('✅ 全ての必要カラムが存在します');
    }
    
    // ステップ4: 既存データの修正
    console.log('\n🔄 ステップ4: 既存データの修正');
    
    // author_idの修正
    if (existingColumns.includes('user_id') && existingColumns.includes('author_id')) {
      console.log('👤 author_idを修正中...');
      const { error: authorError } = await supabase.rpc('exec_sql', {
        sql: `UPDATE public.materials SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL`
      });
      
      if (authorError) {
        console.error('❌ author_id修正エラー:', authorError.message);
      } else {
        console.log('✅ author_id修正完了');
      }
    }
    
    // difficultyの修正
    if (existingColumns.includes('difficulty_level') && existingColumns.includes('difficulty')) {
      console.log('📊 difficulty値を修正中...');
      const { error: difficultyError } = await supabase.rpc('exec_sql', {
        sql: `UPDATE public.materials 
              SET difficulty = CASE 
                WHEN difficulty_level = 1 THEN 'beginner'
                WHEN difficulty_level = 2 THEN 'beginner'
                WHEN difficulty_level = 3 THEN 'intermediate'
                WHEN difficulty_level = 4 THEN 'advanced'
                WHEN difficulty_level = 5 THEN 'advanced'
                ELSE 'beginner'
              END
              WHERE difficulty IS NULL AND difficulty_level IS NOT NULL`
      });
      
      if (difficultyError) {
        console.error('❌ difficulty修正エラー:', difficultyError.message);
      } else {
        console.log('✅ difficulty修正完了');
      }
    }
    
    // statusの修正
    if (existingColumns.includes('is_published') && existingColumns.includes('status')) {
      console.log('📊 status値を修正中...');
      const { error: statusError } = await supabase.rpc('exec_sql', {
        sql: `UPDATE public.materials 
              SET status = CASE 
                WHEN is_published = true THEN 'published'
                ELSE 'draft'
              END
              WHERE status IS NULL OR status = 'published'`
      });
      
      if (statusError) {
        console.error('❌ status修正エラー:', statusError.message);
      } else {
        console.log('✅ status修正完了');
      }
    }
    
    // ステップ5: 修正結果の確認
    console.log('\n🔍 ステップ5: 修正結果の確認');
    const { data: updatedMaterials, error: checkError } = await supabase
      .from('materials')
      .select('id, title, author_id, user_id, difficulty, difficulty_level, status, is_published')
      .limit(5);
    
    if (checkError) {
      console.error('❌ 確認エラー:', checkError.message);
    } else {
      console.log('✅ 修正後のサンプルデータ:');
      updatedMaterials.forEach((material, i) => {
        console.log(`${i+1}. ${material.title?.substring(0, 30)}...`);
        console.log(`   author_id: ${material.author_id || 'NULL'}`);
        console.log(`   difficulty: ${material.difficulty || 'NULL'} (元: ${material.difficulty_level || 'NULL'})`);
        console.log(`   status: ${material.status || 'NULL'} (元: ${material.is_published || 'NULL'})`);
        console.log('');
      });
    }
    
    // ステップ6: テスト用教材の作成テスト
    console.log('\n🧪 ステップ6: 教材作成テスト');
    const testMaterial = {
      title: 'クリティカル修正テスト教材',
      description: 'スキーマ修正後のテスト用教材',
      content: JSON.stringify({
        sections: [{ type: 'text', title: 'テスト', content: 'これはテストです' }]
      }),
      category: 'test',
      difficulty: 'beginner',
      status: 'draft',
      estimated_time: 15,
      allow_comments: true,
      target_audience: ['テスター'],
      prerequisites: 'なし'
    };
    
    // 最初のユーザーIDを取得（テスト用）
    const { data: firstUser } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (firstUser && firstUser.length > 0) {
      testMaterial.author_id = firstUser[0].id;
    }
    
    const { data: testResult, error: testError } = await supabase
      .from('materials')
      .insert(testMaterial)
      .select();
    
    if (testError) {
      console.error('❌ テスト教材作成エラー:', testError.message);
      console.log('   エラーコード:', testError.code);
      console.log('   詳細:', testError.details);
    } else {
      console.log('✅ テスト教材作成成功:', testResult[0].id);
      
      // テストデータを削除
      await supabase
        .from('materials')
        .delete()
        .eq('id', testResult[0].id);
      console.log('✅ テストデータ削除完了');
    }
    
    console.log('\n🎉 クリティカル修正完了！');
    console.log('教材公開処理が正常に動作するはずです。');
    
  } catch (error) {
    console.error('\n💥 クリティカル修正エラー:', error.message);
    console.log('\n🔍 次のステップ:');
    console.log('1. Supabase Dashboardでmaterialsテーブルの構造を確認');
    console.log('2. 必要に応じて手動でカラムを追加');
    console.log('3. RLS (Row Level Security) ポリシーを確認');
  }
}

// 実行
if (require.main === module) {
  criticalMaterialFix();
}

module.exports = criticalMaterialFix; 
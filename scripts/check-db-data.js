const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  console.log('🔍 データベースのスキーマを確認しています...');

  try {
    // materialsテーブルの構造を確認するため、1件のデータを取得
    console.log('\n📚 materialsテーブルの構造確認:');
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .limit(1);

    if (materialsError) {
      console.error('❌ materials取得エラー:', materialsError);
    } else {
      console.log('✅ materialsテーブル構造:');
      if (materials && materials.length > 0) {
        console.log('   カラム:', Object.keys(materials[0]));
        console.log('   サンプルデータ:', materials[0]);
      } else {
        console.log('   データが存在しません');
      }
    }

    // プロフィールテーブルの確認
    console.log('\n👤 profilesテーブルの確認:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ profiles取得エラー:', profilesError);
    } else {
      console.log('✅ profilesテーブル構造:');
      if (profiles && profiles.length > 0) {
        console.log('   カラム:', Object.keys(profiles[0]));
        console.log('   サンプルデータ:', profiles[0]);
      } else {
        console.log('   データが存在しません');
      }
    }

    // material_sectionsテーブルの確認
    console.log('\n📝 material_sectionsテーブルの確認:');
    const { data: sections, error: sectionsError } = await supabase
      .from('material_sections')
      .select('*')
      .limit(1);

    if (sectionsError) {
      console.error('❌ material_sections取得エラー:', sectionsError);
    } else {
      console.log('✅ material_sectionsテーブル構造:');
      if (sections && sections.length > 0) {
        console.log('   カラム:', Object.keys(sections[0]));
        console.log('   サンプルデータ:', sections[0]);
      } else {
        console.log('   データが存在しません');
      }
    }

    // 簡単なテスト挿入を試行
    console.log('\n🧪 テスト挿入を試行:');
    const testMaterial = {
      title: 'テスト教材',
      description: 'テスト用の教材です',
      content: 'これはテスト教材の内容です。',
      category: 'test',
      author_id: profiles && profiles.length > 0 ? profiles[0].id : null
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('materials')
      .insert(testMaterial)
      .select();

    if (insertError) {
      console.error('❌ テスト挿入エラー:', insertError);
      console.log('   エラーから推測される必要なカラム構造を確認してください');
    } else {
      console.log('✅ テスト挿入成功:', insertResult);
      
      // テストデータを削除
      if (insertResult && insertResult.length > 0) {
        await supabase
          .from('materials')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('   テストデータを削除しました');
      }
    }

  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

checkDatabaseSchema(); 
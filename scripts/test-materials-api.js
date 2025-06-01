const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase設定が不完全です');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Testing Materials API...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// difficulty_levelをDifficultyに変換するヘルパー関数
const convertDifficultyLevelToDifficulty = (difficulty_level) => {
  switch (difficulty_level) {
    case 1:
    case 2:
      return 'beginner';
    case 3:
      return 'intermediate';
    case 4:
    case 5:
      return 'advanced';
    default:
      return 'beginner';
  }
};

async function testGetMaterials() {
  try {
    console.log('📋 教材一覧取得テスト');
    console.log('====================');
    
    // 基本的な一覧取得
    let query = supabase
      .from('materials')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ 教材一覧取得エラー:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  データが見つかりませんでした');
      return false;
    }
    
    console.log(`✅ ${data.length}件の教材を取得`);
    
    // 各教材の情報を表示
    for (const item of data.slice(0, 2)) {
      console.log(`\n📚 教材: ${item.title}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   作者ID: ${item.author_id || item.user_id || '不明'}`);
      console.log(`   難易度レベル: ${item.difficulty_level} → ${convertDifficultyLevelToDifficulty(item.difficulty_level)}`);
      console.log(`   カテゴリ: ${item.category}`);
      console.log(`   公開状態: ${item.is_published ? '公開' : '非公開'}`);
      
      // 作者情報の取得テスト
      const authorId = item.author_id || item.user_id;
      if (authorId) {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', authorId)
          .single();
        
        if (authorError) {
          console.log(`   作者情報: 取得エラー (${authorError.message})`);
        } else if (authorData) {
          console.log(`   作者情報: ${authorData.display_name || authorData.username}`);
        } else {
          console.log(`   作者情報: データなし`);
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
    return false;
  }
}

async function testGetMaterial() {
  try {
    console.log('\n📖 個別教材取得テスト');
    console.log('===================');
    
    // まず教材IDを1つ取得
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('id, title')
      .eq('is_published', true)
      .limit(1);
    
    if (materialsError || !materials || materials.length === 0) {
      console.log('⚠️  テスト用教材が見つかりませんでした');
      return false;
    }
    
    const materialId = materials[0].id;
    console.log(`🎯 テスト対象: ${materials[0].title} (${materialId})`);
    
    // 個別教材の取得
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .single();
    
    if (error) {
      console.error('❌ 教材取得エラー:', error);
      return false;
    }
    
    if (!data) {
      console.log('⚠️  教材データが見つかりませんでした');
      return false;
    }
    
    console.log('✅ 教材データ取得成功');
    console.log(`   タイトル: ${data.title}`);
    console.log(`   説明: ${data.description}`);
    console.log(`   難易度: ${data.difficulty_level} → ${convertDifficultyLevelToDifficulty(data.difficulty_level)}`);
    
    // コンテンツ解析テスト
    if (data.content) {
      try {
        const contentObj = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        if (contentObj.sections && Array.isArray(contentObj.sections)) {
          console.log(`   セクション数: ${contentObj.sections.length}`);
          contentObj.sections.slice(0, 2).forEach((section, index) => {
            console.log(`     ${index + 1}. ${section.title || 'タイトルなし'}`);
          });
        }
      } catch (e) {
        console.log(`   コンテンツ: プレーンテキスト (${data.content.length}文字)`);
      }
    }
    
    // 作者情報テスト
    const authorId = data.author_id || data.user_id;
    if (authorId) {
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', authorId)
        .single();
      
      if (authorError) {
        console.log(`   作者: 取得エラー (${authorError.message})`);
      } else if (authorData) {
        console.log(`   作者: ${authorData.display_name || authorData.username} (${authorData.id})`);
      } else {
        console.log(`   作者: データなし`);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
    return false;
  }
}

async function testDifficultyFiltering() {
  try {
    console.log('\n🎯 難易度フィルタリングテスト');
    console.log('==========================');
    
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    
    for (const difficulty of difficulties) {
      let levelRange = [];
      switch (difficulty) {
        case 'beginner':
          levelRange = [1, 2];
          break;
        case 'intermediate':
          levelRange = [3];
          break;
        case 'advanced':
          levelRange = [4, 5];
          break;
      }
      
      const { data, error } = await supabase
        .from('materials')
        .select('id, title, difficulty_level')
        .eq('is_published', true)
        .in('difficulty_level', levelRange)
        .limit(3);
      
      if (error) {
        console.error(`❌ ${difficulty}フィルタエラー:`, error);
        continue;
      }
      
      console.log(`${difficulty}: ${data?.length || 0}件`);
      if (data && data.length > 0) {
        data.slice(0, 2).forEach(item => {
          console.log(`  - ${item.title} (レベル${item.difficulty_level})`);
        });
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
    return false;
  }
}

async function main() {
  console.log('🚀 Materials API テスト開始\n');
  
  const results = {
    getMaterials: await testGetMaterials(),
    getMaterial: await testGetMaterial(),
    difficultyFiltering: await testDifficultyFiltering()
  };
  
  console.log('\n📊 テスト結果');
  console.log('==============');
  console.log(`教材一覧取得: ${results.getMaterials ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`個別教材取得: ${results.getMaterial ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`難易度フィルタ: ${results.difficultyFiltering ? '✅ 成功' : '❌ 失敗'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n総合結果: ${allPassed ? '✅ 全テスト成功' : '⚠️  一部テスト失敗'}`);
  
  if (allPassed) {
    console.log('\n🎉 修正されたMaterials APIが正常に動作しています！');
  } else {
    console.log('\n⚠️  一部の機能で問題が発生しています。ログを確認してください。');
  }
}

main().catch(console.error); 
const { createClient } = require('@supabase/supabase-js');

async function executeMigrationStepByStep() {
  try {
    console.log('🔧 段階的データベースマイグレーション開始...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('📊 現在の状態を確認中...');
    
    // 1. 現在のテーブル構造確認
    const { data: currentMaterials } = await supabase
      .from('materials')
      .select('id, difficulty, difficulty_level, status, author_id, user_id')
      .limit(3);
    
    console.log('現在のサンプルデータ:');
    currentMaterials?.forEach((item, i) => {
      console.log(`${i+1}. difficulty: ${item.difficulty}, difficulty_level: ${item.difficulty_level}`);
      console.log(`   status: ${item.status}, author_id: ${item.author_id}, user_id: ${item.user_id}`);
    });
    
    // 2. difficultyカラムがstring型の場合、difficulty_levelから変換
    console.log('\n🔄 難易度データの統一実行中...');
    const difficultyConversionResults = [];
    
    for (const material of currentMaterials || []) {
      let newDifficulty = material.difficulty;
      
      // difficulty_levelから変換
      if (!material.difficulty && material.difficulty_level) {
        switch (material.difficulty_level) {
          case 1:
          case 2:
            newDifficulty = 'beginner';
            break;
          case 3:
            newDifficulty = 'intermediate';
            break;
          case 4:
          case 5:
            newDifficulty = 'advanced';
            break;
          default:
            newDifficulty = 'beginner';
        }
        
        // データ更新
        const { error } = await supabase
          .from('materials')
          .update({ difficulty: newDifficulty })
          .eq('id', material.id);
        
        if (error) {
          console.error(`エラー (ID: ${material.id}):`, error);
        } else {
          difficultyConversionResults.push(`${material.id}: ${material.difficulty_level} → ${newDifficulty}`);
        }
      }
    }
    
    console.log('難易度変換結果:');
    difficultyConversionResults.forEach(result => console.log(`  ${result}`));
    
    // 3. author_idの統一
    console.log('\n👤 作者IDの統一実行中...');
    const authorIdResults = [];
    
    for (const material of currentMaterials || []) {
      if (!material.author_id && material.user_id) {
        const { error } = await supabase
          .from('materials')
          .update({ author_id: material.user_id })
          .eq('id', material.id);
        
        if (error) {
          console.error(`作者ID統一エラー (ID: ${material.id}):`, error);
        } else {
          authorIdResults.push(`${material.id}: user_id → author_id`);
        }
      }
    }
    
    console.log('作者ID統一結果:');
    authorIdResults.forEach(result => console.log(`  ${result}`));
    
    // 4. statusフィールドの設定
    console.log('\n📋 公開状態の統一実行中...');
    const statusResults = [];
    
    const { data: materialsForStatus } = await supabase
      .from('materials')
      .select('id, is_published, status');
    
    for (const material of materialsForStatus || []) {
      let newStatus = material.status;
      
      if (!material.status && material.is_published !== undefined) {
        newStatus = material.is_published ? 'published' : 'draft';
        
        const { error } = await supabase
          .from('materials')
          .update({ status: newStatus })
          .eq('id', material.id);
        
        if (error) {
          console.error(`状態統一エラー (ID: ${material.id}):`, error);
        } else {
          statusResults.push(`${material.id}: ${material.is_published} → ${newStatus}`);
        }
      }
    }
    
    console.log('公開状態統一結果:');
    statusResults.forEach(result => console.log(`  ${result}`));
    
    // 5. 最終確認
    console.log('\n✅ マイグレーション完了! 最終状態確認:');
    const { data: finalMaterials } = await supabase
      .from('materials')
      .select('id, title, difficulty, difficulty_level, status, author_id, user_id')
      .limit(5);
    
    finalMaterials?.forEach((item, i) => {
      console.log(`${i+1}. ${item.title?.substring(0, 30)}...`);
      console.log(`   難易度: ${item.difficulty} (レベル: ${item.difficulty_level})`);
      console.log(`   状態: ${item.status}`);
      console.log(`   作者: ${item.author_id || item.user_id}`);
      console.log('');
    });
    
    // 統計情報
    const { data: stats } = await supabase
      .from('materials')
      .select('difficulty, status, author_id')
      .not('author_id', 'is', null);
    
    const difficultyStats = {};
    const statusStats = {};
    let authorCount = 0;
    
    stats?.forEach(item => {
      difficultyStats[item.difficulty] = (difficultyStats[item.difficulty] || 0) + 1;
      statusStats[item.status] = (statusStats[item.status] || 0) + 1;
      if (item.author_id) authorCount++;
    });
    
    console.log('📊 最終統計:');
    console.log('難易度分布:', difficultyStats);
    console.log('状態分布:', statusStats);
    console.log(`作者ID設定済み: ${authorCount}件`);
    
  } catch (error) {
    console.error('💥 実行エラー:', error.message);
    process.exit(1);
  }
}

executeMigrationStepByStep(); 
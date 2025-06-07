const { createClient } = require('@supabase/supabase-js');

async function fixMaterialsData() {
  try {
    console.log('🔧 教材データの問題修正開始...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // 1. 全ての教材データを取得
    console.log('📊 全教材データを取得中...');
    const { data: allMaterials, error: fetchError } = await supabase
      .from('materials')
      .select('*');
    
    if (fetchError) {
      throw new Error(`データ取得エラー: ${fetchError.message}`);
    }
    
    console.log(`取得した教材数: ${allMaterials.length}件`);
    
    // 2. 問題のある教材を特定
    const problemMaterials = allMaterials.filter(material => {
      return !material.author_id ||  // author_idが未設定
             !material.difficulty || // difficultyが未設定  
             material.difficulty === null ||
             typeof material.difficulty === 'number'; // difficultyが数値型
    });
    
    console.log(`問題のある教材: ${problemMaterials.length}件`);
    
    // 3. 修正対象の詳細表示
    problemMaterials.forEach((material, i) => {
      console.log(`${i+1}. ${material.title?.substring(0, 40)}...`);
      console.log(`   ID: ${material.id}`);
      console.log(`   author_id: ${material.author_id} | user_id: ${material.user_id}`);
      console.log(`   difficulty: ${material.difficulty} (${typeof material.difficulty}) | difficulty_level: ${material.difficulty_level}`);
      console.log(`   status設定済み: ${material.status ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // 4. 段階的修正実行
    let fixedCount = 0;
    
    for (const material of problemMaterials) {
      const updates = {};
      
      // author_idの修正
      if (!material.author_id && material.user_id) {
        updates.author_id = material.user_id;
        console.log(`📝 ${material.id}: author_id設定 (${material.user_id})`);
      }
      
      // difficultyの修正（difficulty_levelから変換）
      if (!material.difficulty && material.difficulty_level) {
        let newDifficulty;
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
        updates.difficulty = newDifficulty;
        console.log(`📝 ${material.id}: difficulty設定 (${material.difficulty_level} → ${newDifficulty})`);
      }
      
      // statusの修正
      if (!material.status && material.is_published !== undefined) {
        updates.status = material.is_published ? 'published' : 'draft';
        console.log(`📝 ${material.id}: status設定 (${material.is_published} → ${updates.status})`);
      }
      
      // 更新実行
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('materials')
          .update(updates)
          .eq('id', material.id);
        
        if (updateError) {
          console.error(`❌ 更新エラー (${material.id}):`, updateError.message);
        } else {
          fixedCount++;
          console.log(`✅ ${material.id}: 修正完了`);
        }
      }
    }
    
    console.log(`\n🎉 修正完了: ${fixedCount}件の教材を修正しました`);
    
    // 5. 修正結果の確認
    console.log('\n🔍 修正結果確認中...');
    const { data: fixedMaterials } = await supabase
      .from('materials')
      .select('id, title, difficulty, difficulty_level, status, author_id, user_id')
      .limit(10);
    
    console.log('修正後のサンプルデータ:');
    fixedMaterials.forEach((material, i) => {
      console.log(`${i+1}. ${material.title?.substring(0, 30)}...`);
      console.log(`   難易度: ${material.difficulty} (レベル: ${material.difficulty_level})`);
      console.log(`   状態: ${material.status}`);
      console.log(`   作者ID: ${material.author_id}`);
      console.log('');
    });
    
    // 6. 統計情報
    const { data: statsData } = await supabase
      .from('materials')
      .select('difficulty, status, author_id');
    
    const stats = {
      total: statsData.length,
      withAuthor: statsData.filter(m => m.author_id).length,
      withDifficulty: statsData.filter(m => m.difficulty).length,
      withStatus: statsData.filter(m => m.status).length,
      difficultyBreakdown: {},
      statusBreakdown: {}
    };
    
    statsData.forEach(material => {
      if (material.difficulty) {
        stats.difficultyBreakdown[material.difficulty] = 
          (stats.difficultyBreakdown[material.difficulty] || 0) + 1;
      }
      if (material.status) {
        stats.statusBreakdown[material.status] = 
          (stats.statusBreakdown[material.status] || 0) + 1;
      }
    });
    
    console.log('📊 最終統計:');
    console.log(`総教材数: ${stats.total}`);
    console.log(`作者ID設定済み: ${stats.withAuthor}/${stats.total} (${Math.round(stats.withAuthor/stats.total*100)}%)`);
    console.log(`難易度設定済み: ${stats.withDifficulty}/${stats.total} (${Math.round(stats.withDifficulty/stats.total*100)}%)`);
    console.log(`状態設定済み: ${stats.withStatus}/${stats.total} (${Math.round(stats.withStatus/stats.total*100)}%)`);
    console.log('難易度分布:', stats.difficultyBreakdown);
    console.log('状態分布:', stats.statusBreakdown);
    
    console.log('\n✅ データベーススキーマ修正が完了しました！');
    
  } catch (error) {
    console.error('💥 修正エラー:', error.message);
    process.exit(1);
  }
}

fixMaterialsData(); 
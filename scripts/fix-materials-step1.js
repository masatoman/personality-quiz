const { createClient } = require('@supabase/supabase-js');

async function fixMaterialsStep1() {
  try {
    console.log('🔧 教材データ修正 Step 1: author_id と status の統一');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // 1. 全ての教材データを取得
    console.log('📊 全教材データを取得中...');
    const { data: allMaterials, error: fetchError } = await supabase
      .from('materials')
      .select('id, title, author_id, user_id, status, is_published');
    
    if (fetchError) {
      throw new Error(`データ取得エラー: ${fetchError.message}`);
    }
    
    console.log(`取得した教材数: ${allMaterials.length}件`);
    
    // 2. author_idの修正
    console.log('\n👤 author_idの統一処理...');
    let authorIdFixed = 0;
    
    for (const material of allMaterials) {
      if (!material.author_id && material.user_id) {
        const { error } = await supabase
          .from('materials')
          .update({ author_id: material.user_id })
          .eq('id', material.id);
        
        if (error) {
          console.error(`❌ author_id更新エラー (${material.id}):`, error.message);
        } else {
          authorIdFixed++;
          console.log(`✅ ${material.id}: author_id設定 (${material.user_id})`);
        }
      }
    }
    
    console.log(`author_id修正完了: ${authorIdFixed}件`);
    
    // 3. statusの修正
    console.log('\n📋 status の統一処理...');
    let statusFixed = 0;
    
    for (const material of allMaterials) {
      if (!material.status && material.is_published !== undefined) {
        const newStatus = material.is_published ? 'published' : 'draft';
        
        const { error } = await supabase
          .from('materials')
          .update({ status: newStatus })
          .eq('id', material.id);
        
        if (error) {
          console.error(`❌ status更新エラー (${material.id}):`, error.message);
        } else {
          statusFixed++;
          console.log(`✅ ${material.id}: status設定 (${material.is_published} → ${newStatus})`);
        }
      }
    }
    
    console.log(`status修正完了: ${statusFixed}件`);
    
    // 4. 結果確認
    console.log('\n🔍 修正結果確認...');
    const { data: updatedMaterials } = await supabase
      .from('materials')
      .select('id, title, author_id, user_id, status, is_published')
      .limit(5);
    
    console.log('修正後のサンプルデータ:');
    updatedMaterials?.forEach((material, i) => {
      console.log(`${i+1}. ${material.title?.substring(0, 30)}...`);
      console.log(`   author_id: ${material.author_id} | user_id: ${material.user_id}`);
      console.log(`   status: ${material.status} | is_published: ${material.is_published}`);
      console.log('');
    });
    
    // 5. 統計
    const { data: statsData } = await supabase
      .from('materials')
      .select('author_id, status');
    
    const withAuthor = statsData.filter(m => m.author_id).length;
    const withStatus = statsData.filter(m => m.status).length;
    
    console.log('📊 統計:');
    console.log(`総教材数: ${statsData.length}`);
    console.log(`author_id設定済み: ${withAuthor}/${statsData.length} (${Math.round(withAuthor/statsData.length*100)}%)`);
    console.log(`status設定済み: ${withStatus}/${statsData.length} (${Math.round(withStatus/statsData.length*100)}%)`);
    
    console.log('\n✅ Step 1 完了！');
    
  } catch (error) {
    console.error('💥 Step 1 エラー:', error.message);
    process.exit(1);
  }
}

fixMaterialsStep1(); 
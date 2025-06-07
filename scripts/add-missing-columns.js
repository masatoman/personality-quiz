const { createClient } = require('@supabase/supabase-js');

async function addMissingColumns() {
  try {
    console.log('🔧 materialsテーブルに不足カラムを追加中...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // 現在のテーブル構造を確認
    console.log('📊 現在のテーブル構造確認中...');
    const { data: currentMaterials } = await supabase
      .from('materials')
      .select('*')
      .limit(1);
    
    if (currentMaterials && currentMaterials.length > 0) {
      console.log('現在のカラム:', Object.keys(currentMaterials[0]));
    }
    
    // まず基本的な更新のみ実行（author_idの統一）
    console.log('\n👤 author_idの統一（既存カラムのみ）...');
    
    const { data: allMaterials } = await supabase
      .from('materials')
      .select('id, title, author_id, user_id');
    
    let authorIdFixed = 0;
    
    for (const material of allMaterials) {
      if (!material.author_id && material.user_id) {
        const { error } = await supabase
          .from('materials')
          .update({ author_id: material.user_id })
          .eq('id', material.id);
        
        if (error) {
          console.error(`❌ author_id更新エラー (${material.id.substring(0, 8)}):`, error.message);
        } else {
          authorIdFixed++;
          console.log(`✅ ${material.id.substring(0, 8)}: author_id設定`);
        }
      }
    }
    
    console.log(`\nauthor_id修正完了: ${authorIdFixed}件`);
    
    // データベーススキーマの手動作成が必要なことを伝える
    console.log('\n⚠️  次のステップ:');
    console.log('materialsテーブルに以下のカラムを手動で追加する必要があります:');
    console.log('');
    console.log('ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS difficulty TEXT;');
    console.log('ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'published\';');
    console.log('ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 0;');
    console.log('');
    console.log('これらはSupabaseのSQL Editorで実行してください。');
    
    // 現在の修正状況確認
    console.log('\n🔍 現在の修正状況:');
    const { data: stats } = await supabase
      .from('materials')
      .select('author_id, user_id');
    
    const withAuthor = stats.filter(m => m.author_id).length;
    const total = stats.length;
    
    console.log(`総教材数: ${total}`);
    console.log(`author_id設定済み: ${withAuthor}/${total} (${Math.round(withAuthor/total*100)}%)`);
    
    console.log('\n✅ 実行可能な修正は完了しました！');
    
  } catch (error) {
    console.error('💥 エラー:', error.message);
    console.log('\n🔍 デバッグ情報:');
    console.log('- Supabaseプロジェクトへの接続確認');
    console.log('- materialsテーブルの存在確認');
    console.log('- Row Level Security ポリシーの確認');
  }
}

addMissingColumns(); 
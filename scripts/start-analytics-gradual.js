// 段階的に分析機能を開始するスクリプト
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function startBasicAnalytics() {
  console.log('📊 既存データ活用型分析を開始します\n');

  try {
    // 1. 既存のuser_activitiesテーブルを分析用に活用
    console.log('🔍 Step 1: 既存データの構造確認');
    
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('*')
      .limit(5);
    
    if (activitiesError) {
      console.error('❌ user_activitiesテーブルアクセスエラー:', activitiesError.message);
    } else {
      console.log('✅ user_activitiesテーブル確認完了');
      console.log(`   📈 データ例数: ${activities.length}`);
    }

    // 2. 既存のmaterialsテーブル確認
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('id, title, category, created_at')
      .limit(3);
    
    if (materialsError) {
      console.error('❌ materialsテーブルアクセスエラー:', materialsError.message);
    } else {
      console.log('✅ materialsテーブル確認完了');
      console.log(`   📚 教材数: ${materials.length}`);
    }

    // 3. コメントテーブル確認
    const { data: comments, error: commentsError } = await supabase
      .from('material_comments')
      .select('id, material_id, helpful_count')
      .limit(3);
    
    if (commentsError) {
      console.error('❌ material_commentsテーブルアクセスエラー:', commentsError.message);
    } else {
      console.log('✅ material_commentsテーブル確認完了');
      console.log(`   💬 コメント数: ${comments.length}`);
    }

    console.log('\n🎯 即座に開始可能な分析:');
    console.log('   1. 既存user_activitiesでユーザー行動分析');
    console.log('   2. material_commentsでエンゲージメント分析');
    console.log('   3. materialsテーブルで基本統計');
    
    console.log('\n📝 追加テーブルが必要な高度分析:');
    console.log('   - 詳細な学習進捗トラッキング');
    console.log('   - セッション別の詳細行動ログ');
    console.log('   - A/Bテスト機能');
    
    console.log('\n🔧 次のアクション:');
    console.log('   📊 Choice 1: 既存データで基本分析開始');
    console.log('   🗄️  Choice 2: Supabase Dashboard でテーブル作成');
    console.log('   ⚡ Choice 3: 段階的にテーブル追加');

  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
    console.log('\n🔧 対処法:');
    console.log('   1. .env.local ファイルの設定確認');
    console.log('   2. Supabaseプロジェクトの稼働状況確認');
    console.log('   3. ネットワーク接続確認');
  }
}

startBasicAnalytics();

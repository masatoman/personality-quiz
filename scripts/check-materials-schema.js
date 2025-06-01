const { createClient } = require('@supabase/supabase-js');

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

async function checkSchema() {
  try {
    // materialsテーブルの現在の構造を確認
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching materials:', error);
      return;
    }
    
    console.log('Materials table structure:');
    if (data && data[0]) {
      console.log('Columns:', Object.keys(data[0]));
      console.log('Sample data:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('No data found in materials table');
    }
    
    // materialsテーブルの件数を確認
    const { count, error: countError } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting materials:', countError);
    } else {
      console.log('Total materials count:', count);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSchema(); 